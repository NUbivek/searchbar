/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/searchbar',
  assetPrefix: '/searchbar/',
  // Remove the webpack config if it's not needed for other purposes
  // The @/ aliases should work by default with the tsconfig.json setup
}

export default nextConfig