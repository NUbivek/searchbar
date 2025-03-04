/**
 * Script to verify environment variables
 * Run with: node scripts/verify-env-vars.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// LinkedIn environment variables to check
const linkedinVars = [
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'LINKEDIN_REDIRECT_URI'
];

console.log('\n===== LinkedIn OAuth Configuration =====');
linkedinVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✓' : '✗';
  const coloredStatus = value ? '\x1b[32m' + status + '\x1b[0m' : '\x1b[31m' + status + '\x1b[0m';
  
  console.log(`${coloredStatus} ${varName}: ${value || 'NOT SET'}`);
  
  // Additional validation
  if (varName === 'LINKEDIN_CLIENT_ID' && value) {
    if (value.length < 10) {
      console.log('\x1b[33m⚠ LINKEDIN_CLIENT_ID looks too short. Check if it\'s correct.\x1b[0m');
    }
  }
  
  if (varName === 'LINKEDIN_CLIENT_SECRET' && value) {
    if (!value.includes('=') || value.length < 15) {
      console.log('\x1b[33m⚠ LINKEDIN_CLIENT_SECRET format looks unusual. Check if it\'s correct.\x1b[0m');
    }
  }
});

// Check if LinkedIn redirect URI is valid
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
if (redirectUri) {
  try {
    const url = new URL(redirectUri);
    console.log(`\n✓ LINKEDIN_REDIRECT_URI is a valid URL: ${url.href}`);
  } catch (error) {
    console.log(`\n\x1b[31m✗ LINKEDIN_REDIRECT_URI is not a valid URL: ${error.message}\x1b[0m`);
  }
}

console.log('\n===== Other Important Environment Variables =====');
const otherVars = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_BASE_URL'
];

otherVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✓' : '-';
  const coloredStatus = value ? '\x1b[32m' + status + '\x1b[0m' : '\x1b[90m' + status + '\x1b[0m';
  
  console.log(`${coloredStatus} ${varName}: ${value || 'NOT SET'}`);
});

console.log('\n===== Full LinkedIn OAuth Authorization URL Example =====');
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_REDIRECT_URI) {
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', process.env.LINKEDIN_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', process.env.LINKEDIN_REDIRECT_URI);
  authUrl.searchParams.append('state', 'example123');
  authUrl.searchParams.append('scope', 'r_emailaddress r_liteprofile');
  
  console.log(authUrl.toString());
} else {
  console.log('\x1b[31mCannot generate example URL: Required environment variables are missing\x1b[0m');
}

console.log('\nIf you need to update these values, edit the .env.local file in the project root directory.');
