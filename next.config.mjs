/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Remove basePath and assetPrefix if you're using a custom domain
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;