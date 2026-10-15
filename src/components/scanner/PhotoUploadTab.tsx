import React, { useState } from 'react';

export interface PhotoUploadTabProps {
  onImageSelected: (file: File) => void;
  isScanning?: boolean;
  previewUrl?: string | null;
}

export function PhotoUploadTab({ onImageSelected, isScanning, previewUrl: externalPreviewUrl }: PhotoUploadTabProps) {
  const [internalPreviewUrl, setInternalPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = externalPreviewUrl !== undefined ? externalPreviewUrl : internalPreviewUrl;

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setInternalPreviewUrl(url);
      onImageSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging 
            ? 'border-emerald-400 bg-emerald-500/10' 
            : 'border-slate-700 hover:border-emerald-500/50 bg-slate-900/60'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={isScanning}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img 
              src={previewUrl} 
              alt="Equipment preview" 
              className="max-h-48 rounded-xl object-contain border border-slate-700 shadow-md"
            />
            <p className="text-xs text-slate-400">Click or drag a new image to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Upload Gym Equipment Photo</h3>
            <p className="text-xs text-slate-400 mb-4">Drag and drop your image here, or browse files</p>
            <span className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs tracking-wide">
              Select Machine Image
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
