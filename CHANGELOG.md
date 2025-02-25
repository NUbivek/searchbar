# Changelog

All notable changes to this project will be documented in this file.

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
