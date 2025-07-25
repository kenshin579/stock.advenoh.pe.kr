/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    typedRoutes: true
  },
  env: {
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://stock.advenoh.pe.kr'
  }
}

module.exports = nextConfig