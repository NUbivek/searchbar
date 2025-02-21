import { useState } from 'react';
import { SearchModes, SourceTypes } from '../utils/constants';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';

export default function SearchInterface({ mode, selectedSources, setSelectedSources, selectedModel }) {
  const [query, setQuery] = useState('');
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSearch = async () => {
    // Step 1: Source-specific search
    const sourceResults = await searchSources(query, {
      mode,
      selectedSources,
      customUrls,
      uploadedFiles
    });

    // Step 2: Process with LLM
    const llmResults = await processWithLLM(sourceResults, selectedModel);

    // Step 3: Format and categorize results
    const formattedResults = formatResults(llmResults);

    // Update UI with results
    setResults(formattedResults);
  };

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="max-w-3xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${mode === SearchModes.VERIFIED ? 'verified sources' : 'across all sources'}...`}
          className="w-full px-4 py-3 text-lg border rounded-lg"
        />
      </div>

      {/* Source Selection */}
      {mode === SearchModes.OPEN ? (
        <OpenSourceSelector 
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
        />
      ) : (
        <VerifiedSourceSelector 
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
        />
      )}

      {/* Custom Sources */}
      {(mode === SearchModes.VERIFIED || selectedSources.includes('Custom')) && (
        <div className="space-y-4">
          <FileUpload 
            files={uploadedFiles}
            setFiles={setUploadedFiles}
          />
          <UrlInput 
            urls={customUrls}
            setUrls={setCustomUrls}
          />
        </div>
      )}
    </div>
  );
} 