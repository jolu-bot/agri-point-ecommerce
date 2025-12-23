/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Permet le build même avec des erreurs ESLint
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false, // Réactiver optimisation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    optimizePackageImports: ['react-icons', 'framer-motion', 'recharts', 'lucide-react', '@heroicons/react'],
  },
  // Optimisations de performance maximales
  swcMinify: true,
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  // Optimisation du bundle
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
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
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/products/:path*',
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

module.exports = nextConfig;

