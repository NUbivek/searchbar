# OAuth Relay System Guide

This document explains how to use the OAuth Relay system for local development with the searchbar application.

## The Problem

When developing OAuth integrations locally, you typically face these challenges:

1. **Port Changes**: Every time you change your local port (e.g., from 3000 to 3001), you need to update all OAuth provider configurations.
2. **Multiple Environments**: Maintaining different callback URLs for development, staging, and production is tedious.
3. **Provider Limitations**: Some OAuth providers limit the number of callback URLs you can register.
4. **Team Coordination**: Different team members may use different ports for development.

## The Solution: OAuth Relay

The OAuth Relay system solves these problems by:

1. Using a **single stable production URL** for all OAuth provider configurations
2. **Relaying** the OAuth tokens and codes from your production environment to your local development server
3. Providing a **flexible interface** to specify which local server should receive the authentication

## How It Works

1. The OAuth flow is initiated from your local development server
2. The OAuth provider redirects to your production URL after authentication
3. The relay system running on your production site captures the OAuth parameters
4. The relay presents a page with options to redirect to your local server
5. The local server receives the OAuth code and completes the authentication

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```
# URLs for the application
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NEXT_PUBLIC_PRODUCTION_URL=https://research.bivek.ai

# Set this to true to use the production URL for OAuth callbacks
NEXT_PUBLIC_USE_PRODUCTION_CALLBACKS=true
```

### 2. OAuth Provider Configuration

Configure your OAuth providers to use these callback URLs:

| Provider | Callback URL |
|----------|------------|
| Twitter  | `https://research.bivek.ai/api/auth/twitter/callback` |
| LinkedIn | `https://research.bivek.ai/api/auth/linkedin/callback` |
| Reddit   | `https://research.bivek.ai/api/relay/reddit` |

### 3. Deployment

The relay system is automatically deployed when you push to the main branch connected to your Vercel project.

### 4. Usage

1. Start your local development server with:
   ```
   npm run dev:3001  # Or any other port
   ```

2. Navigate to the network page in your local app
   ```
   http://localhost:3001/network
   ```

3. Click "Connect to Twitter" or "Connect to LinkedIn"

4. After authenticating with the provider, you'll be redirected to the relay page on your production site

5. The relay page will show options to redirect to your local server

6. Click "Redirect to Local Server" to complete the authentication

## Relay System Pages

- **Configuration Page**: `https://research.bivek.ai/api/relay`
- **Twitter Relay**: `https://research.bivek.ai/api/relay/twitter`
- **LinkedIn Relay**: `https://research.bivek.ai/api/relay/linkedin`
- **Reddit Relay**: `https://research.bivek.ai/api/relay/reddit`

## Troubleshooting

If you encounter issues:

1. **Check Local Server**: Make sure your local development server is running
2. **Update Local Server URL**: If your local port changes, update it on the relay page
3. **Clear Browser Storage**: Try clearing your browser's local storage if saved settings cause issues
4. **Check Network Tab**: Look for any errors in the browser's network tab during redirection
5. **Verify Environment Variables**: Ensure your `.env.local` has the correct settings

## Benefits

- **One-time Provider Setup**: Set up your OAuth provider once and never change it again
- **Team Flexibility**: Different team members can use different development ports
- **Port Agnostic**: Change your local development port freely without provider reconfiguration
- **Better Security**: Your production site handles the OAuth sensitive parts
