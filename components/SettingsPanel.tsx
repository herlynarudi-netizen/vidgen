import React, { useState, useEffect } from 'react';
import type { GenerationOptions } from '../types';
import { UploadIcon, InfoIcon } from './icons';

interface VideoSettingsPanelProps {
  onGenerate: (options: Omit<GenerationOptions, 'apiKey'>) => void;
  isLoading: boolean;
  initialImage?: string | null;
}

// Fungsi utilitas untuk mengonversi URL data menjadi objek File
const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

export const VideoSettingsPanel: React.FC<VideoSettingsPanelProps> = ({ onGenerate, isLoading, initialImage }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  
  useEffect(() => {
    if (initialImage) {
      const file = dataURLtoFile(initialImage, 'generated-reference.png');
      setImageFile(file);
      setImagePreview(initialImage);
    }
  }, [initialImage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
      setImageFile(null);
      setImagePreview(null);
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onGenerate({
      prompt,
      imageFile,
      aspectRatio,
      resolution,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 space-y-6 sticky top-8">
      <div>
        <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-300 mb-2">
          Video Prompt
        </label>
        <textarea
          id="prompt-video"
          rows={5}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
          placeholder="misalnya, Seorang astronot menunggang kuda di Mars, sinematik 4k."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
          Gambar Referensi (Opsional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg relative">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Pratinjau gambar" className="mx-auto h-24 w-auto rounded-md" />
                 <button onClick={handleRemoveImage} type="button" className="text-xs text-red-400 hover:text-red-300">Hapus gambar</button>
              </>
            ) : (
             <>
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <div className="flex text-sm text-gray-500">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500 px-1">
                    <span>Unggah file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                  </label>
                  <p className="pl-1">atau seret dan lepas</p>
                </div>
                <p className="text-xs text-gray-600">PNG, JPG, GIF hingga 10MB</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">Rasio Aspek</label>
          <select id="aspect-ratio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="16:9">16:9 (Lanskap)</option>
            <option value="9:16">9:16 (Potret)</option>
          </select>
        </div>
        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-gray-300 mb-2">Resolusi</label>
          <select id="resolution" value={resolution} onChange={e => setResolution(e.target.value as '720p' | '1080p')} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" disabled>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
          </select>
           <p className="text-xs text-gray-500 mt-1 flex items-start gap-1.5"><InfoIcon className="w-3 h-3 mt-0.5 flex-shrink-0" /> VEO API saat ini menggunakan resolusi default.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Menghasilkan...
          </>
        ) : (
          'Hasilkan Video'
        )}
      </button>
    </form>
  );
};