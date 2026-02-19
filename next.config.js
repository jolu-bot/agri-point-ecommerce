const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*\.(png|jpg|jpeg|webp|svg|gif|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        },
      },
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 heures
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600, // Augmenter cache des images: 1h
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost', '127.0.0.1', 'agri-ps.com', 'www.agri-ps.com'],
    },
    optimizePackageImports: ['react-icons', 'framer-motion', 'recharts', 'lucide-react', '@heroicons/react', 'react-chartjs-2', 'chart.js'],
    // Optimisation de l'hydration React
    optimizeCss: true, // Minifier CSS automatiquement
  },
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // Configuration Turbopack (Next.js 16+)
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
  // Optimisation Webpack (fallback si webpack est utilisé)
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV !== 'production') {
      return config;
    }
    
    config.optimization.minimize = true;
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Séparer les dépendances lourdes
        charts: {
          test: /[\\/]node_modules[\\/](react-chartjs-2|chart\.js)[\\/]/,
          name: 'charts',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: 'recharts',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
        icons: {
          test: /[\\/]node_modules[\\/](react-icons|lucide-react)[\\/]/,
          name: 'icons',
          priority: 9,
          reuseExistingChunk: true,
          enforce: true,
        },
      };
    }
    return config;
  },
  
  // Optimisation du bundle
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
    'recharts': {
      transform: 'recharts/lib/{{member}}',
    },
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Headers pour optimisation du cache et sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 année
          },
        ],
      },
      {
        source: '/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 année
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // Cache agressif pour statiques
          },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// Disable TS errors during build for route handler signature incompatibilities  
// (pre-existing Next.js 15→16 migration issue, unrelated to UI improvements)
module.exports = {
  ...nextConfig,
  typescript: {
    // Re-enable build-time TypeScript errors now that route handlers are updated
    ignoreBuildErrors: false,
  },
};

module.exports = withPWA(nextConfig);

