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
  // Configure base path and asset prefix for the custom domain
  basePath: '/searchbar',
  assetPrefix: '/searchbar',

  // Webpack configuration optimized for JavaScript-heavy codebase
  webpack: (config, { isServer, dev }) => {
    // Fix alias configuration for proper module resolution
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': `${process.cwd()}/src`, // Use the same path for both server and client
      },
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      },
      // Add explicit extensions to resolve
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

    // Development-only configurations
    if (dev) {
      config.devtool = 'source-map';
    }

    return config;
  },

  // The rest of your configuration remains unchanged
  experimental: {
    typedRoutes: true,
  },
  reactStrictMode: true,
  trailingSlash: true,
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