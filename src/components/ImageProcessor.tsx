import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { useEffect, useState } from 'react';
import { removeBackground } from '../services/geminiService';
import MagicBrushEditor from './MagicBrushEditor';

interface ImageProcessorProps {
  image: File;
  onClear: () => void;
}

const backgroundColors = [
  { name: 'Transparent', value: 'transparent' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
];

export default function ImageProcessor({ image, onClear }: ImageProcessorProps) {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [isEditing, setIsEditing] = useState(false);

  const originalImageUrl = URL.createObjectURL(image);

  useEffect(() => {
    const processImage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resultUrl = await removeBackground(image);
        setProcessedImageUrl(resultUrl);
      } catch (err) {
        setError('Failed to remove background. Please try another image.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    processImage();
  }, [image]);

  const afterImage = (
    <div className="relative w-full h-full" style={{ backgroundColor }}>
        {isLoading && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )}
        {error && (
            <div className="absolute inset-0 bg-red-100 text-red-700 flex items-center justify-center p-4">
                <p>{error}</p>
            </div>
        )}
        {processedImageUrl && !error && (
            <ReactCompareSliderImage src={processedImageUrl} alt="After" style={{ backgroundColor: 'transparent' }} />
        )}
        {!processedImageUrl && !isLoading && !error && (
             <ReactCompareSliderImage src={originalImageUrl} alt="After" />
        )}
    </div>
  );

  if (isEditing) {
    return (
        <MagicBrushEditor 
            originalImage={originalImageUrl}
            processedImage={processedImageUrl}
            onFinishEditing={(newImage) => {
                setProcessedImageUrl(newImage);
                setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
        />
    )
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 w-full">
      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-6">AI Background Removal</h2>
        <div className="bg-white p-4 rounded-lg shadow-lg aspect-[4/3]">
            <ReactCompareSlider
              itemOne={<ReactCompareSliderImage src={originalImageUrl} alt="Before" />}
              itemTwo={afterImage}
              className="w-full h-full rounded-md overflow-hidden"
            />
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-center mb-4">Change Background</h3>
            <div className="flex justify-center items-center gap-3">
                {backgroundColors.map(bg => (
                    <button 
                        key={bg.name}
                        onClick={() => setBackgroundColor(bg.value)}
                        className={`w-10 h-10 rounded-full border-2 transition-transform ${backgroundColor === bg.value ? 'border-blue-500 scale-110' : 'border-gray-300'}`}
                        style={{ backgroundColor: bg.value === 'transparent' ? undefined : bg.value }}
                        title={bg.name}
                    >
                        {bg.value === 'transparent' && <div className="w-full h-full bg-white rounded-full bg-stripes"></div>}
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-6 text-center space-x-4">
            <button 
                onClick={onClear} 
                className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
            >
                Start Over
            </button>
            <button 
                onClick={() => setIsEditing(true)}
                disabled={isLoading || !!error}
                className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Magic Brush
            </button>
        </div>
      </div>
    </div>
  );
}

