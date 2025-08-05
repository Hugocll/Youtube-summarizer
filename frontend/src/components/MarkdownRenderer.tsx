import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownToPlainText, copyToClipboard } from '../utils/markdownUtils';

interface MarkdownRendererProps {
  content: string;
  title?: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  title = "Content",
  className = "" 
}) => {
  const [isRawView, setIsRawView] = useState(false);

  const handleCopyPlainText = async () => {
    const plainText = markdownToPlainText(content);
    await copyToClipboard(plainText, 'Plain text copied to clipboard!');
  };

  const handleCopyMarkdown = async () => {
    await copyToClipboard(content, 'Markdown copied to clipboard!');
  };

  const toggleView = () => {
    setIsRawView(!isRawView);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with title and controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-300">{title}</h2>
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <button
            onClick={toggleView}
            className="bg-[#2a2a2a] border border-[#3a3a3a] hover:bg-[#3a3a3a] text-gray-400 px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
            title={isRawView ? "Switch to formatted view" : "Switch to raw markdown view"}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isRawView ? 'Formatted' : 'Raw'}</span>
          </button>

          {/* Copy as Plain Text */}
          <button
            onClick={handleCopyPlainText}
            className="bg-[#2a2a2a] border border-[#3a3a3a] hover:bg-[#3a3a3a] text-gray-300 px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center space-x-2"
            title="Copy as plain text (good for Notion, emails, etc.)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Copy Plain</span>
          </button>

          {/* Copy as Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center space-x-2"
            title="Copy with markdown formatting"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Markdown</span>
          </button>
        </div>
      </div>

      {/* Content Display */}
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 rounded-lg shadow-sm">
        {isRawView ? (
          // Raw markdown view
          <pre className="text-gray-100 leading-relaxed whitespace-pre-wrap font-mono text-sm overflow-x-auto">
            {content}
          </pre>
        ) : (
          // Rendered markdown view
          <div className="prose prose-invert prose-purple max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements to match dark theme
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-100 mb-4 border-b border-gray-600 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-gray-100 mb-3 mt-6">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-4">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold text-gray-200 mb-2 mt-3">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-gray-100 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-gray-100 mb-4 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-gray-100 mb-4 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-100 leading-relaxed">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-white">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-200">
                    {children}
                  </em>
                ),
                code: ({ children }) => (
                  <code className="bg-[#1a1a1a] text-purple-300 px-2 py-1 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-[#1a1a1a] border border-[#3a3a3a] p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300 mb-4">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-purple-400 hover:text-purple-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className="border-gray-600 my-6" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownRenderer;