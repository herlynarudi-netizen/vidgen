import React from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  return (
    <div className="max-w-md mx-auto mt-6">
      <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2 text-center">
        Kunci API Google AI
      </label>
      <input
        id="api-key"
        type="password"
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
        placeholder="Masukkan kunci API Anda di sini"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <p className="text-xs text-gray-500 mt-2 text-center">Kunci API Anda diperlukan untuk generator gambar dan video.</p>
    </div>
  );
};