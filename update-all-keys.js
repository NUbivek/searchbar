const fs = require('fs');
const path = require('path');

// All API keys to update
const apiKeys = {
  'TOGETHER_API_KEY': '15a66263c48b3736db06ba44e4c5992bf7fbd86c1c97e53efcf0f3366f624c2b',
  'PERPLEXITY_API_KEY': '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',
  'SERPER_API_KEY': 'baf95a793c6cad7a077fc1a75d13077afcea8073',
  'TWITTER_API_KEY': '1892373629142519808bivekadhi',
  'LINKEDIN_CLIENT_ID': '86lb62fau9v8nx',
  'LINKEDIN_CLIENT_SECRET': 'WPL_AP1.5gRxeKe5swRsrQMD.dsWb7g==',
  'REDDIT_CLIENT_ID': 'nvCLxJ1MoSYE5QGldbcGrg',
  'REDDIT_CLIENT_SECRET': '0sVb7qMzBPjpfV84215K5yLfrr_O9w',
  'FMP_API_KEY': '4aFTSqUInHVL5GDhFnfPVfAWbNAQFjTk',
  'FRED_API_KEY': 'e565632fe5d094c1e0056c3f0e265d24',
  'NEXT_PUBLIC_BASE_URL': 'http://localhost:3000',
  'NODE_ENV': 'development'
};

// Path to .env.local
const envLocalPath = path.join(__dirname, '.env.local');

// Create or update .env.local
let content = '';

// Check if .env.local exists
if (fs.existsSync(envLocalPath)) {
  console.log('.env.local exists, reading current content...');
  content = fs.readFileSync(envLocalPath, 'utf8');
} else {
  console.log('.env.local does not exist, creating it...');
}

// Update each API key
for (const [key, value] of Object.entries(apiKeys)) {
  const regex = new RegExp(`${key}=.*(\r?\n|$)`, 'g');
  
  if (content.includes(`${key}=`)) {
    // Replace existing key
    content = content.replace(regex, `${key}=${value}$1`);
    console.log(`Updated ${key}`);
  } else {
    // Add new key
    content += `${key}=${value}\n`;
    console.log(`Added ${key}`);
  }
}

// Write the updated content back to the file
fs.writeFileSync(envLocalPath, content);
console.log('Updated .env.local with all API keys');
console.log('Done! Please restart your Next.js server for the changes to take effect.');
