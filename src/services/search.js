import { SOURCE_TYPES } from '@/config/constants';

// DuckDuckGo search implementation
const searchWeb = async (query) => {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    const data = await response.json();
    
    return {
      content: data.AbstractText + '\n\n' + data.RelatedTopics.map(topic => topic.Text).join('\n\n'),
      sources: [
        {
          url: data.AbstractURL,
          title: data.Heading,
          snippet: data.AbstractText
        },
        ...data.RelatedTopics
          .filter(topic => topic.FirstURL && topic.Text)
          .map(topic => ({
            url: topic.FirstURL,
            title: topic.Text.split(' - ')[0],
            snippet: topic.Text
          }))
      ]
    };
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    throw error;
  }
};

const searchLinkedIn = async (query) => {
  // Implement LinkedIn search
  return {
    content: `LinkedIn results for: ${query}`,
    sources: [{ url: 'https://linkedin.com', title: 'LinkedIn Result' }]
  };
};

// Add other source search functions...

export const performSearch = async (query, sources, model) => {
  try {
    console.log('Performing search with:', { query, sources, model });
    const results = [];

    // Handle web search
    if (sources[SOURCE_TYPES.WEB]) {
      console.log('Executing web search...');
      const webResults = await searchWeb(query);
      results.push(webResults);
    }

    // Combine all results
    const combinedResults = {
      content: results.map(r => r.content).join('\n\n'),
      sources: results.flatMap(r => r.sources)
    };

    console.log('Search results:', combinedResults);
    return combinedResults;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

const processWithLLM = async (results, model) => {
  // Combine and structure results
  const combinedContent = results.map(r => r.content).join('\n\n');
  const allSources = results.flatMap(r => r.sources);

  // Process with selected model
  const processedContent = `Processed with ${model}:\n${combinedContent}`;

  return {
    content: processedContent,
    sources: allSources
  };
}; 