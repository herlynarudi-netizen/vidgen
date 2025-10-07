import React, { useState, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { ImageGeneratorPage } from './pages/ImageGeneratorPage';
import { VideoGeneratorPage } from './pages/VideoGeneratorPage';
import { ApiKeyInput } from './components/ApiKeyInput';

export type Page = 'image' | 'video';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('image');
  const [imageForVideo, setImageForVideo] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  const handleImageSelectAndSwitch = useCallback((imageUrl: string) => {
    // URL Blob bersifat sementara untuk sesi tersebut. Untuk meneruskannya antar komponen "halaman",
    // lebih aman untuk mengonversinya kembali menjadi URL data base64.
    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setImageForVideo(dataUrl);
          setPage('video');
        };
        reader.readAsDataURL(blob);
      }).catch(err => {
        console.error("Gagal mengonversi blob ke data URL:", err);
        // Tangani kesalahan jika diperlukan, misalnya dengan tidak beralih halaman
      });
  }, []);

  const handleNavigation = (targetPage: Page) => {
    // Saat menavigasi kembali ke gambar, hapus gambar yang dipilih
    if (targetPage === 'image') {
      setImageForVideo(null);
    }
    setPage(targetPage);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8">
        <Header />
        <Navigation currentPage={page} setPage={handleNavigation} />
        <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
        <div className="mt-8">
          {page === 'image' && <ImageGeneratorPage onImageSelect={handleImageSelectAndSwitch} apiKey={apiKey} />}
          {page === 'video' && <VideoGeneratorPage initialImage={imageForVideo} apiKey={apiKey} />}
        </div>
      </main>
    </div>
  );
};

export default App;