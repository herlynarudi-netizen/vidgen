import React from 'react';
import type { Page } from '../App';
import { ImageIcon, VideoIcon } from './icons';

interface NavigationProps {
  currentPage: Page;
  setPage: (page: Page) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, setPage }) => {
  const getButtonClasses = (page: Page) => {
    const baseClasses = "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500";
    if (currentPage === page) {
      return `${baseClasses} bg-indigo-600 text-white`;
    }
    return `${baseClasses} bg-gray-700/50 text-gray-300 hover:bg-gray-700`;
  };

  return (
    <nav className="flex justify-center items-center p-1.5 bg-gray-800 rounded-lg max-w-md mx-auto mt-8 space-x-2">
      <button onClick={() => setPage('image')} className={getButtonClasses('image')}>
        <ImageIcon className="w-5 h-5" />
        Image Generator
      </button>
      <button onClick={() => setPage('video')} className={getButtonClasses('video')}>
        <VideoIcon className="w-5 h-5" />
        Video Generator
      </button>
    </nav>
  );
};