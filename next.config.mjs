/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/searchbar',
  assetPrefix: '/searchbar/',
  trailingSlash: true,
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': `${process.cwd()}/src`,
    };
    return config;
  },
}

export default nextConfig;