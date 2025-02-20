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
  }
};

export default nextConfig;