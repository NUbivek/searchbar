export interface SearchResult {
  content: string;
  sources?: string[];
  searchUrls?: Record<string, string>;
}

export interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => Promise<void>;
  isLoading: boolean;
} 