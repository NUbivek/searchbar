import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const SearchResults = ({ results, onFollowUpSearch, query }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  
  if (!results || results.length === 0) {
    return null;
  }

  console.log('SearchResults rendering with:', results);

  // Check if any result has a synthesizedAnswer
  const hasSynthesizedAnswer = results.some(result => result.synthesizedAnswer);
  
  // Get the first result with synthesizedAnswer
  const synthesizedResult = results.find(result => result.synthesizedAnswer);

  // Get categories if they already exist in the response
  const categories = synthesizedResult?.synthesizedAnswer?.categories || [];

  // Handle follow-up question submission
  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (!followUpQuestion.trim()) return;
    
    onFollowUpSearch(followUpQuestion);
    setFollowUpQuestion('');
  };

  return (
    <div className="search-results">
      {hasSynthesizedAnswer && synthesizedResult ? (
        <div>
          {/* Category Tabs - only show if we have multiple categories */}
          {categories.length > 1 && (
            <div className="mb-4 border-b">
              <div className="flex overflow-x-auto whitespace-nowrap">
                <button 
                  className={`px-4 py-2 border-b-2 font-medium text-sm ${
                    activeCategory === 'all' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveCategory('all')}
                >
                  All
                </button>
                
                {categories.map(category => (
                  <button 
                    key={category}
                    className={`px-4 py-2 border-b-2 font-medium text-sm ${
                      activeCategory === category 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {formatCategoryName(category)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Main LLM Content */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="prose max-w-none">
              {synthesizedResult.synthesizedAnswer.summary && (
                <ReactMarkdown>{synthesizedResult.synthesizedAnswer.summary}</ReactMarkdown>
              )}
              
              {/* Show category-specific content if a category is selected and exists */}
              {activeCategory !== 'all' && 
                synthesizedResult.synthesizedAnswer.categoryContent && 
                synthesizedResult.synthesizedAnswer.categoryContent[activeCategory] && (
                <div className="mt-4">
                  <ReactMarkdown>
                    {synthesizedResult.synthesizedAnswer.categoryContent[activeCategory]}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            
            {renderSources(synthesizedResult.synthesizedAnswer.sources)}
            {renderFollowUpQuestions(synthesizedResult.synthesizedAnswer.followUpQuestions, onFollowUpSearch)}
            
            {/* Follow-up Question Input */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <form onSubmit={handleFollowUpSubmit} className="flex">
                <input
                  type="text"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md"
                >
                  Chat
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // Display traditional search results if no synthesizedAnswer
        <div>
          {results.map((result, index) => {
            const { title, snippet, link, source = 'web' } = result;
            
            return (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <h3 className="text-lg font-medium">
                  {link ? (
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {title}
                    </a>
                  ) : (
                    <span>{title}</span>
                  )}
                </h3>
                
                {link && (
                  <p className="text-green-700 text-sm mb-2">
                    {link.length > 70 ? link.substring(0, 70) + '...' : link}
                  </p>
                )}
                
                <p className="text-gray-600">
                  {typeof snippet === 'string' 
                    ? snippet 
                    : typeof snippet === 'object' && snippet !== null
                      ? JSON.stringify(snippet)
                      : 'No description available'}
                </p>
                
                <div className="mt-2">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                    {source}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper function to format category names
function formatCategoryName(category) {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to render sources
function renderSources(sources) {
  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-md font-medium mb-2">Sources</h3>
      <ul className="list-disc pl-5 space-y-1">
        {sources.map((source, index) => {
          // Handle different source formats
          if (typeof source === 'string') {
            return <li key={index}>{source}</li>;
          } else if (source && typeof source === 'object') {
            const title = source.title || source.name || 'Untitled Source';
            const url = source.url || source.link || null;
            
            return (
              <li key={index}>
                {url ? (
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {title}
                  </a>
                ) : (
                  <span>{title}</span>
                )}
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
}

// Helper function to render follow-up questions
function renderFollowUpQuestions(questions, onFollowUpSearch) {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-md font-medium mb-2">Follow-up Questions</h3>
      <div className="space-y-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onFollowUpSearch(question)}
            className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;