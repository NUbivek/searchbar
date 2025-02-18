// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 21:14:12
// Current User's Login: NUbivek

export const PRODUCTION_CONFIG = {
    // Static build configuration
    isStaticBuild: process.env.NEXT_PUBLIC_STATIC_BUILD === 'true',
    
    // Mock data for static builds
    mockData: {
      webSearch: {
        content: "Mock web search results for static build",
        sources: []
      },
      linkedInSearch: {
        content: "Mock LinkedIn search results for static build",
        profiles: []
      }
    },
  
    // Add path configuration for GitHub Pages
    basePath: '/searchbar',
    assetPrefix: '/searchbar/',
    
    // API endpoints configuration
    api: {
      search: {
        web: '/api/search/web',
        linkedin: '/api/search/linkedin',
        chat: '/api/search/chat',
        x: '/api/search/x'
      }
    }
  };
  
  // Add a default export while maintaining the named export
  export default PRODUCTION_CONFIG;