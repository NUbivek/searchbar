/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/searchbar',
  assetPrefix: '/searchbar/',
}

module.exports = nextConfig