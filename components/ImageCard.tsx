import React from 'react';
import type { ImageResult } from '../types';
import { Loader } from './Loader';
import { ErrorIcon, UseIcon, PreviewIcon } from './icons';

interface ImageCardProps {
  image: ImageResult;
  onSelect: (imageUrl: string) => void;
  onPreview: (imageUrl: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onSelect, onPreview }) => {
  const handleSelect = () => {
    if (image.url) {
      onSelect(image.url);
    }
  };

  const handlePreview = () => {
    if (image.url) {
      onPreview(image.url);
    }
  };

  return (
    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative group border border-gray-700">
      {image.status === 'generating' && (
        <Loader message="Menghasilkan..." />
      )}
      {image.status === 'done' && image.url && (
        <>
          <img src={image.url} alt={`Generated image ${image.id}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
            <div className="flex flex-col sm:flex-row gap-2">
               <button
                onClick={handlePreview}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                aria-label="Preview this image"
              >
                <PreviewIcon className="w-5 h-5"/>
                Pratinjau
              </button>
              <button
                onClick={handleSelect}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                aria-label="Use this image for video generation"
              >
                <UseIcon className="w-5 h-5"/>
                Gunakan
              </button>
            </div>
          </div>
        </>
      )}
      {image.status === 'error' && (
        <div className="p-2 text-center text-red-300">
          <ErrorIcon className="w-8 h-8 mx-auto text-red-500 mb-1" />
          <p className="text-xs font-semibold">Gagal</p>
        </div>
      )}
    </div>
  );
};