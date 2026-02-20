import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import Konva from 'konva';

// Custom hook to load an image for Konva
const useImage = (url: string): [HTMLImageElement | undefined, string] => {
  const [image, setImage] = useState<HTMLImageElement>();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.src = url;
    img.crossOrigin = 'Anonymous'; // Handle potential CORS issues
    img.onload = () => {
      setStatus('loaded');
      setImage(img);
    };
    img.onerror = () => setStatus('failed');
  }, [url]);

  return [image, status];
};

interface MagicBrushEditorProps {
  originalImage: string;
  processedImage: string | null;
  onFinishEditing: (newImage: string) => void;
  onCancel: () => void;
}

export default function MagicBrushEditor({ originalImage, processedImage, onFinishEditing, onCancel }: MagicBrushEditorProps) {
  const [tool, setTool] = useState('erase'); // 'erase' or 'restore'
  const [brushSize, setBrushSize] = useState(30);
  const [lines, setLines] = useState<any[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 0, height: 0 });

  const [baseImage, baseImageStatus] = useImage(originalImage);
  const [topImage, topImageStatus] = useImage(processedImage || '');

  useEffect(() => {
    const checkSize = () => {
        if (containerRef.current) {
            const { width } = containerRef.current.getBoundingClientRect();
            const aspectRatio = (baseImage?.height || 3) / (baseImage?.width || 4);
            setStageDimensions({ width, height: width * aspectRatio });
        }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [baseImage]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], brushSize }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleApply = () => {
    if (stageRef.current) {
        // Temporarily hide the base image layer to export only the edited top layer
        const baseLayer = stageRef.current.findOne('#base-layer');
        if (baseLayer) baseLayer.visible(false);

        const dataURL = stageRef.current.toDataURL();
        onFinishEditing(dataURL);

        if (baseLayer) baseLayer.visible(true); // Restore visibility
    }
  };

  const imageLoaded = baseImageStatus === 'loaded' && topImageStatus === 'loaded';

  return (
    <div className="w-full max-w-4xl p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Magic Brush Editor</h2>
      <div ref={containerRef} className="bg-stripes rounded-md overflow-hidden mb-4">
        {!imageLoaded && <div style={{height: stageDimensions.height || 500}} className="flex items-center justify-center">Loading images...</div>}
        {imageLoaded && (
            <Stage
                width={stageDimensions.width}
                height={stageDimensions.height}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                ref={stageRef}
            >
                <Layer id="base-layer">
                    <KonvaImage image={baseImage} width={stageDimensions.width} height={stageDimensions.height} />
                </Layer>
                <Layer>
                    <KonvaImage image={topImage} width={stageDimensions.width} height={stageDimensions.height} />
                    {lines.map((line, i) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke="#000000" // Color doesn't matter for masking
                            strokeWidth={line.brushSize}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation={
                                line.tool === 'erase' ? 'destination-out' : 'destination-over'
                            }
                        />
                    ))}
                </Layer>
            </Stage>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className='flex items-center gap-4'>
            <div className='flex gap-2'>
                <button onClick={() => setTool('erase')} className={`px-3 py-1 rounded ${tool === 'erase' ? 'bg-blue-500' : 'bg-gray-600'}`}>Erase</button>
                <button onClick={() => setTool('restore')} className={`px-3 py-1 rounded ${tool === 'restore' ? 'bg-blue-500' : 'bg-gray-600'}`}>Restore</button>
            </div>
            <div className='flex items-center gap-2'>
                <span>Brush Size:</span>
                <input type="range" min="10" max="80" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
            </div>
        </div>
        <div>
          <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 font-bold py-2 px-4 rounded mr-2">Cancel</button>
          <button onClick={handleApply} className="bg-blue-600 hover:bg-blue-500 font-bold py-2 px-4 rounded">Apply Changes</button>
        </div>
      </div>
    </div>
  );
}
