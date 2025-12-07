import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/gemini';
import { Language } from '../types';

interface StudioProps {
    language: Language;
}

export const AnjumanStudio: React.FC<StudioProps> = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null); // Reset generated image on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await editImageWithGemini(selectedImage, prompt);
      setGeneratedImage(result);
    } catch (err) {
      setError("Failed to edit image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setPrompt('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto h-full overflow-y-auto pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Pak Godhra Studio</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create engaging announcements with AI.</p>
      </div>

      {!selectedImage ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary transition-colors h-64 flex flex-col items-center justify-center"
        >
          <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-2">add_photo_alternate</span>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Tap to upload a photo</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Supports JPG, PNG</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Image Display Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-square">
               <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
               <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Original</div>
               <button 
                onClick={clearAll}
                className="absolute top-2 right-2 bg-white/90 text-red-600 p-1 rounded-full shadow-sm hover:bg-white"
               >
                 <span className="material-symbols-outlined text-sm">close</span>
               </button>
            </div>

            {generatedImage && (
              <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-square">
                <img src={generatedImage} alt="Edited" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-primary/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">AI Edited</div>
                <a 
                  href={generatedImage} 
                  download="pak-godhra-edited.png"
                  className="absolute bottom-2 right-2 bg-white text-primary px-3 py-1.5 rounded-lg shadow-md text-sm font-medium flex items-center space-x-1"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Save</span>
                </a>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How should we change this image?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Add a 'Vote Now' banner, make it festive..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className={`px-4 py-2 rounded-lg font-medium text-white flex items-center justify-center min-w-[100px] transition-all ${
                  isLoading || !prompt.trim() 
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  <span className="flex items-center">
                    <span className="material-symbols-outlined mr-1">auto_awesome</span>
                    Edit
                  </span>
                )}
              </button>
            </div>
            
            {/* Quick Prompts */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['Make it retro', 'Add fireworks', 'Remove background person', 'Add Islamic geometric pattern border'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="whitespace-nowrap px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center">
              <span className="material-symbols-outlined mr-2">error</span>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};