import React from 'react';
import type { VideoResult } from '../types';
import { VideoCard } from './VideoCard';
import { FilmIcon } from './icons';

interface VideoGridProps {
  videos: VideoResult[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
  const isPending = videos.every(video => video.status === 'pending');

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700 p-12 text-center">
        <FilmIcon className="w-24 h-24 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-300">Video yang Dihasilkan Akan Muncul di Sini</h3>
        <p className="text-gray-500 mt-2">Isi pengaturan dan klik "Hasilkan" untuk membuat seri 4 video.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};
