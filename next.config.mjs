/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  pageExtensions: ['js', 'jsx'],
  images: {
    unoptimized: true
  },
  // Disable API routes in static export
  rewrites: async () => [],
  // Ensure proper static paths
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' },
      '/500': { page: '/500' }
    }
  }
};

export default nextConfig;