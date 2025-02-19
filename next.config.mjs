/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Use absolute URLs for assets when in production
  basePath: '/searchbar',
  assetPrefix: 'https://research.bivek.ai/searchbar', // Full domain with no trailing slash
  
  // This ensures all URLs end with a trailing slash (helps with static hosting)
  trailingSlash: true,

  // Webpack configuration 
  webpack: (config, { isServer, dev }) => {
    // Fix alias configuration for proper module resolution
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': `${process.cwd()}/src`,
      },
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', ...(config.resolve.extensions || [])]
    };

    // JavaScript-specific optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 70000,
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };

    if (dev) {
      config.devtool = 'source-map';
    }

    return config;
  },

  // Other configuration
  experimental: {
    typedRoutes: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  staticPageGenerationTimeout: 180,
  optimizeFonts: true,
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: 'tsconfig.json',
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['pages', 'components', 'lib', 'src'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
}

export default nextConfig