import { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';
import ModelSelector from './ModelSelector';
import { NetworkMonitor } from '../utils/networkMonitor';
import SearchErrorBoundary from './SearchErrorBoundary';
import { marked } from 'marked';

export default function OpenSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b');
  const [selectedSources, setSelectedSources] = useState(['Web']);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sourceRows = [
    ['Web', 'LinkedIn', 'X', 'Reddit', 'Substack'],
    ['Crunchbase', 'Pitchbook', 'Medium', 'Verified Sources', <span className="flex items-center gap-1"><Upload size={16} /> Files + URL</span>]
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isVerifiedSearch = selectedSources.includes('Verified Sources') && selectedSources.length === 1;
    const endpoint = isVerifiedSearch ? '/api/verifiedSearch' : '/api/openSearch';

    try {
      // Create and validate form data
      const formData = new FormData();
      
      // Required fields
      if (!searchQuery.trim()) {
        throw new Error('Search query is required');
      }
      formData.append('query', searchQuery.trim());
      formData.append('model', selectedModel);
      
      // Source selection
      const sourcesToSend = selectedSources.filter(s => s !== 'Files + URL');
      formData.append('sources', JSON.stringify(sourcesToSend));
      
      // Custom URLs
      if (customUrls.length > 0) {
        const validUrls = customUrls.filter(url => {
          try {
            new URL(url);
            return true;
          } catch {
            console.warn('Invalid URL:', url);
            return false;
          }
        });
        formData.append('customUrls', JSON.stringify(validUrls));
      } else {
        formData.append('customUrls', JSON.stringify([]));
      }
      
      // Files
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
          formData.append('files', file);
        });
      }

      console.log('Sending request to:', endpoint);
      console.log('Request data:', {
        query: searchQuery.trim(),
        model: selectedModel,
        sources: sourcesToSend,
        customUrls: customUrls.length,
        files: uploadedFiles.map(f => f.name)
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data || !data.summary) {
        throw new Error('Invalid response format - missing summary');
      }

      setResults(data);
      setMessages(prev => [...prev, 
        { role: 'user', content: searchQuery },
        { role: 'assistant', content: data.summary, sources: data.sources }
      ]);
      
      // Clear uploaded files after successful search
      setUploadedFiles([]);
      setCustomUrls([]);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceClick = (source) => {
    if (source === 'Files + URL') {
      setShowUploadPanel(!showUploadPanel);
      return;
    }

    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/openSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: followUpQuery,
          model: selectedModel,
          previousMessages: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Follow-up search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'user', content: followUpQuery }, { role: 'assistant', content: data.summary, sources: data.sources }]);
      setFollowUpQuery('');
    } catch (err) {
      setError(err.message);
      console.error('Follow-up Search Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchErrorBoundary>
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your search query"
              className="flex-1 px-6 py-3 text-lg border rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg
                hover:bg-blue-700 transition-colors shadow-sm"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Source Selection Tabs - Two Rows */}
          <div className="space-y-3">
            {sourceRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-3">
                {row.map(source => (
                  <button
                    key={typeof source === 'string' ? source : 'Files + URL'}
                    type="button"
                    onClick={() => handleSourceClick(typeof source === 'string' ? source : 'Files + URL')}
                    className={`px-4 py-2 rounded-lg transition-colors flex-1
                      ${selectedSources.includes(typeof source === 'string' ? source : 'Files + URL') || (source === 'Files + URL' && showUploadPanel)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Upload Panel */}
          {showUploadPanel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <FileUpload onUpload={(files) => setUploadedFiles([...uploadedFiles, ...files])} />
              <UrlInput onSubmit={(url) => setCustomUrls([...customUrls, url])} />
              
              {(customUrls.length > 0 || uploadedFiles.length > 0) && (
                <div className="mt-4 bg-white p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Added Sources</h4>
                  {customUrls.map((url, i) => (
                    <div key={i} className="text-sm text-gray-600">{url}</div>
                  ))}
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="text-sm text-gray-600">{file.name}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {error && (
          <div className="text-red-600 text-center">{error}</div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="mt-8 space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                message.role === 'user' ? 'bg-blue-50' : 'bg-white shadow'
              }`}>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                {message.sources && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-700">Sources:</h4>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="text-sm">
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {source.title || source.url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Follow-up Question Input */}
        {messages.length > 0 && (
          <form onSubmit={handleFollowUpSubmit} className="mt-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !followUpQuery.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </SearchErrorBoundary>
  );
}