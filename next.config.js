/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Add environment variables here
    SERPER_API_KEY: process.env.SERPER_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
    LINKEDIN_API_KEY: process.env.LINKEDIN_API_KEY,
    TWITTER_API_KEY: process.env.TWITTER_API_KEY,
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    CRUNCHBASE_API_KEY: process.env.CRUNCHBASE_API_KEY,
    PITCHBOOK_API_KEY: process.env.PITCHBOOK_API_KEY,
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3003/api/:path*'
        }
      ];
    }
    
    // In production, use the built-in API routes
    return [];
  }
};

module.exports = nextConfig;
