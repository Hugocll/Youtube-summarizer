import React, { useState, useEffect } from 'react';
import type { JSX } from 'react/jsx-runtime';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import TranscribePage from './TranscribePage';
import DownloadPage from './DownloadPage';
import SummarizePage from './SummarizePage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ApiKeyModal from './components/ApiKeyModal';
import { debugApiConfig } from './config/api';

function App(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Guest User');

  // Debug API configuration and load API key on component mount
  useEffect(() => {
    debugApiConfig();
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSidebarToggle = (): void => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleApiKeySave = (newApiKey: string): void => {
    setApiKey(newApiKey);
    localStorage.setItem('openrouter_api_key', newApiKey);
  };

  const handleApiKeyButtonClick = (): void => {
    setIsApiKeyModalOpen(true);
  };

  const handleLogin = (): void => {
    // Placeholder for future login implementation
    setIsLoggedIn(true);
    setUserName('John Doe');
  };

  const handleLogout = (): void => {
    // Placeholder for future logout implementation
    setIsLoggedIn(false);
    setUserName('Guest User');
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0f0f0f] text-gray-200 flex">
        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSave={handleApiKeySave}
          currentApiKey={apiKey}
        />

        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <TopBar
            isLoggedIn={isLoggedIn}
            userName={userName}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onOpenApiKeyModal={handleApiKeyButtonClick}
            hasApiKey={!!apiKey}
          />

          {/* Page Content */}
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/transcribe" element={<TranscribePage />} />
                <Route path="/summarize" element={<SummarizePage />} />
                <Route path="/download" element={<DownloadPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;