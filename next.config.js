/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // Add environment variables here
    SERPER_API_KEY: process.env.SERPER_API_KEY,
    LINKEDIN_API_KEY: process.env.LINKEDIN_API_KEY,
    REDDIT_API_KEY: process.env.REDDIT_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With,Content-Type' }
        ],
      },
    ]
  }
};

module.exports = nextConfig;
