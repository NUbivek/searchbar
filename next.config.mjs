/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for static export
  output: 'export',

  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },

  // Base path and asset prefix for GitHub Pages
  basePath: '/searchbar', // Ensure this matches your GitHub Pages repo name or custom domain path
  assetPrefix: '/searchbar/', // Prefix for assets

  // Ensure all paths end with a trailing slash
  trailingSlash: true,

  // Webpack configuration
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': `${process.cwd()}/src`, // Alias for cleaner imports
      },
      fallback: {
        ...config.resolve.fallback,
        fs: false, // Prevent Node.js-specific modules from breaking in the browser
        path: false,
      },
    };
    return config;
  },

  // Core configuration
  reactStrictMode: true, // Enable strict mode for React
  swcMinify: true, // Use SWC for faster builds and smaller bundles
  poweredByHeader: false, // Remove "X-Powered-By" header
  compress: true, // Enable Gzip compression
  staticPageGenerationTimeout: 180, // Increase timeout for large builds
  optimizeFonts: true, // Optimize font loading

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build (if any)
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
    dirs: ['pages', 'components', 'lib', 'src'], // Directories to lint
  },

  // Production optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false, // Remove console logs in production except errors/warnings
  },
};

export default nextConfig;
