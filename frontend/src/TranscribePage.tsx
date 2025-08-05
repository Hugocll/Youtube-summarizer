import React, { useState, ChangeEvent, useEffect } from 'react';
import type { JSX } from 'react/jsx-runtime';
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

function TranscribePage(): JSX.Element {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');

  // Debug API configuration on component mount
  useEffect(() => {
    debugApiConfig();
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

  const handleTranscribe = async (): Promise<void> => {
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
    // Replace alert with a more modern notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = 'Transcript copied to clipboard!';
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Transcribe Video</h1>
          <p className="text-gray-400 mt-2">Convert YouTube videos to accurate text transcripts</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 shadow-lg">
        {/* URL Input */}
        <div className="mb-6">
          <label htmlFor="youtube-url" className="block text-lg font-semibold mb-3 text-gray-300">
            YouTube URL
          </label>
          <input
            id="youtube-url"
            type="text"
            placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            value={youtubeUrl}
            onChange={handleUrlChange}
            disabled={loading}
            className="w-full p-4 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-100 placeholder-gray-400 transition-all duration-200 shadow-sm"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state for preview */}
        {isLoadingPreview && (
          <div className="flex items-center justify-center gap-3 text-blue-400 mb-6 p-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span>Loading video preview...</span>
          </div>
        )}

        {/* Error state for preview */}
        {previewError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400">{previewError}</p>
            </div>
          </div>
        )}

        {/* Video preview */}
        {videoInfo && !isLoadingPreview && (
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 rounded-lg mb-6 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="relative flex-shrink-0">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-40 h-30 object-cover rounded-lg shadow-md"
                />
                <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm font-medium">
                  {formatDuration(videoInfo.duration)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-100 mb-3 line-clamp-2">
                  {videoInfo.title}
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {videoInfo.uploader}
                  </p>
                  {videoInfo.view_count > 0 && (
                    <p className="text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {videoInfo.view_count.toLocaleString()} views
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center mb-6">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-4">
              <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg text-gray-300">Processing video...</span>
            </div>
          ) : (
            videoInfo && !isLoadingPreview && (
              <button
                onClick={handleTranscribe}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Get Transcript</span>
                </div>
              </button>
            )
          )}
        </div>

        {/* Transcript Result */}
        {transcript && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-300">Transcription Result</h2>
              <button
                onClick={handleCopyTranscript}
                className="bg-[#2a2a2a] border border-[#3a3a3a] hover:bg-[#3a3a3a] text-gray-300 px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </button>
            </div>
            <textarea
              readOnly
              value={transcript}
              className="w-full h-80 p-4 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] text-gray-100 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              placeholder="Transcript will appear here..."
            ></textarea>
          </div>
        )}
      </div>
    </div>
  );
}

export default TranscribePage;