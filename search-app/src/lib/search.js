// Using DuckDuckGo scraping API as it's free and doesn't require API keys
export async function searchWeb(query) {
    try {
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
      const data = await response.json();
      
      return data.RelatedTopics
        .filter(topic => topic.FirstURL && topic.Text)
        .map(topic => ({
          title: topic.Text.split(' - ')[0],
          url: topic.FirstURL,
          snippet: topic.Text
        }))
        .slice(0, 5); // Get top 5 results
    } catch (error) {
      console.error('Web search error:', error);
      throw new Error('Failed to perform web search');
    }
  }