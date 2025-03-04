# LinkedIn OAuth Integration Guide

This guide provides instructions for setting up and troubleshooting the LinkedIn OAuth integration for the Network Map feature.

## Configuration Steps

1. **Create a LinkedIn Developer Application**:
   - Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
   - Create a new app
   - Note your Client ID and Client Secret

2. **Configure OAuth Settings in LinkedIn Developer Portal**:
   - Add authorized redirect URLs:
     ```
     http://localhost:3000/api/auth/linkedin/callback
     ```
   - Request the following OAuth 2.0 scopes:
     - r_emailaddress
     - r_liteprofile
     - r_basicprofile
     - r_1st_connections

3. **Add Environment Variables**:
   - Copy `.env.local.example` to `.env.local` if not already done
   - Fill in these environment variables:
     ```
     LINKEDIN_CLIENT_ID=your_linkedin_client_id
     LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
     LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
     
     # Frontend LinkedIn OAuth variables
     NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
     NEXT_PUBLIC_LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
     ```

## Troubleshooting

If you encounter issues with the LinkedIn OAuth integration, use these troubleshooting steps:

1. **Use the Debug Tool**:
   - In development mode, a debug panel is shown at the bottom of the Network page
   - Click "Check Configuration" to verify your setup

2. **Common Issues**:
   - **Redirect URI Mismatch**: Ensure the redirect URI in your LinkedIn Developer Console exactly matches the one in your `.env.local`
   - **Missing Scopes**: Double-check that you've requested all required scopes
   - **Invalid Cookies**: If authentication fails, try clearing cookies and re-authenticating

3. **Check Server Logs**:
   - Look for detailed error messages in your server logs
   - Pay attention to `LinkedIn token exchange error` messages

4. **Debug Endpoint**:
   - Access `/api/auth/linkedin/debug` for detailed configuration information

## OAuth Flow

The integration follows this flow:

1. User clicks "Connect" on the LinkedIn card in Network Map
2. User is redirected to LinkedIn for authorization
3. LinkedIn redirects back to `/api/auth/linkedin/callback` with an authorization code
4. Server exchanges code for access token and sets cookies
5. User is redirected back to the Network Map with auth success flag
6. Frontend detects success, updates UI, and fetches connection data

## Testing

To test the integration:

1. Start the development server: `npm run dev`
2. Go to the Network Map page: `http://localhost:3000/network`
3. Click "Connect" on LinkedIn
4. Complete LinkedIn's authentication process
5. You should be redirected back to the Network Map page
6. Your LinkedIn connections should be displayed in the visualization

## Support

If you continue to encounter issues:

1. Check for redirect URI mismatches
2. Verify environment variables
3. Review LinkedIn Developer Console logs
4. Check application server logs for detailed error messages
