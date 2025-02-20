/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: '.next',
  images: {
    unoptimized: true
  }
};

export default nextConfig;