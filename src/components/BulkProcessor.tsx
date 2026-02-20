import { useState, useEffect } from 'react';
import { removeBackground } from '../services/geminiService';
import JSZip from 'jszip';

interface BulkProcessorProps {
  files: File[];
  onClear: () => void;
}

interface ProcessedFile {
  originalName: string;
  originalUrl: string;
  processedUrl: string | null;
  status: 'queued' | 'processing' | 'done' | 'error';
}

export default function BulkProcessor({ files, onClear }: BulkProcessorProps) {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  useEffect(() => {
    const initialFiles = files.map(file => ({
      originalName: file.name,
      originalUrl: URL.createObjectURL(file),
      processedUrl: null,
      status: 'queued' as const,
    }));
    setProcessedFiles(initialFiles);

    const processQueue = async () => {
      for (let i = 0; i < files.length; i++) {
        setProcessedFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'processing' } : f));
        try {
          const resultUrl = await removeBackground(files[i]);
          setProcessedFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'done', processedUrl: resultUrl } : f));
        } catch (error) {
          console.error('Failed to process file:', files[i].name, error);
          setProcessedFiles(prev => prev.map((f, index) => index === i ? { ...f, status: 'error' } : f));
        }
      }
    };

    processQueue();
  }, [files]);

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const successfulFiles = processedFiles.filter(f => f.status === 'done' && f.processedUrl);

    for (const file of successfulFiles) {
        const response = await fetch(file.processedUrl!);
        const blob = await response.blob();
        zip.file(`bg_removed_${file.originalName}`, blob);
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'processed_images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  };

  return (
    <div className="w-full max-w-6xl p-8">
      <h2 className="text-3xl font-bold text-center mb-6">Bulk Processing</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto bg-white p-4 rounded-lg shadow-inner">
        {processedFiles.map((file, index) => (
          <div key={index} className="relative aspect-square border rounded-lg overflow-hidden">
            <img src={file.originalUrl} alt={file.originalName} className="w-full h-full object-cover" />
            {file.status === 'processing' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div></div>}
            {file.status === 'done' && file.processedUrl && <img src={file.processedUrl} alt={`Processed ${file.originalName}`} className="absolute inset-0 w-full h-full object-cover" />}
            {file.status === 'error' && <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center text-white font-bold">Error</div>}
          </div>
        ))}
      </div>
      <div className="mt-6 text-center space-x-4">
        <button onClick={onClear} className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded">Start Over</button>
        <button onClick={handleDownloadAll} disabled={processedFiles.some(f => f.status !== 'done' && f.status !== 'error')} className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">Download All (.zip)</button>
      </div>
    </div>
  );
}
