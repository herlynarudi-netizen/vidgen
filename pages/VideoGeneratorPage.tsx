import React, { useState, useCallback } from 'react';
import { VideoSettingsPanel } from '../components/SettingsPanel';
import { VideoGrid } from '../components/VideoGrid';
import type { GenerationOptions, VideoResult } from '../types';
import { generateSnarkyVideoPrompts, generateIndividualVideo } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';

const NUM_VIDEOS = 4;

interface VideoGeneratorPageProps {
  initialImage?: string | null;
  apiKey: string;
}

export const VideoGeneratorPage: React.FC<VideoGeneratorPageProps> = ({ initialImage, apiKey }) => {
  const [videos, setVideos] = useState<VideoResult[]>(
    Array.from({ length: NUM_VIDEOS }, (_, i) => ({ id: i, url: null, status: 'pending' }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateVideoState = useCallback((index: number, updates: Partial<VideoResult>) => {
    setVideos(currentVideos => 
      currentVideos.map(v => v.id === index ? { ...v, ...updates } : v)
    );
  }, []);

  const handleGenerate = useCallback(async (options: GenerationOptions) => {
    if (!apiKey) {
      setError("Kunci API diperlukan. Silakan masukkan di atas.");
      return;
    }
    if (!options.prompt) {
      setError("Prompt diperlukan.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideos(Array.from({ length: NUM_VIDEOS }, (_, i) => ({ 
      id: i, 
      url: null, 
      status: 'generating', 
      progressMessage: 'Mempersiapkan...' 
    })));

    try {
      updateVideoState(0, { progressMessage: 'Membuat prompt sinis...' });
      const prompts = await generateSnarkyVideoPrompts(options.prompt, apiKey);
       if (prompts.length < NUM_VIDEOS) {
        throw new Error(`Model hanya menghasilkan ${prompts.length} prompt, dibutuhkan ${NUM_VIDEOS}.`);
      }

      let image: { imageBytes: string; mimeType: string } | undefined = undefined;
      if (options.imageFile) {
        updateVideoState(0, { progressMessage: 'Memproses gambar...' });
        const { base64, mimeType } = await fileToBase64(options.imageFile);
        image = { imageBytes: base64, mimeType: mimeType };
      }
      
      // Mengubah ke pembuatan sekuensial untuk keandalan
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        try {
          const onProgress = (message: string) => {
            updateVideoState(i, { progressMessage: `Video ${i + 1}/${NUM_VIDEOS}: ${message}` });
          };
          
          const videoUrl = await generateIndividualVideo(prompt, options, image, onProgress, apiKey);
          updateVideoState(i, { url: videoUrl, status: 'done', progressMessage: 'Selesai.' });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
            updateVideoState(i, { status: 'error', error: errorMessage });
            // Lanjutkan ke video berikutnya bahkan jika yang ini gagal
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
      setError(errorMessage);
      setVideos(Array.from({ length: NUM_VIDEOS }, (_, i) => ({ id: i, url: null, status: 'error', error: errorMessage })));
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, updateVideoState]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 xl:col-span-3">
        <VideoSettingsPanel 
          onGenerate={handleGenerate} 
          isLoading={isLoading} 
          initialImage={initialImage}
        />
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong className="font-bold">Kesalahan: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <VideoGrid videos={videos} />
      </div>
    </div>
  );
};