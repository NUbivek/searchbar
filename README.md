# Advanced Search Application

A powerful search application that combines multiple data sources with LLM processing for enhanced search results.

## Features

- Multi-source search integration (Crunchbase, Medium, Pitchbook, Reddit, Substack, Web)
- LLM-powered response generation using Mixtral-8x7B, DeepSeek-70B, and Gemma-7B
- Real-time chat interface with source attribution
- Rate limiting and error handling
- Modern, responsive UI

## Setup

1. Clone the repository
2. Copy `.env.local.template` to `.env.local` and fill in your API keys
3. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables in `.env.local`:

- `TOGETHER_API_KEY`: Together AI API key
- `PERPLEXITY_API_KEY`: Perplexity AI API key
- `CRUNCHBASE_API_KEY`: Crunchbase API key
- `MEDIUM_API_KEY`: Medium API key
- `PITCHBOOK_API_KEY`: Pitchbook API key
- `REDDIT_API_KEY`: Reddit API key
- `SUBSTACK_API_KEY`: Substack API key

## Architecture

- Next.js frontend with React components
- Express backend for API handling
- Vercel deployment configuration
- Modular source integration system

## Development

- Frontend: `/src/components` and `/src/pages`
- Backend: `/server`
- API Routes: `/src/pages/api`
- Utilities: `/src/utils`

## Deployment

The application is configured for deployment on Vercel with the following features:

- Serverless functions for API routes
- Edge middleware for request handling
- Environment variable management
- API route rewriting
