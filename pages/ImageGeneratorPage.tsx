import React, { useState, useCallback } from 'react';
import { ImageSettingsPanel } from '../components/ImageSettingsPanel';
import { ImageGrid } from '../components/ImageGrid';
import type { ImageGenerationOptions, ImageResult } from '../types';
import { generateImages } from '../services/geminiService';
import { PreviewModal } from '../components/PreviewModal';

interface ImageGeneratorPageProps {
  onImageSelect: (imageUrl: string) => void;
  apiKey: string;
}

const NUM_IMAGES = 4; // Kembalikan ke 4 untuk menghasilkan kisi gambar

export const ImageGeneratorPage: React.FC<ImageGeneratorPageProps> = ({ onImageSelect, apiKey }) => {
  const [images, setImages] = useState<ImageResult[]>(
    Array.from({ length: NUM_IMAGES }, (_, i) => ({ id: i, url: null, status: 'pending' }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleGenerate = useCallback(async (options: Omit<ImageGenerationOptions, 'numberOfImages' | 'apiKey'>) => {
    if (!apiKey) {
      setError("Kunci API diperlukan. Silakan masukkan di atas.");
      return;
    }
    if (!options.productImageFile && !options.actorImageFile) {
      setError("Diperlukan setidaknya satu gambar masukan (produk atau aktor).");
      return;
    }

    setIsLoading(true);
    setError(null);
    const generationOptions: ImageGenerationOptions = { 
      ...options, 
      apiKey,
      numberOfImages: NUM_IMAGES,
    };
    setImages(Array.from({ length: generationOptions.numberOfImages }, (_, i) => ({ id: i, url: null, status: 'generating' })));
    
    try {
      const imageUrls = await generateImages(generationOptions);
      
      const newImages: ImageResult[] = Array.from({ length: NUM_IMAGES }, (_, i) => {
        if (imageUrls[i]) {
          return { id: i, url: imageUrls[i], status: 'done' };
        }
        return { id: i, url: null, status: 'error', error: 'Tidak ada gambar yang dikembalikan untuk slot ini.' };
      });
      setImages(newImages);


    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
      setError(errorMessage);
      setImages(Array.from({ length: generationOptions.numberOfImages }, (_, i) => ({ id: i, url: null, status: 'error', error: errorMessage })));
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const handlePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
  };

  const handleClosePreview = () => {
    setPreviewImageUrl(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <ImageSettingsPanel onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6" role="alert">
              <strong className="font-bold">Kesalahan: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <ImageGrid images={images} onImageSelect={onImageSelect} onImagePreview={handlePreview} />
        </div>
      </div>
      {previewImageUrl && (
        <PreviewModal imageUrl={previewImageUrl} onClose={handleClosePreview} />
      )}
    </>
  );
};