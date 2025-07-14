import React, { useState } from 'react';
import './App.css';

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    setTranscript('');

    try {
      const response = await fetch('http://localhost:5001/summarize_youtube', {
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
    } catch (err) {
      setError('Failed to connect to the backend server.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Summarizer</h1>
      </header>
      <main>
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleSummarize} disabled={loading}>
            {loading ? 'Summarizing...' : 'Get Transcript'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {transcript && (
          <div className="transcript-section">
            <h2>Transcript:</h2>
            <p>{transcript}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;