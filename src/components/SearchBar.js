import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  isLoading
}) => {
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('Search submitted:', searchQuery);
    await handleSearch();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <form onSubmit={onSubmit} className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all sources..."
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Search className="animate-spin" size={20} />
              Searching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search size={20} />
              Search
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchBar; 