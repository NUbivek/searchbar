// Next.js API route for search
import { searchVerifiedSources } from '../../utils/verifiedSearch';
import { processWithLLM } from '../../utils/llm-exports';

export default async function handler(req, res) {
  console.log('Search API endpoint called');
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { query, sources = [], urls = [], files = [], model = 'mixtral-8x7b' } = req.body;
    
    console.log('Search request received:', { 
      query, 
      sources, 
      urls, 
      files,
      model 
    });
    
    // Validate inputs
    if (!query || query.trim() === '') {
      console.log('Missing query parameter');
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    if (!Array.isArray(sources) || sources.length === 0) {
      console.log('No sources selected');
      return res.status(400).json({ error: 'At least one source must be selected' });
    }
    
    // Perform the search
    console.log('Calling searchVerifiedSources with query:', query);
    const searchResults = await searchVerifiedSources(query, { sources, urls, files });
    
    console.log('Search results received, count:', searchResults.length);
    if (searchResults.length > 0) {
      console.log('First result sample:', JSON.stringify(searchResults[0]).substring(0, 200) + '...');
    }
    
    // Process with LLM if a model is selected
    let processedResults = searchResults;
    
    if (model && searchResults.length > 0) {
      console.log('Processing results with LLM model:', model);
      try {
        const llmResult = await processWithLLM(query, searchResults, '', model);
        console.log('LLM processing complete, result:', JSON.stringify(llmResult).substring(0, 200) + '...');
        
        if (llmResult) {
          processedResults = [{
            synthesizedAnswer: {
              summary: llmResult.content || 'No content generated',
              sources: searchResults.map(result => ({
                title: result.title || 'Untitled Source',
                url: result.link || '#'
              })),
              followUpQuestions: llmResult.followUpQuestions || []
            }
          }];
          
          console.log('Processed results created with synthesizedAnswer');
        }
      } catch (llmError) {
        console.error('LLM processing error:', llmError);
        // If LLM processing fails, return the raw search results
        console.log('Falling back to raw search results due to LLM error');
      }
    }
    
    console.log('Returning results count:', processedResults.length);
    
    // Return the results
    return res.status(200).json({
      results: processedResults,
      query,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ 
      error: 'An error occurred during search',
      details: error.message 
    });
  }
} 