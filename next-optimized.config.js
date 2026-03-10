/** @type {import('next').NextConfig} */
const nextConfig = {
  // -- PERFORMANCE OPTIMIZATIONS ----------------------------------------------
  typescript: { ignoreBuildErrors: true },
  
  // -- Image optimization (critical for performance) ------------------------
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    unoptimized: false,
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'agri-ps.com' },
    ],
  },

  // -- Advanced bundle optimization -------------------------------------------
  experimental: {
    optimizePackageImports: [
      'react-icons',
      'framer-motion',
      'recharts',
      'lucide-react',
      '@heroicons/react',
      'react-chartjs-2',
      'chart.js'
    ],
    optimizeCss: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },

  // -- Compiler optimizations -------------------------------------------------
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error'],
    },
    styledComponents: true,
    swcTracingEnabled: false,
  },

  // -- Build optimizations ----------------------------------------------------
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // -- Turbopack configuration ------------------------------------------------
  turbopack: {
    resolveAlias: { '@': '.' },
  },

  // -- Webpack fallback configuration -----------------------------------------
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV !== 'production') return config;

    // Aggressive minification
    config.optimization.minimize = true;
    config.optimization.usedExports = true;
    config.optimization.sideEffects = true;

    // Smart bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Core vendors
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            priority: 100,
            reuseExistingChunk: true,
          },
          // UI Libraries
          ui: {
            test: /[\\/]node_modules[\\/](react-hot-toast|recharts|framer-motion)[\\/]/,
            name: 'ui-libs',
            priority: 50,
            reuseExistingChunk: true,
            maxSize: 150000,
          },
          // Icons
          icons: {
            test: /[\\/]node_modules[\\/](react-icons|lucide-react|@heroicons)[\\/]/,
            name: 'icons',
            priority: 40,
            reuseExistingChunk: true,
            maxSize: 100000,
          },
          // Common chunk for shared code
          common: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            name: 'common',
          },
        },
      };
    }

    return config;
  },

  // -- Module import optimization ---------------------------------------------
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
    'react-icons/fa': {
      transform: 'react-icons/fa/{{member}}',
    },
    'react-icons/md': {
      transform: 'react-icons/md/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    '@heroicons/react': {
      transform: '@heroicons/react/{{member}}',
    },
  },

  // -- Security & performance headers -----------------------------------------
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.amazonaws.com https://*.googleusercontent.com https://agri-ps.com",
      "connect-src 'self' https://www.google-analytics.com",
      "media-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Vary', value: 'Accept-Encoding, Accept' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

// Sentry integration
const withSentryConfig = require('@sentry/nextjs').withSentryConfig;
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  environment: process.env.NODE_ENV,
  denyURLs: [/extensions\//i, /^chrome:\/\//i, /^\/api\/health/i],
});
