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
    <div className="w-full mx-auto my-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-3xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging 
            ? 'border-[#22C55E] bg-[#22C55E]/10' 
            : 'border-[#222624] hover:border-[#2C312E] bg-[#141716]'
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
          <div className="flex flex-col items-center gap-2">
            <img 
              src={previewUrl} 
              alt="Equipment preview" 
              className="max-h-48 rounded-2xl object-contain border border-[#222624] shadow-md"
            />
            <p className="text-[11px] text-[#9CA3AF]">Click or drag a new image to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0A0C0B] border border-[#222624] text-[#22C55E] flex items-center justify-center mb-2.5">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-0.5">Upload Machine Photo</h3>
            <p className="text-[11px] text-[#9CA3AF] mb-3">Drag & drop photo or browse library</p>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#22C55E] text-black font-extrabold text-xs tracking-wide">
              Browse Files
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
