/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR을 위한 설정 (static export 제거)
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['stock.advenoh.pe.kr'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // 캐싱 설정
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
    {
      source: '/contents/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  env: {
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://stock.advenoh.pe.kr'
  }
}

module.exports = nextConfig