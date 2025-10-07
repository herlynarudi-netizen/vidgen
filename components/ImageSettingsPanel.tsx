import React, { useState } from 'react';
import type { ImageGenerationOptions } from '../types';
import { UploadIcon } from './icons';

interface ImageSettingsPanelProps {
  onGenerate: (options: Omit<ImageGenerationOptions, 'numberOfImages' | 'apiKey'>) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<{
    id: string;
    label: string;
    imageFile: File | null;
    imagePreview: string | null;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
}> = ({ id, label, imagePreview, onImageChange, onRemoveImage }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg relative">
            <div className="space-y-1 text-center">
                {imagePreview ? (
                    <>
                        <img src={imagePreview} alt="Pratinjau gambar" className="mx-auto h-24 w-auto rounded-md" />
                        <button onClick={onRemoveImage} type="button" className="text-xs text-red-400 hover:text-red-300">Hapus gambar</button>
                    </>
                ) : (
                    <>
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <div className="flex text-sm text-gray-500">
                            <label htmlFor={id} className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500 px-1">
                                <span>Unggah file</span>
                                <input id={id} name={id} type="file" className="sr-only" onChange={onImageChange} accept="image/*" />
                            </label>
                            <p className="pl-1">atau seret dan lepas</p>
                        </div>
                        <p className="text-xs text-gray-600">PNG, JPG, GIF hingga 10MB</p>
                    </>
                )}
            </div>
        </div>
    </div>
);

export const ImageSettingsPanel: React.FC<ImageSettingsPanelProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [actorImageFile, setActorImageFile] = useState<File | null>(null);
  const [actorImagePreview, setActorImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');

  const handleImageChange = (setter: (file: File) => void, previewSetter: (url: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setter(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (setter: (file: null) => void, previewSetter: (url: null) => void) => () => {
    setter(null);
    previewSetter(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onGenerate({
      prompt,
      productImageFile,
      actorImageFile,
      aspectRatio,
    });
  };

  const isGenerateDisabled = isLoading || (!productImageFile && !actorImageFile);

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 space-y-6 sticky top-8">
      <ImageUploader
        id="product-image-upload"
        label="Gambar Produk"
        imageFile={productImageFile}
        imagePreview={productImagePreview}
        onImageChange={handleImageChange(setProductImageFile, setProductImagePreview)}
        onRemoveImage={handleRemoveImage(() => setProductImageFile(null), () => setProductImagePreview(null))}
      />

      <ImageUploader
        id="actor-image-upload"
        label="Gambar Aktor/Orang"
        imageFile={actorImageFile}
        imagePreview={actorImagePreview}
        onImageChange={handleImageChange(setActorImageFile, setActorImagePreview)}
        onRemoveImage={handleRemoveImage(() => setActorImageFile(null), () => setActorImagePreview(null))}
      />
      
      <div>
        <label htmlFor="aspect-ratio-image" className="block text-sm font-medium text-gray-300 mb-2">Rasio Aspek</label>
        <select 
          id="aspect-ratio-image" 
          value={aspectRatio} 
          onChange={e => setAspectRatio(e.target.value as '1:1' | '16:9' | '9:16')} 
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="1:1">1:1 (Persegi)</option>
          <option value="16:9">16:9 (Lanskap)</option>
          <option value="9:16">9:16 (Potret)</option>
        </select>
      </div>

      <div>
        <label htmlFor="prompt-image" className="block text-sm font-medium text-gray-300 mb-2">
          Prompt (Opsional)
        </label>
        <textarea
          id="prompt-image"
          rows={5}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
          placeholder="Jelaskan bagaimana Anda ingin menggabungkan gambar-gambar tersebut. misal, 'tempatkan aktor di sebelah kanan produk dengan latar belakang pantai saat matahari terbenam'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
         <p className="text-xs text-gray-500 mt-1">Setidaknya satu gambar diperlukan. Ini akan menghasilkan 4 gambar.</p>
      </div>

      <button
        type="submit"
        disabled={isGenerateDisabled}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
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
          'Hasilkan Gambar'
        )}
      </button>
    </form>
  );
};