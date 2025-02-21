import axios from 'axios';
import { load } from 'cheerio';

export async function searchDeepWeb(query) {
  try {
    // Use DuckDuckGo API
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        no_redirect: 1,
        t: 'ResearchHub'
      }
    });

    // Extract and enrich results
    const results = await enrichResults(formatDuckDuckGoResults(response.data));

    // Remove duplicates and rank results
    return rankAndDeduplicate(results);
  } catch (error) {
    console.error('Deep web search error:', error);
    return [];
  }
}

function formatDuckDuckGoResults(data) {
  const results = [];

  // Add abstract if available
  if (data.Abstract) {
    results.push({
      title: data.Heading,
      content: data.Abstract,
      url: data.AbstractURL,
      type: 'abstract',
      source: 'duckduckgo'
    });
  }

  // Add related topics
  data.RelatedTopics.forEach(topic => {
    if (topic.Text) {
      results.push({
        title: topic.FirstURL.split('/').pop().replace(/_/g, ' '),
        content: topic.Text,
        url: topic.FirstURL,
        type: 'related',
        source: 'duckduckgo'
      });
    }
  });

  return results;
}

async function enrichResults(results) {
  const enrichedResults = await Promise.allSettled(
    results.map(async result => {
      try {
        // Fetch page content
        const response = await axios.get(result.url, {
          timeout: 5000,
          maxContentLength: 10000000 // 10MB
        });

        const $ = load(response.data);
        
        // Extract main content
        const content = $('article, main, .content, #content')
          .first()
          .text()
          .trim();

        return {
          ...result,
          fullContent: content || $('body').text().trim(),
          verified: true
        };
      } catch (error) {
        return result;
      }
    })
  );

  return enrichedResults
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
}

function rankAndDeduplicate(results) {
  // Remove duplicates based on URL
  const uniqueResults = [...new Map(results.map(r => [r.url, r])).values()];

  // Rank based on content quality and verification
  return uniqueResults.sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    return scoreB - scoreA;
  });
}

function calculateScore(result) {
  let score = 0;
  if (result.verified) score += 2;
  if (result.fullContent) score += 2;
  if (result.title && result.title.length > 10) score += 1;
  return score;
} 