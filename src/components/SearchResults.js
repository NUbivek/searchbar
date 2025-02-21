import { useState } from 'react';

export default function SearchResults({ results, onFollowUp, isLoading, error }) {
  const [expandedSection, setExpandedSection] = useState(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4BA3F5] mx-auto mb-4" />
        <p className="text-gray-500">Analyzing search results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="max-h-[800px] overflow-y-auto divide-y divide-gray-100">
      {/* Main Summary */}
      <div className="p-6 bg-white sticky top-0 border-b shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
        <div className="mt-2 text-gray-600 whitespace-pre-wrap">
          {results.summary}
        </div>
      </div>

      {/* Categories */}
      {results.categories?.map((category, idx) => (
        <div key={idx} className="p-6 bg-white">
          <button
            onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
            className="w-full flex justify-between items-center"
          >
            <h4 className="text-lg font-medium text-gray-800">{category.title}</h4>
            <span className="text-gray-400">
              {expandedSection === idx ? '−' : '+'}
            </span>
          </button>

          {expandedSection === idx && (
            <div className="mt-4 space-y-4">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className="bg-gray-50 rounded-lg p-4">
                  <div className="prose max-w-none">
                    <div className="text-gray-800">{item.content}</div>
                    {item.sources?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.sources.map((source, sourceIdx) => (
                          <a
                            key={sourceIdx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#4BA3F5] hover:underline inline-flex items-center gap-1"
                          >
                            {source.title}
                            <span className="text-gray-400">↗</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Follow-up Questions */}
      {results.followUpQuestions?.length > 0 && (
        <div className="p-6 bg-white">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            Follow-up Questions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {results.followUpQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onFollowUp(question)}
                className="p-3 text-left border border-gray-200 rounded-lg 
                         hover:bg-gray-50 hover:border-[#4BA3F5]/30
                         text-gray-600 hover:text-gray-800 transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 