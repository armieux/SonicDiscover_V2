import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour la production Docker
  output: 'standalone',
  
  // Optimisation des images
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.senscritique.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // Spotify images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'open.spotify.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Configuration sécurisée pour SVG
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configuration des redirections si nécessaire
  async redirects() {
    return [
      // Exemple de redirection
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Optimisations de build
  compress: true,
  
  // Variables d'environnement publiques
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configuration experimentale pour les performances
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
};

export default nextConfig;