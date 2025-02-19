/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Remove basePath since you're using a custom domain
  trailingSlash: true,
};

export default nextConfig;