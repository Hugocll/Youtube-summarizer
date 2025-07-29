import React, { useState } from 'react';
import type { JSX } from 'react/jsx-runtime';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey: string;
}

function ApiKeyModal({ isOpen, onClose, onSave, currentApiKey }: ApiKeyModalProps): JSX.Element {
  const [apiKey, setApiKey] = useState<string>(currentApiKey);
  const [showKey, setShowKey] = useState<boolean>(false);

  if (!isOpen) return <></>;

  const handleSave = () => {
    onSave(apiKey.trim());
    onClose();
  };

  const handleCancel = () => {
    setApiKey(currentApiKey); // Reset to current value
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">OpenRouter API Key</h2>
        
        <div className="mb-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-2">
            Enter your OpenRouter API Key:
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full p-3 pr-12 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-gray-100 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showKey ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-400 mb-4">
          <p>Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">OpenRouter</a></p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition duration-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyModal;