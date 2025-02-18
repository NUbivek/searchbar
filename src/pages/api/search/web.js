// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 03:28:21
// Current User's Login: NUbivek

import { searchWeb } from '@/lib/search';
import { 
  formatPromptForModel, 
  getModelStopTokens, 
  getModelById,
  getApiModel 
} from '@/utils/modelHelpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
  if (!TOGETHER_API_KEY) {
    return res.status(401).json({ message: 'Together API key is missing' });
  }

  try {
    const { query, model } = req.body;
    console.log('Received request:', { query, model }); // Debug log

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const selectedModel = getModelById(model);
    console.log('Selected model:', selectedModel); // Debug log

    if (!selectedModel) {
      return res.status(400).json({ message: 'Invalid model selection' });
    }

    // Perform web search
    console.log('Performing web search for query:', query); // Debug log
    const searchResults = await searchWeb(query);
    console.log('Search results:', searchResults); // Debug log

    // Construct prompt for LLM
    const prompt = constructPrompt(query, searchResults);
    console.log('Constructed prompt:', prompt); // Debug log

    const apiModel = getApiModel(model);
    console.log('API Model:', apiModel); // Debug log

    const requestBody = {
      model: apiModel,
      prompt: formatPromptForModel(prompt, selectedModel),
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.9,
      stop: getModelStopTokens(selectedModel.id)
    };

    console.log('Calling Together API...'); // Debug log
    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('API Response:', { 
      status: response.status, 
      ok: response.ok,
      data: data 
    }); // Debug log

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}: ${JSON.stringify(data)}`);
    }

    // Process the response to include clickable links
    const rawAnswer = data.choices?.[0]?.text || '';
    console.log('Raw answer:', rawAnswer); // Debug log

    const processedAnswer = processResponseWithLinks(rawAnswer, searchResults);
    console.log('Processed answer:', processedAnswer); // Debug log

    return res.status(200).json({
      answer: processedAnswer,
      sources: searchResults,
      markdown: true
    });

  } catch (error) {
    console.error('Search processing error:', {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error
    });
    return res.status(500).json({
      message: 'Failed to process web search',
      details: error.message
    });
  }
}

function constructPrompt(query, searchResults) {
  // Create the search results section with proper source numbering
  const searchResultsText = searchResults.map((result, index) => `
[Source ${index + 1}]
Title: ${result.title}
URL: ${result.url}
Content: ${result.snippet}
`).join('\n');

  // Construct the full prompt with proper source number references
  return `Please analyze the following web search results for the query: "${query}"

Search Results:
${searchResultsText}

Please provide:
1. A comprehensive answer based on these search results
2. Include specific citations using markdown links: [Source X](URL) for each claim
3. Use direct quotes when relevant, followed by the source link
4. Be factual and precise

Format your response in a clear, readable way with:
- Main points and key findings
- Supporting evidence from the sources (with clickable links)
- Any relevant comparisons or contrasts
- Conclusions based on the available information

Remember: Every source citation should be a clickable link in markdown format [Source X](URL) where X is the source number (1-${searchResults.length}).`;
}

function processResponseWithLinks(text, searchResults) {
  let processedText = text;
  
  // First, handle any existing markdown-style links
  searchResults.forEach((result, index) => {
    const sourceNum = index + 1;
    const markdownLinkPattern = new RegExp(`\\[Source ${sourceNum}\\]\\(${sourceNum}\\)`, 'g');
    processedText = processedText.replace(markdownLinkPattern, 
      `[Source ${sourceNum}](${result.url})`
    );
  });

  // Then handle traditional [Source X] citations
  searchResults.forEach((result, index) => {
    const sourceNum = index + 1;
    const traditionalPattern = new RegExp(`\\[Source ${sourceNum}\\](?!\\()`, 'g');
    processedText = processedText.replace(traditionalPattern, 
      `[Source ${sourceNum}](${result.url})`
    );
  });

  // Clean up any remaining non-linked citations
  searchResults.forEach((result, index) => {
    const sourceNum = index + 1;
    const cleanupPattern = new RegExp(`Source ${sourceNum}(?!\\])`, 'g');
    processedText = processedText.replace(cleanupPattern, 
      `[Source ${sourceNum}](${result.url})`
    );
  });

  // Replace any remaining (URL) with actual URLs
  searchResults.forEach((result, index) => {
    const sourceNum = index + 1;
    processedText = processedText.replace(
      new RegExp(`\\[Source ${sourceNum}\\]\\(URL\\)`, 'g'),
      `[Source ${sourceNum}](${result.url})`
    );
  });

  return processedText;
}