import React from 'react';
import { CloseIcon } from './icons';

interface PreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Gambar"
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-gray-900 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Mencegah penutupan modal saat mengklik gambar
      >
        <img 
          src={imageUrl} 
          alt="Pratinjau gambar yang dihasilkan" 
          className="object-contain w-full h-full max-h-[90vh] rounded-lg" 
        />
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Tutup pratinjau"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};