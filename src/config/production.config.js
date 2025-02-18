// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 17:47:02
// Current User's Login: NUbivek

export const PRODUCTION_CONFIG = {
    isStaticBuild: process.env.NEXT_PUBLIC_STATIC_BUILD === 'true',
    mockData: {
      webSearch: {
        content: "Mock web search results for static build",
        sources: []
      },
      linkedInSearch: {
        content: "Mock LinkedIn search results for static build",
        profiles: []
      }
    }
  };