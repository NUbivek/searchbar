export async function processOpenSources({ query, model, sources }) {
  const enabledSources = Object.entries(sources)
    .filter(([_, isEnabled]) => isEnabled)
    .map(([source]) => source);

  const results = await Promise.all(
    enabledSources.map(async (source) => {
      try {
        const response = await searchSpecificSource(source, query);
        return {
          source,
          content: response.content,
          urls: response.urls,
          confidence: response.confidence
        };
      } catch (error) {
        console.error(`Error searching ${source}:`, error);
        return null;
      }
    })
  );

  return results.filter(Boolean);
}

async function searchSpecificSource(source, query) {
  // Implement source-specific search logic
  switch (source) {
    case 'linkedin':
      return await searchLinkedIn(query);
    case 'x':
      return await searchTwitter(query);
    case 'reddit':
      return await searchReddit(query);
    // ... implement other source searches
    default:
      return await searchWeb(query);
  }
} 