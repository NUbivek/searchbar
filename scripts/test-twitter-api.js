/**
 * Twitter API Test Script
 * 
 * This script tests Twitter API connectivity using a provided access token.
 * It attempts to fetch user profile data and following information.
 * 
 * Usage:
 * node scripts/test-twitter-api.js <access_token>
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Get token from command line or use a default
const token = process.argv[2];

if (!token) {
  console.error('\x1b[31mError: No access token provided\x1b[0m');
  console.log('Usage: node scripts/test-twitter-api.js <access_token>');
  console.log('\nTo get an access token:');
  console.log('1. Login to your application');
  console.log('2. Connect with Twitter');
  console.log('3. Look in your browser\'s cookies for "twitter_access_token"');
  console.log('4. Or use the debug endpoint /api/auth/twitter/debug to see if you have a valid token');
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
    'Content-Type': 'application/json'
  };

  // Test profile endpoint (me)
  try {
    console.log('\n\x1b[36mTesting user profile endpoint...\x1b[0m');
    const profileResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers,
      params: {
        'user.fields': 'name,username,profile_image_url,description'
      }
    });
    console.log('\x1b[32m✓ Profile endpoint successful\x1b[0m');
    console.log('User:', profileResponse.data.data?.name);
    console.log('Username:', profileResponse.data.data?.username);
    console.log('ID:', profileResponse.data.data?.id);
    
    // Store user ID for later requests
    const userId = profileResponse.data.data?.id;
    endpointResults.push({ endpoint: 'profile', success: true, userId });
    
    // Test followers endpoint
    if (userId) {
      try {
        console.log('\n\x1b[36mTesting following endpoint...\x1b[0m');
        const followingResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/following`, {
          headers,
          params: {
            'max_results': 10,
            'user.fields': 'name,username'
          }
        });
        
        const followingCount = followingResponse.data.meta?.result_count || 0;
        console.log('\x1b[32m✓ Following endpoint successful\x1b[0m');
        console.log(`Found ${followingCount} following`);
        
        if (followingResponse.data.data && followingResponse.data.data.length > 0) {
          console.log('\nSample following:');
          followingResponse.data.data.slice(0, 3).forEach(user => {
            console.log(`- ${user.name} (@${user.username})`);
          });
        }
        
        endpointResults.push({ endpoint: 'following', success: true, count: followingCount });
      } catch (error) {
        console.log('\x1b[31m✗ Following endpoint failed\x1b[0m');
        console.log('Error:', error.response?.data?.detail || error.message);
        endpointResults.push({ 
          endpoint: 'following', 
          success: false, 
          error: error.response?.data || error.message 
        });
      }
    }
  } catch (error) {
    console.log('\x1b[31m✗ Profile endpoint failed\x1b[0m');
    console.log('Error:', error.response?.data?.detail || error.message);
    endpointResults.push({ 
      endpoint: 'profile', 
      success: false, 
      error: error.response?.data || error.message 
    });
  }

  // Print summary
  console.log('\n\x1b[36m=== TEST SUMMARY ===\x1b[0m');
  const successCount = endpointResults.filter(r => r.success).length;
  console.log(`${successCount}/${endpointResults.length} endpoints successful`);
  
  if (successCount < endpointResults.length) {
    console.log('\n\x1b[33mSuggestions:\x1b[0m');
    console.log('1. Check if your token is valid and not expired');
    console.log('2. Verify you have the correct OAuth scopes enabled in Twitter Developer Console:');
    console.log('   - tweet.read');
    console.log('   - users.read');
    console.log('   - follows.read');
    console.log('3. Ensure your application is properly configured in Twitter Developer Console');
    
    // Specific error suggestions
    if (endpointResults.some(r => r.error?.title === 'Unauthorized')) {
      console.log('\n\x1b[33mUnauthorized error detected:\x1b[0m');
      console.log('- Your access token may be expired or invalid');
      console.log('- Make sure you\'re using the correct authentication token');
    }
    
    if (endpointResults.some(r => String(r.error?.detail).includes('forbidden'))) {
      console.log('\n\x1b[33mForbidden error detected:\x1b[0m');
      console.log('- Your app may not have the required permissions');
      console.log('- Check the OAuth scopes in your Twitter Developer Portal');
    }
  }
};

// Run the tests
testEndpoints().catch(error => {
  console.error('\x1b[31mUnexpected error:\x1b[0m', error);
});
