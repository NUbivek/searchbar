import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function SearchResults({ results }) {
  if (!results) return null;

  const { sources, summary } = results;

  return (
    <div className="search-results space-y-8">
      <div className="summary bg-white rounded-lg border p-6">
        <ReactMarkdown>{summary.content}</ReactMarkdown>
      </div>
      
      {sources && sources.length > 0 && (
        <div className="sources bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Sources</h3>
          <div className="space-y-4">
            {sources.map((source, index) => (
              <div key={index} className="source p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {source.title}
                  </a>
                </h4>
                <p className="mt-2 text-gray-600">{source.content}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Source: {source.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}