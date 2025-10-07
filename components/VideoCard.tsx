import React from 'react';
import type { VideoResult } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { Loader } from './Loader';
import { ErrorIcon } from './icons';

interface VideoCardProps {
  video: VideoResult;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative border border-gray-700">
        {video.status === 'generating' && (
            <Loader message={video.progressMessage || `Menghasilkan Video...`} />
        )}
        {video.status === 'done' && video.url && (
            <VideoPlayer src={video.url} />
        )}
        {video.status === 'error' && (
            <div className="p-4 text-center text-red-300">
            <ErrorIcon className="w-12 h-12 mx-auto text-red-500 mb-2"/>
            <p className="font-semibold">Pembuatan Gagal</p>
            <p className="text-xs text-red-400 max-w-full break-words">{video.error}</p>
            </div>
        )}
    </div>
  );
};