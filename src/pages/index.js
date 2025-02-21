import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { Upload, ChevronDown, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ModelSelector from '../components/ModelSelector';
import SearchInterface from '../components/SearchInterface';
import SearchResults from '../components/SearchResults';
import { SearchModes, SourceTypes } from '../utils/constants';

// First, let's define our blue theme colors at the top
const theme = {
  primary: '#4BA3F5', // The bright blue from the screenshot
  primaryHover: '#3994e8',
  primaryActive: '#2d87db',
  background: '#F8FAFC',
  text: '#334155',
  textLight: '#64748B',
};

// Add this near the top of the file with other constants
const MODEL_OPTIONS = [
  {
    id: 'Perplexity',
    displayName: 'Perplexity-Online',
    description: 'Real-time web analysis'
  },
  {
    id: 'Mixtral-8x7B',
    displayName: 'Mixtral 8x7B',
    description: 'Powerful multi-expert model'
  },
  {
    id: 'Gemma-7B',
    displayName: 'Gemma 7B',
    description: 'Efficient Google model'
  },
  {
    id: 'DeepSeek-70B',
    displayName: 'DeepSeek 70B',
    description: 'Advanced reasoning model'
  }
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState(SearchModes.VERIFIED);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&mode=${mode}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Research Hub
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Search across verified sources and market data
          </p>
        </div>

        <div className="mt-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your search query"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMode(SearchModes.VERIFIED)}
                className={`px-4 py-2 rounded-lg ${
                  mode === SearchModes.VERIFIED
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Verified Sources
              </button>
              <button
                type="button"
                onClick={() => setMode(SearchModes.OPEN)}
                className={`px-4 py-2 rounded-lg ${
                  mode === SearchModes.OPEN
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Open Research
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 text-red-600 text-center">{error}</div>
          )}

          {results && (
            <div className="mt-8 space-y-8">
              {results.sources?.map((result, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {result.source}
                  </h3>
                  <p className="mt-2 text-gray-600">{result.content}</p>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                    >
                      View Source →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
