// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:32:45
// Current User's Login: NUbivek

"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

const SearchResults = ({ results }) => {
  if (!results) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Results Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Search Results</h2>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  {children}
                  <ExternalLink size={14} />
                </a>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-slate-700 leading-relaxed">
                  {children}
                </p>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-slate-800 mb-2 mt-4">
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="text-slate-700">
                  {children}
                </li>
              )
            }}
          >
            {results.content}
          </ReactMarkdown>
        </div>

        {/* Source Citations */}
        {results.sources && results.sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Sources
            </h3>
            <ul className="space-y-2">
              {results.sources.map((source, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-sm text-slate-500">[{index + 1}]</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;