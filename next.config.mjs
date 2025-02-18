/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/searchbar',
  assetPrefix: '/searchbar/',
  trailingSlash: true,
}

export default nextConfig;