/**
 * LinkedIn API Test Script
 * 
 * This script tests LinkedIn API connectivity by attempting to make API calls
 * to LinkedIn's endpoints using a provided access token.
 * 
 * Usage:
 * node scripts/test-linkedin-api.js <access_token>
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Get token from command line or use a default
const token = process.argv[2];

if (!token) {
  console.error('\x1b[31mError: No access token provided\x1b[0m');
  console.log('Usage: node scripts/test-linkedin-api.js <access_token>');
  console.log('\nTo get an access token:');
  console.log('1. Login to your application');
  console.log('2. Connect with LinkedIn');
  console.log('3. Look in your browser\'s cookies for "linkedin_access_token"');
  console.log('4. Or use the debug endpoint /api/auth/linkedin/debug to see if you have a valid token');
  process.exit(1);
}

// Print token info
console.log(`\x1b[36mTesting with token: ${token.substring(0, 10)}...\x1b[0m`);
console.log(`Token length: ${token.length} characters`);

// Test endpoints
const testEndpoints = async () => {
  let endpointResults = [];
  
  // Default headers with token
  const headers = {
    Authorization: `Bearer ${token}`,
    'cache-control': 'no-cache',
    'X-Restli-Protocol-Version': '2.0.0'
  };

  // Test profile endpoint
  try {
    console.log('\n\x1b[36mTesting "me" endpoint...\x1b[0m');
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', { headers });
    console.log('\x1b[32m✓ Profile endpoint successful\x1b[0m');
    console.log('Name:', `${profileResponse.data.localizedFirstName} ${profileResponse.data.localizedLastName}`);
    console.log('ID:', profileResponse.data.id);
    endpointResults.push({ endpoint: 'profile', success: true });
  } catch (error) {
    console.log('\x1b[31m✗ Profile endpoint failed\x1b[0m');
    console.log('Error:', error.response?.data?.message || error.message);
    endpointResults.push({ endpoint: 'profile', success: false, error: error.response?.data || error.message });
  }

  // Test email endpoint
  try {
    console.log('\n\x1b[36mTesting email endpoint...\x1b[0m');
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', { headers });
    if (emailResponse.data?.elements?.[0]?.['handle~']?.emailAddress) {
      console.log('\x1b[32m✓ Email endpoint successful\x1b[0m');
      console.log('Email:', emailResponse.data.elements[0]['handle~'].emailAddress);
      endpointResults.push({ endpoint: 'email', success: true });
    } else {
      console.log('\x1b[33m△ Email endpoint returned, but no email found (scope issue?)\x1b[0m');
      endpointResults.push({ endpoint: 'email', success: false, error: 'No email in response (may need r_emailaddress scope)' });
    }
  } catch (error) {
    console.log('\x1b[31m✗ Email endpoint failed\x1b[0m');
    console.log('Error:', error.response?.data?.message || error.message);
    endpointResults.push({ endpoint: 'email', success: false, error: error.response?.data || error.message });
  }

  // Test connections endpoint
  try {
    console.log('\n\x1b[36mTesting connections endpoint...\x1b[0m');
    const connectionsResponse = await axios.get('https://api.linkedin.com/v2/connections?q=viewer&start=0&count=10', { headers });
    console.log('\x1b[32m✓ Connections endpoint successful\x1b[0m');
    const count = connectionsResponse.data.elements?.length || 0;
    console.log(`Found ${count} connections`);
    endpointResults.push({ endpoint: 'connections', success: true, count });
  } catch (error) {
    console.log('\x1b[31m✗ Connections endpoint failed\x1b[0m');
    console.log('Error:', error.response?.data?.message || error.message);
    
    // Special handling for common connections issues
    if (error.response?.status === 403) {
      console.log('\x1b[33mThis is likely a permission issue - check if you have the r_1st_connections scope\x1b[0m');
    }
    
    endpointResults.push({ endpoint: 'connections', success: false, error: error.response?.data || error.message });
  }

  // Print summary
  console.log('\n\x1b[36m=== TEST SUMMARY ===\x1b[0m');
  const successCount = endpointResults.filter(r => r.success).length;
  console.log(`${successCount}/${endpointResults.length} endpoints successful`);
  
  if (successCount < endpointResults.length) {
    console.log('\n\x1b[33mSuggestions:\x1b[0m');
    console.log('1. Check if your token is valid and not expired');
    console.log('2. Verify you have the correct OAuth scopes enabled in LinkedIn Developer Console:');
    console.log('   - r_emailaddress');
    console.log('   - r_liteprofile');
    console.log('   - r_basicprofile');
    console.log('   - r_1st_connections');
    console.log('3. Ensure your application is properly configured in LinkedIn Developer Console');
  }
};

// Run the tests
testEndpoints().catch(error => {
  console.error('\x1b[31mUnexpected error:\x1b[0m', error);
});
