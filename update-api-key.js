const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envLocalPath = path.join(__dirname, '.env.local');

console.log('This script will help you update your Together API key in .env.local');
console.log('Current API key status:');

// Check if .env.local exists
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const togetherKeyMatch = envContent.match(/TOGETHER_API_KEY=([^\n]*)/);
  
  if (togetherKeyMatch) {
    const key = togetherKeyMatch[1];
    console.log(`Found existing API key: ${key.substring(0, 5)}...${key.substring(key.length - 5)}`);
  } else {
    console.log('No Together API key found in .env.local');
  }
} else {
  console.log('No .env.local file found. Will create one.');
}

rl.question('Enter your Together API key (from https://api.together.xyz/settings/api-keys): ', (apiKey) => {
  let envContent = '';
  
  // If .env.local exists, read it and update the API key
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
    
    if (envContent.match(/TOGETHER_API_KEY=([^\n]*)/)) {
      // Update existing key
      envContent = envContent.replace(/TOGETHER_API_KEY=([^\n]*)/, `TOGETHER_API_KEY=${apiKey}`);
    } else {
      // Add key if it doesn't exist
      envContent += `\nTOGETHER_API_KEY=${apiKey}`;
    }
  } else {
    // Create new .env.local with the API key
    envContent = `TOGETHER_API_KEY=${apiKey}\n`;
  }
  
  // Write the updated content back to .env.local
  fs.writeFileSync(envLocalPath, envContent);
  
  console.log('API key updated successfully!');
  console.log('Please restart your Next.js server for the changes to take effect.');
  
  rl.close();
});
