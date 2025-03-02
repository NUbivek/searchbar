# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2025-03-01

### Changed
- Renamed "Verified Sources" tab to "Network Map"
- Removed search functionality from Network Map tab
- Made "Open Research" the default tab on application load
- Restructured UI layout for improved user experience
- Maintained verified sources search functionality within Open Research tab

### Improved
- Enhanced Network Map visualization
- Streamlined search flow in Open Research tab
- Updated documentation to reflect new UI layout

## [0.5.0] - 2025-02-25

### Fixed
- Fixed critical issue with Verified Sources search not displaying results
- Resolved data format inconsistencies between different search components
- Fixed content rendering issues in search results

### Improved
- Enhanced SearchResultsWrapper with robust format detection and conversion
- Improved LLMResults component with better error handling and content processing
- Added comprehensive debug logging throughout search components
- Implemented smarter content extraction and formatting for different data types

### Technical Changes
- Added format conversion between chat history and search results formats
- Implemented proper synthesizedAnswer format handling for different content types
- Enhanced type checking throughout search components
- Added fallbacks for missing content and improved error handling

## [0.4.0] - 2025-02-25

### Added
- Enhanced markdown styling for LLM responses with special formatting for Key Takeaways and Further Considerations
- Improved table styling for better data presentation
- Custom scrollbar styling for search results

### Changed
- Updated DeepSeek model to use DeepSeek-R1-Distill-Qwen-1.5B for better performance
- Restructured LLM prompt to generate more categorical and direct responses
- Enhanced UI for search results and LLM responses with improved visual hierarchy
- Optimized follow-up question interface with better styling

### Improved
- LLM responses now organized into logical categories with Key Takeaways section
- Better visual separation between different types of content
- More intuitive navigation through search results

## [0.3.0] - 2025-02-25

### Added
- Carta integration as a verified source for equity management information
- Automatic LLM model fallback mechanism for improved reliability
- Enhanced error handling in LLM processing with detailed error logging
- Support for multiple LLM models (Mixtral, Llama-2, Gemma)

### Changed
- Updated API route exports to use ES modules syntax for Next.js compatibility
- Improved error handling in verified sources search
- Enhanced LLM processing to handle empty results gracefully
- Updated environment variable configuration

### Fixed
- 500 Internal Server Error in verified sources search API route
- DeepSeek model integration issues with Together API
- Error handling in LLM processing
- Source handler parameter structure in custom and file handlers

## [0.2.0] - 2025-02-25

### Added
- Financial Modeling Prep (FMP) API integration for real-time market data
- Support for stock symbol extraction and market data retrieval
- Enhanced market data formatting with up/down arrows and color indicators
- Bloomberg, Reuters, and WSJ integration for financial news
- FRED API integration for economic data

### Changed
- Improved error handling in market data API calls
- Enhanced response formatting for market data results
- Updated environment variable handling for API keys
- Optimized web search fallback for market data queries

### Fixed
- Market data API authentication issues
- Symbol extraction for stock queries
- Rate limiting for financial data APIs
- Error handling for invalid API keys

## [0.1.0] - 2025-02-24

### Added
- Initial release with basic search functionality
- LinkedIn, Twitter, and Reddit integrations
- Web search using Serper API
- Support for Substack and Medium content
- File upload and processing capabilities
- Custom URL handling
- Rate limiting and error handling
- Modern UI with Tailwind CSS

### Changed
- Optimized search result processing
- Enhanced error handling and logging
- Improved API response formatting

### Fixed
- Rate limiting issues
- Authentication handling
- Search result aggregation
- File processing errors
