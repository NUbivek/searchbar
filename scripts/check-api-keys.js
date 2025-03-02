/**
 * Check API Keys - Utility script to verify required API keys
 * 
 * This script checks if all the necessary API keys for search functionality
 * are properly set in the .env or .env.local file.
 */

// Load environment variables
require('dotenv').config();

// Check for required API keys
const requiredKeys = [
  { name: 'SERPER_API_KEY', description: 'Required for web search functionality' },
  { name: 'TOGETHER_API_KEY', description: 'Together API for LLM processing' },
  { name: 'PERPLEXITY_API_KEY', description: 'Perplexity API for LLM processing' },
  { name: 'TWITTER_API_KEY', description: 'Twitter/X API for social search' },
  { name: 'LINKEDIN_CLIENT_ID', description: 'LinkedIn API client ID' },
  { name: 'REDDIT_CLIENT_ID', description: 'Reddit API client ID' },
  { name: 'FMP_API_KEY', description: 'Financial Modeling Prep API key' },
  { name: 'NEXT_PUBLIC_BASE_URL', description: 'Base URL for API calls' }
];

// Display results
console.log('Checking API Keys for SearchBar Application\n');

let missingKeys = 0;

requiredKeys.forEach(key => {
  const value = process.env[key.name];
  
  if (!value) {
    console.log(`❌ ${key.name}: ${key.optional ? 'MISSING (optional)' : 'MISSING (required)'}`);
    console.log(`   ${key.description}`);
    if (!key.optional) missingKeys++;
  } else {
    console.log(`✅ ${key.name}: PRESENT`);
  }
  console.log('');
});

// Summary
if (missingKeys > 0) {
  console.log(`\n⚠️  Missing ${missingKeys} required API keys. Search functionality may not work properly.`);
  console.log('\nPlease add the missing keys to your .env or .env.local file:');
  console.log('\nSERPER_API_KEY=your_serper_api_key_here');
  console.log('LLM_API_KEY=your_llm_api_key_here');
} else {
  console.log('\n✅ All required API keys are present!');
}
