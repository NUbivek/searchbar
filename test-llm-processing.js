// LLM Processing Test Script
// This script tests the flow of:
// 1. Getting search results from Serper API
// 2. Processing those results with Together AI

const axios = require('axios');

// API Keys
const SERPER_API_KEY = process.env.SERPER_API_KEY || '16b868c363b378bf23924f13204887c23bc11b3a';
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || '15a66263c48b3736db06ba44e4c5992bf7fbd86c1c97e53efcf0f3366f624c2b';

// Configuration
const QUERY = process.argv[2] || 'latest AI research papers';
const MODEL = 'mistralai/Mistral-7B-v0.1';

// Custom prompt formatter function (since we can't import the one from the project)
function formatSearchPrompt(query, sourceData) {
  // Create a system prompt
  const systemPrompt = `You are an AI assistant tasked with analyzing search results about the query: "${query}". 
` +
    `Carefully analyze the provided sources and generate a comprehensive but concise analysis. 
` +
    `Include key points, insights, and important information from the sources.
` +
    `Format your response with proper headings, bullet points, and paragraphs.
`;
  
  // Format the source data
  const formattedSources = sourceData.map((source, index) => {
    return `[SOURCE ${index + 1}]
` +
      `Title: ${source.title || 'Untitled'}
` +
      `URL: ${source.url || 'No URL'}
` +
      `Content: ${source.content || 'No content available'}
`;
  }).join('\n');
  
  // Combine everything into a single prompt
  return `${systemPrompt}\n\n${formattedSources}\n\nAnalyze the above sources and provide a comprehensive summary about "${query}":`;
}

// 1. Function to get search results from Serper API
async function getSearchResults(query) {
  console.log(`\n📊 Fetching search results for query: "${query}"`);
  
  try {
    const response = await axios.post('https://google.serper.dev/search', {
      q: query,
      gl: 'us',
      hl: 'en',
    }, {
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Successfully retrieved ${response.data.organic?.length || 0} search results from Serper`);
    
    // Transform the results into a format suitable for LLM processing
    return (response.data.organic || []).map(item => ({
      title: item.title,
      content: item.snippet,
      url: item.link,
      source: 'web'
    }));
  } catch (error) {
    console.error('❌ Error fetching search results:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// 2. Function to process results with Together AI LLM
async function processWithLLM(query, sources, model = MODEL) {
  console.log(`\n🧠 Processing ${sources.length} search results with LLM`);
  console.log(`🤖 Using model: ${model}`);
  
  try {
    // Format the prompt
    const formattedPrompt = formatSearchPrompt(query, sources);
    console.log('\n📝 Formatted prompt preview:');
    console.log(formattedPrompt.substring(0, 500) + '...\n');
    
    const response = await axios.post('https://api.together.xyz/v1/completions', {
      model: model,
      prompt: formattedPrompt,
      max_tokens: 2000,
      temperature: 0.3,
      stop: ["\n\n\n"]
    }, {
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Successfully processed results with LLM');
    
    const result = response.data.choices[0].text;
    return {
      content: result,
      sources: sources,
      followUpQuestions: [], // Ideally we'd extract these from the response
      __isImmutableLLMResult: true,
      isLLMResults: true,
      llmProcessed: true,
      query: query
    };
  } catch (error) {
    console.error('❌ Error processing with LLM:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Main function
async function testLLMProcessing() {
  console.log('🔍 Starting LLM Processing Test');
  console.log('================================');
  
  try {
    // Step 1: Get search results
    const searchResults = await getSearchResults(QUERY);
    console.log(`Found ${searchResults.length} search results`);
    
    // Print sample results
    if (searchResults.length > 0) {
      console.log('\n📑 Sample search result:');
      console.log(JSON.stringify(searchResults[0], null, 2));
    }
    
    // Step 2: Process with LLM
    const llmResponse = await processWithLLM(QUERY, searchResults);
    
    // Step 3: Display LLM response
    console.log('\n✨ LLM Processing Complete ✨');
    console.log('------------------------------');
    console.log('📊 Original Query:', QUERY);
    console.log('📚 Number of Sources:', searchResults.length);
    console.log('\n📝 LLM Response Content:');
    console.log(llmResponse.content);
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the test
testLLMProcessing();
