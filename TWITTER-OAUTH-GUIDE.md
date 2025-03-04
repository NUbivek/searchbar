# Twitter OAuth Integration Guide

This guide provides instructions for setting up and troubleshooting the Twitter (X) OAuth integration for the Network Map feature.

## Configuration Steps

1. **Create a Twitter Developer Account and Project**:
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create a new project and app
   - Set the app to have OAuth 2.0 enabled
   - In the OAuth 2.0 section, find your Client ID and Client Secret
   - Client ID should look like: `QzU0a01zRS1CbW9oSXNSOTNZbGc6MTpjaQ`

2. **Configure OAuth Settings in Twitter Developer Portal**:
   - Add authorized redirect URLs:
     ```
     http://localhost:3000/api/auth/twitter/callback
     ```
   - Request the following OAuth 2.0 scopes:
     - tweet.read
     - users.read
     - follows.read
     - offline.access (for refresh tokens)

3. **Configure Type of App**:
   - Set your app type to "Web App" 
   - Enable "OAuth 2.0 Code Flow with PKCE"
   - Make sure "Client authentication" is set appropriately (public client if no client secret)

4. **Add Environment Variables**:
   - Copy `.env.local.example` to `.env.local` if not already done
   - Fill in these environment variables:
     ```
     TWITTER_CLIENT_ID=your_twitter_client_id        # From OAuth 2.0 section
     TWITTER_CLIENT_SECRET=your_twitter_client_secret
     TWITTER_API_KEY=your_twitter_api_key           # Legacy v1 API key if you have it
     TWITTER_API_SECRET=your_twitter_api_secret     # Legacy v1 API secret if you have it
     TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/twitter/callback
     
     # Frontend Twitter OAuth variables
     NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id  # Same as TWITTER_CLIENT_ID
     NEXT_PUBLIC_TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/twitter/callback
     ```

## Troubleshooting

If you encounter issues with the Twitter OAuth integration, use these troubleshooting steps:

1. **Use the Debug Tool**:
   - In development mode, a debug panel is shown at the bottom of the Network page
   - Select "Twitter" from the tabs
   - Click "Check Configuration" to verify your setup

2. **Common Issues**:
   - **Client ID Format**: The Client ID should look like `QzU0a01zRS1CbW9oSXNSOTNZbGc6MTpjaQ`
   - **Redirect URI Mismatch**: Ensure the redirect URI in Twitter Developer Console exactly matches your environment variable
   - **Missing Scopes**: Verify all required scopes are requested
   - **PKCE Implementation**: For production, implement proper PKCE with SHA-256 hashing 
   - **Rate Limits**: Twitter has strict rate limits, which may cause temporary failures

3. **Check Network Tab**:
   - Use browser DevTools to examine the network requests
   - Look for requests to `twitter.com/i/oauth2/authorize`
   - Check for specific error codes in the response

4. **Debug Endpoint**:
   - Access `/api/auth/twitter/debug` for detailed configuration information

## OAuth Flow

The integration follows this flow:

1. User clicks "Connect" on the Twitter card in Network Map
2. Application generates state parameter and code verifier for PKCE
3. User is redirected to Twitter for authorization
4. Twitter redirects back to `/api/auth/twitter/callback` with an authorization code
5. Server exchanges code for access token and refresh token, setting secure cookies
6. User is redirected back to the Network Map with auth success flag
7. Frontend detects success, updates UI, and fetches connection data

## Testing

To test the integration:

1. Start the development server: `npm run dev`
2. Go to the Network Map page: `http://localhost:3000/network`
3. Click "Connect" on Twitter
4. Complete Twitter's authentication process
5. You should be redirected back to the Network Map page
6. Your Twitter following should be displayed in the visualization

## X API Specifics

The Twitter (X) API has some important specifics to be aware of:

1. **OAuth 2.0 Implementation**:
   - Twitter now supports modern OAuth 2.0 with PKCE
   - This is preferred over the older OAuth 1.0a approach

2. **Token Management**:
   - Access tokens expire (usually after 2 hours)
   - Refresh tokens can be used to obtain new access tokens
   - Our implementation stores these in secure HTTP-only cookies

3. **Rate Limiting**:
   - Twitter has strict rate limits - respect them to avoid being blocked
   - Our implementation includes backoff handling

4. **API Version**:
   - We use the Twitter API v2 endpoints
   - Legacy API keys (v1.1) are not compatible with v2 OAuth 2.0 flow

## OAuth Relay System

The searchbar application now includes a sophisticated OAuth relay system that solves the port-switching problem:

1. **How It Works**:
   - Configure OAuth providers to use your production URLs (e.g. `https://research.bivek.ai/api/relay/twitter`)
   - When authenticating, the provider redirects to your production site
   - The relay system captures the OAuth code and presents options to redirect to your local development server
   - Your local server then completes the authentication process

2. **Production Configuration**:
   - Configure the following callback URLs in your Twitter Developer Console:
     ```
     https://research.bivek.ai/api/relay/twitter
     ```
   - This URL will never change, even when you switch ports during local development

3. **Environment Variables**:
   - Set up your `.env.local` file with these settings:
     ```
     NEXT_PUBLIC_BASE_URL=http://localhost:3001
     NEXT_PUBLIC_PRODUCTION_URL=https://research.bivek.ai
     NEXT_PUBLIC_USE_PRODUCTION_CALLBACKS=true
     ```
   - The `NEXT_PUBLIC_USE_PRODUCTION_CALLBACKS=true` setting tells your local app to use the production URL for redirects

4. **Port Switching**:
   - You can still use the convenience commands to switch ports:
     ```
     npm run dev:3000  # Start on port 3000
     npm run dev:3001  # Start on port 3001
     npm run dev:3002  # Start on port 3002
     ```
   - The relay system will automatically detect your local port for redirection

## Support

If you continue to encounter issues:

1. Use the debug endpoint at `/api/auth/twitter/debug` to check your configuration
2. Make sure your Client ID is correct and formatted properly
3. Verify that your redirect URI matches exactly between your code and Twitter settings
4. Check the Twitter Developer Portal for any app-specific restrictions or issues
