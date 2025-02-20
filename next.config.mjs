/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    // Disable code splitting to prevent hydration issues
    config.optimization.splitChunks = false;
    config.optimization.runtimeChunk = false;
    return config;
  },
  // Enable API routes
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000/api/:path*'
          : '/api/:path*'
      }
    ];
  }
};

export default nextConfig;