// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 22:14:31
// Current User's Login: NUbivek

export function getTopVCAccounts() {
    return [
      // Add popular VC Twitter handles
      '@a16z',
      '@sequoia',
      '@ycombinator',
      '@benchmark',
      '@foundercollective',
      '@usv',
      '@firstround',
      '@greylock',
      '@kleinerperkins',
      '@khoslaventures'
    ];
  }
  
  export function generateSearchQueries(query) {
    const vcAccounts = getTopVCAccounts();
    const baseQuery = encodeURIComponent(query);
    
    return [
      // General search
      `${baseQuery} (from:${vcAccounts.join(' OR from:')})`,
      
      // Recent discussions
      `${baseQuery} (from:${vcAccounts.join(' OR from:')}) min_faves:100`,
      
      // With media
      `${baseQuery} (from:${vcAccounts.join(' OR from:')}) filter:images min_faves:50`,
      
      // Detailed threads
      `${baseQuery} (from:${vcAccounts.join(' OR from:')}) filter:replies min_replies:5`
    ];
  }
  
  // Mock function since we can't actually fetch from Twitter without API access
  export async function getTopVCContent(searchQueries) {
    // In a real implementation, this would use Twitter's API
    return [
      {
        id: '123456789',
        username: 'a16z',
        text: 'Example tweet about venture capital trends',
        query: searchQueries[0]
      },
      // Add more mock data as needed
    ];
  }