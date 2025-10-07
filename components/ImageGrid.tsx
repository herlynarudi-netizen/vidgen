import React from 'react';
import type { ImageResult } from '../types';
import { ImageCard } from './ImageCard';
import { ImageIcon } from './icons';

interface ImageGridProps {
  images: ImageResult[];
  onImageSelect: (imageUrl: string) => void;
  onImagePreview: (imageUrl: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageSelect, onImagePreview }) => {

  const isPending = images.every(img => img.status === 'pending');

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-h-[70vh] aspect-video bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700 p-12 text-center">
        <ImageIcon className="w-24 h-24 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-300">Gambar yang Dihasilkan Akan Muncul di Sini</h3>
        <p className="text-gray-500 mt-2">Unggah gambar, berikan prompt, dan klik "Hasilkan" untuk memulai.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onSelect={onImageSelect}
          onPreview={onImagePreview}
        />
      ))}
    </div>
  );
};