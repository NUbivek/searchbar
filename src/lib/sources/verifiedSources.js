import { getVerifiedPartners } from '@/config/vcAccounts';

export async function processVerifiedSources({ query, model, sourceScope, customSources }) {
  const verifiedSources = getVerifiedPartners();
  
  // Process based on source scope
  const sources = sourceScope === 'combined'
    ? [...verifiedSources, ...processCustomSources(customSources)]
    : processCustomSources(customSources);

  // Search through sources
  const results = await Promise.all(
    sources.map(async (source) => {
      try {
        const response = await searchSource(source, query);
        return {
          source: source.name || source.url,
          content: response.content,
          url: source.url,
          confidence: response.confidence
        };
      } catch (error) {
        console.error(`Error searching source ${source.name || source.url}:`, error);
        return null;
      }
    })
  );

  return results.filter(Boolean);
}

function processCustomSources({ files, urls }) {
  const processedFiles = files.map(file => ({
    type: 'file',
    name: file.name,
    content: file.content,
    url: null
  }));

  const processedUrls = urls.map(url => ({
    type: 'url',
    name: url,
    url: url
  }));

  return [...processedFiles, ...processedUrls];
} 