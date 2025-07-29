import React, { useState, ChangeEvent, useEffect } from 'react';
import type { JSX } from 'react/jsx-runtime';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DownloadPage from './DownloadPage';
import SummarizePage from './SummarizePage';
import ApiKeyButton from './components/ApiKeyButton';
import ApiKeyModal from './components/ApiKeyModal';
import { getApiUrl, debugApiConfig } from './config/api';

interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
  view_count: number;
  upload_date: string;
  id: string;
}

function App(): JSX.Element {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Debug API configuration and load API key on component mount
  useEffect(() => {
    debugApiConfig();
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Helper function to check if URL is a valid YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com/watch?v=') || url.includes('youtu.be/');
  };

  // Function to format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to fetch video metadata
  const fetchVideoInfo = async (url: string): Promise<void> => {
    setIsLoadingPreview(true);
    setPreviewError('');
    setVideoInfo(null);

    try {
      const response = await fetch(getApiUrl('/video_info'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setVideoInfo(data);
      } else {
        setPreviewError(data.error || 'Failed to fetch video information');
      }
    } catch (error) {
      setPreviewError('Failed to connect to the backend. Please check if the backend service is running.');
      console.error('Error fetching video info:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const url = e.target.value;
    setYoutubeUrl(url);
  };

  // Effect to automatically fetch video info when a valid URL is entered
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (youtubeUrl && isValidYouTubeUrl(youtubeUrl)) {
        fetchVideoInfo(youtubeUrl);
      } else {
        setVideoInfo(null);
        setPreviewError('');
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [youtubeUrl]);

  const handleSummarize = async (): Promise<void> => {
    setLoading(true);
    setError('');
    setTranscript('');

    try {
      const response = await fetch(getApiUrl('/transcribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranscript(data.transcript);
      } else {
        setError(data.error || 'An unknown error occurred.');
      }
    } catch (err: any) {
      setError('Failed to connect to the backend server. Please check if the backend service is running.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTranscript = (): void => {
    navigator.clipboard.writeText(transcript);
    alert('Transcript copied to clipboard!');
  };

  const handleApiKeySave = (newApiKey: string): void => {
    setApiKey(newApiKey);
    localStorage.setItem('openrouter_api_key', newApiKey);
  };

  const handleApiKeyButtonClick = (): void => {
    setIsApiKeyModalOpen(true);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center py-10 px-4">
        <ApiKeyButton
          hasApiKey={!!apiKey}
          onClick={handleApiKeyButtonClick}
        />
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSave={handleApiKeySave}
          currentApiKey={apiKey}
        />
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
ANITALOFU          </h1>
          <nav className="mt-4">
            <ul className="flex justify-center space-x-6">
              <li>
                <Link to="/" className="text-blue-400 hover:text-blue-600 text-lg font-medium transition duration-200 ease-in-out">Transcribe</Link>
              </li>
              <li>
                <Link to="/summarize" className="text-blue-400 hover:text-blue-600 text-lg font-medium transition duration-200 ease-in-out">Summarize</Link>
              </li>
              <li>
                <Link to="/download" className="text-blue-400 hover:text-blue-600 text-lg font-medium transition duration-200 ease-in-out">Download Video</Link>
              </li>
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={
            <main className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
              <div className="mb-6">
                <label htmlFor="youtube-url" className="block text-lg font-semibold mb-2 text-gray-300">
                  Enter YouTube URL
                </label>
                <input
                  id="youtube-url"
                  type="text"
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={youtubeUrl}
                  onChange={handleUrlChange}
                  disabled={loading}
                  className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-gray-100 placeholder-gray-400 transition duration-200 ease-in-out"
                />
              </div>

              {error && (
                <p className="text-red-400 text-center mb-4">{error}</p>
              )}

              {/* Loading state for preview */}
              {isLoadingPreview && (
                <div className="flex items-center justify-center gap-2 text-blue-400 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span>Loading video preview...</span>
                </div>
              )}

              {/* Error state for preview */}
              {previewError && (
                <div className="text-red-400 text-center mb-4 bg-red-900 bg-opacity-20 p-3 rounded-lg border border-red-800">
                  {previewError}
                </div>
              )}

              {/* Video preview */}
              {videoInfo && !isLoadingPreview && (
                <div className="bg-gray-700 p-4 rounded-lg mb-6 shadow-inner">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        className="w-32 h-24 object-cover rounded-md shadow-lg"
                      />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white px-1 py-0.5 rounded text-xs">
                        {formatDuration(videoInfo.duration)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
                        {videoInfo.title}
                      </h2>
                      <p className="text-gray-400 text-sm mb-1">
                        By {videoInfo.uploader}
                      </p>
                      {videoInfo.view_count > 0 && (
                        <p className="text-gray-500 text-sm">
                          {videoInfo.view_count.toLocaleString()} views
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center mb-6">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-lg text-gray-300">Processing...</span>
                  </div>
                ) : (
                  videoInfo && !isLoadingPreview && (
                    <button
                      onClick={handleSummarize}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Get Transcript
                    </button>
                  )
                )}
              </div>

              {transcript && (
                <div className="mt-6">
                  <h2 className="text-2xl font-semibold mb-3 text-gray-300">Transcription:</h2>
                  <textarea
                    readOnly
                    value={transcript}
                    className="w-full h-64 p-4 rounded-md bg-gray-700 border border-gray-600 text-gray-100 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  ></textarea>
                  <button
                    onClick={handleCopyTranscript}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                  >
                    Copy Transcript
                  </button>
                </div>
              )}
            </main>
          } />
          <Route path="/summarize" element={<SummarizePage />} />
          <Route path="/download" element={<DownloadPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;