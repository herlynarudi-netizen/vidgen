
import React from 'react';
import { DownloadIcon } from './icons';

interface VideoPlayerProps {
  src: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `veo_generated_video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full relative group bg-black">
      <video
        src={src}
        controls
        className="w-full h-full object-contain"
        autoPlay
        loop
        muted
      />
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDownload}
          className="bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Download video"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};