'use client';

import React, { useCallback, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl?: string;
  onRemove?: () => void;
}

export default function ImageUpload({ onImageSelect, previewUrl, onRemove }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemove?.();
  };

  if (preview) {
    return (
      <div className="relative">
        <img
          src={preview}
          alt="Issue preview"
          className="w-full h-48 object-cover rounded-lg border border-gray-200"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <ImageIcon size={24} className="text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
        </div>
      </div>
    </div>
  );
}
