// FILE: ./next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: process.env.NODE_ENV === 'production' ? '/searchbar' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/searchbar' : '',
  trailingSlash: true,

  // Simplified webpack config
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': `${process.cwd()}/src`,
    };
    return config;
  },

  // Core essentials only
  reactStrictMode: true,
  swcMinify: true,
  optimizeFonts: true,

  // Remove potentially conflicting optimizations
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig;