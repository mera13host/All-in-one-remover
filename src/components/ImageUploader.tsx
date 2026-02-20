import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onBulkUpload: (files: File[]) => void;
  mode: 'single' | 'bulk';
}

export default function ImageUploader({ onImageUpload, onBulkUpload, mode }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      if (mode === 'single') {
        onImageUpload(acceptedFiles[0]);
      } else {
        onBulkUpload(acceptedFiles);
      }
    }
  }, [onImageUpload, onBulkUpload, mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: mode === 'bulk'
  });

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8">
      <div {...getRootProps()} className={`w-full max-w-lg border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
        <input {...getInputProps()} />
        <h2 className="text-2xl font-bold mb-4">Upload your image</h2>
        <p className="text-gray-500 mb-4">Drag & drop a file here, or click to select a file</p>
        <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
          Select Image
        </button>
      </div>
    </div>
  );
}

