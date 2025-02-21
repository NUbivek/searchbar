import { searchDeepWeb } from './deepWebSearch';
import { sourceHandlers } from './sourceIntegration';

export async function searchOpenSources(query, selectedSources) {
  const results = [];

  // Deep web search
  const webResults = await searchDeepWeb(query);
  results.push(...webResults);

  // Source-specific search
  if (selectedSources?.length > 0) {
    const sourceResults = await Promise.allSettled(
      selectedSources.map(source => 
        sourceHandlers[source.toLowerCase()](query)
      )
    );

    results.push(
      ...sourceResults
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value)
    );
  }

  return results;
} 