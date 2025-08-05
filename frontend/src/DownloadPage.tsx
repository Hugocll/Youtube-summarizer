import React, { useState, ChangeEvent, useEffect } from 'react';
import type { JSX } from 'react/jsx-runtime';
import { getApiUrl } from './config/api';

interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
  view_count: number;
  upload_date: string;
  id: string;
}

function DownloadPage(): JSX.Element {
  const [input, setInput] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string>('');

  // Helper function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

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

  // Effect to automatically fetch video info when a valid URL is entered
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (input && isValidYouTubeUrl(input)) {
        fetchVideoInfo(input);
      } else {
        setVideoInfo(null);
        setPreviewError('');
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [input]);

  const handleDownload = async (): Promise<void> => {
    let videoIdToUse: string = input;

    // Check if the input is a full URL and extract the ID
    if (input.includes('youtube.com/watch?v=') || input.includes('youtu.be/')) {
      const extractedId = getYouTubeVideoId(input);
      if (extractedId) {
        videoIdToUse = extractedId;
      } else {
        alert('Invalid YouTube URL or Video ID.');
        return;
      }
    }

    if (!videoIdToUse) {
      alert('Please enter a YouTube Video ID or URL.');
      return;
    }

    const youtubeUrl: string = `https://www.youtube.com/watch?v=${videoIdToUse}`;

    try {
      const response = await fetch(getApiUrl('/download'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      
      const data: { message?: string; filepath?: string; error?: string } = await response.json();

      if (response.ok) {
        alert(`Video downloaded to backend server: ${data.filepath}`);
      } else {
        alert(`Error: ${data.error || 'Failed to download video.'}`);
      }
    } catch (error: any) {
      console.error('Error downloading video:', error);
      alert('Failed to connect to the backend. Please check if the backend service is running.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Download Video</h1>
          <p className="text-gray-400 mt-2">Save YouTube videos directly to your device</p>
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
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            className="w-full p-4 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-100 placeholder-gray-400 transition-all duration-200 shadow-sm"
          />
        </div>

        {/* Loading state for preview */}
        {isLoadingPreview && (
          <div className="flex items-center justify-center gap-3 text-green-400 mb-6 p-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
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

        {/* Download button - only show when video info is loaded */}
        {videoInfo && !isLoadingPreview && (
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Video</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DownloadPage;