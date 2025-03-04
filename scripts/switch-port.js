#!/usr/bin/env node
/**
 * Port Switching Utility for Searchbar
 * 
 * This script helps you easily switch the application port by updating the BASE_URL
 * in your .env.local file. It also restarts the development server.
 * 
 * Usage: 
 *   node scripts/switch-port.js 3001
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get port from command line arguments
const newPort = process.argv[2];

if (!newPort || isNaN(parseInt(newPort))) {
  console.error('\x1b[31mError: Please provide a valid port number\x1b[0m');
  console.log('Usage: node scripts/switch-port.js PORT_NUMBER');
  console.log('Example: node scripts/switch-port.js 3001');
  process.exit(1);
}

// Environment file paths
const envPath = path.resolve(process.cwd(), '.env.local');

try {
  // Check if .env.local exists
  if (!fs.existsSync(envPath)) {
    console.error('\x1b[31mError: .env.local file not found\x1b[0m');
    console.log('Make sure you are running this from the project root directory');
    process.exit(1);
  }

  // Read the current .env.local file
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update the BASE_URL with the new port
  const baseUrlRegex = /(NEXT_PUBLIC_BASE_URL=http:\/\/localhost:)(\d+)/;
  
  if (baseUrlRegex.test(envContent)) {
    // Replace the existing port with the new one
    envContent = envContent.replace(baseUrlRegex, `$1${newPort}`);
    console.log(`\x1b[32mUpdating port to ${newPort}\x1b[0m`);
  } else {
    // Add the BASE_URL line if it doesn't exist
    envContent = `NEXT_PUBLIC_BASE_URL=http://localhost:${newPort}\n${envContent}`;
    console.log(`\x1b[32mAdding NEXT_PUBLIC_BASE_URL with port ${newPort}\x1b[0m`);
  }

  // Write the updated content back to .env.local
  fs.writeFileSync(envPath, envContent);
  console.log('\x1b[32mSuccessfully updated .env.local\x1b[0m');

  // Print reminder about provider developer consoles
  console.log('\n\x1b[33mImportant Reminder:\x1b[0m');
  console.log('Make sure to update the redirect URIs in your provider developer consoles:');
  console.log(`- Twitter: http://localhost:${newPort}/api/auth/twitter/callback`);
  console.log(`- LinkedIn: http://localhost:${newPort}/api/auth/linkedin/callback`);
  console.log(`- Reddit: http://localhost:${newPort}/api/auth/reddit/callback`);
  console.log(`- Facebook: http://localhost:${newPort}/api/auth/facebook/callback\n`);

  // Ask if the user wants to restart the dev server
  console.log('\x1b[32mPort updated successfully!\x1b[0m');
  console.log('To apply changes, restart your development server with:');
  console.log(`\x1b[36mnpm run dev -- -p ${newPort}\x1b[0m`);

} catch (error) {
  console.error('\x1b[31mError updating port:\x1b[0m', error.message);
  process.exit(1);
}
