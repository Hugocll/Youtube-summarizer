import React from 'react';
import type { JSX } from 'react/jsx-runtime';

interface ApiKeyButtonProps {
  hasApiKey: boolean;
  onClick: () => void;
}

function ApiKeyButton({ hasApiKey, onClick }: ApiKeyButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`fixed top-4 right-4 p-3 rounded-full shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
        hasApiKey 
          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white' 
          : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white animate-pulse'
      }`}
      title={hasApiKey ? 'API Key configured' : 'Configure API Key'}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
        />
      </svg>
    </button>
  );
}

export default ApiKeyButton;