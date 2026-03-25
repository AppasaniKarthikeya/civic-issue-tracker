'use client';

import React, { useCallback, useState, useRef } from 'react';
import { X, Image as ImageIcon, Crop as CropIcon } from 'lucide-react';
import Image from 'next/image';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';
import Button from '@/components/ui/Button';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl?: string;
  onRemove?: () => void;
}

// Center crop helper
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageUpload({ onImageSelect, previewUrl, onRemove }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  
  // Cropping States
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = useCallback(
    (file: File) => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          setImgSrc(reader.result?.toString() || '');
          setIsModalOpen(true);
        });
        reader.readAsDataURL(file);
        // Reset file input so same file can be clicked again
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileProcess(e.dataTransfer.files[0]);
      }
    },
    [handleFileProcess]
  );

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  }

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'cropped.jpeg', { type: 'image/jpeg' });
      
      try {
        // Compress the image to be under 2MB natively
        const options = {
          maxSizeMB: 1.9,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8
        };
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], 'report_image.jpg', { type: 'image/jpeg' });
        
        // Update states and bubble up
        setPreview(URL.createObjectURL(compressedBlob));
        setIsModalOpen(false);
        onImageSelect(compressedFile);
        
      } catch (error) {
        console.error('Compression error:', error);
      }
    }, 'image/jpeg');
  };

  const handleRemove = () => {
    setPreview(null);
    setImgSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemove?.();
  };

  if (preview) {
    return (
      <div className="relative h-48 w-full border border-gray-200 dark:border-zinc-700 overflow-hidden rounded-lg group">
        <Image src={preview} alt="Issue preview" fill className="object-cover" />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm opacity-90 hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer bg-white dark:bg-gray-800 ${
          dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
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
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileProcess(e.target.files[0]);
            }
          }}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <ImageIcon size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tap to capture or click to upload
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Image will be optimized automatically (&lt;2MB)</p>
          </div>
        </div>
      </div>

      {/* React Crop Modal Pipeline */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CropIcon size={20} />
              Crop Image
            </h2>
            
            <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden mb-6 p-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={16 / 9}
                className="max-h-[50vh]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  alt="Crop target"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[50vh] w-auto mx-auto object-contain"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setImgSrc(''); }}>
                Cancel
              </Button>
              <Button type="button" onClick={generateCroppedImage}>
                Apply & Compress
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
