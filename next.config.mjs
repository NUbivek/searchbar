/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
  distDir: 'dist',
  images: {
    unoptimized: true
  }
};

export default nextConfig;