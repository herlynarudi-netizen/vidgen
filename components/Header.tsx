
import React from 'react';
import { VideoIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-4 mb-2">
        <VideoIcon className="w-12 h-12 text-indigo-400"/>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
          VEO Video Generator
        </h1>
      </div>
      <p className="text-lg text-gray-400 max-w-3xl mx-auto">
        Bring your ideas to life. Generate a high-quality video from a text prompt and an optional image.
      </p>
    </header>
  );
};