import React, { useState } from 'react';
import axios from 'axios';
import { Menu, User, Send, Download } from 'lucide-react';

export default function ManimVideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isVideoAreaVisible, setIsVideoAreaVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setError('');
      try {
        const response = await axios.post('http://localhost:8080/generate', { prompt });
        if (response.data.video) {
          setVideoUrl(response.data.video);
          setIsVideoAreaVisible(true);
          setHistory([prompt, ...history]);
        } else if (response.data.error) {
          setError(response.data.error);
        }
      } catch (err) {
        setError('Failed to generate video. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 font-sans">
      <header className="flex justify-between items-center mb-8 px-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-300 hover:text-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
          <User className="h-6 w-6" />
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold font-mono mb-8">Manim Video Generator</h1>
        <div className="w-full max-w-2xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              placeholder="Describe the animation you want..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 rounded-md p-4"
              rows={4}
            />
            <button
              type="submit"
              className="w-full bg-gray-700 hover:bg-gray-600 rounded-md p-4 flex items-center justify-center"
            >
              <Send className="h-5 w-5 mr-2" />
              Generate Video
            </button>
          </form>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {isVideoAreaVisible && (
            <div className="bg-gray-800 border-gray-700 rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-100">Generated Animation</h2>
              </div>
              <div className="p-6 pt-0 relative">
                <video width="640" height="480" controls className="w-full rounded-lg">
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button
                  className="absolute bottom-8 right-8 bg-gray-600 hover:bg-gray-500 rounded-full p-2"
                  title="Download Animation"
                  onClick={() => window.open(videoUrl, '_blank')}
                >
                  <Download className="h-5 w-5" />
                  <span className="sr-only">Download Animation</span>
                </button>
                <p className="mt-4 text-sm text-gray-400">Prompt: {prompt}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 text-gray-100 w-64 h-full p-4">
            <h2 className="text-xl font-bold mb-4">History</h2>
            <ul className="space-y-2">
              {history.map((item, index) => (
                <li key={index} className="bg-gray-700 p-2 rounded-md">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}