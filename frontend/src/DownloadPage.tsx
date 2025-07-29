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
    <div className="DownloadPage flex flex-col gap-4 items-center justify-center p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Download YouTube Video</h1>
      
      <input
        type="text"
        className='w-full max-w-md p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        placeholder="Enter YouTube Video URL"
        value={input}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
      />

      {/* Loading state for preview */}
      {isLoadingPreview && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading video preview...</span>
        </div>
      )}

      {/* Error state for preview */}
      {previewError && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          {previewError}
        </div>
      )}

      {/* Video preview */}
      {videoInfo && !isLoadingPreview && (
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
              {formatDuration(videoInfo.duration)}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
              {videoInfo.title}
            </h3>
            <p className="text-gray-600 text-xs mb-1">
              By {videoInfo.uploader}
            </p>
            {videoInfo.view_count > 0 && (
              <p className="text-gray-500 text-xs">
                {videoInfo.view_count.toLocaleString()} views
              </p>
            )}
          </div>
        </div>
      )}

      {/* Download button - only show when video info is loaded */}
      {videoInfo && !isLoadingPreview && (
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          onClick={handleDownload}
        >
          Download Video
        </button>
      )}
    </div>
  );
}

export default DownloadPage;