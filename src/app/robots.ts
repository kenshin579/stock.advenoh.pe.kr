import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'https://stock.advenoh.pe.kr'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
} 