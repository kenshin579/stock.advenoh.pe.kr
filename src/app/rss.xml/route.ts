import { NextResponse } from 'next/server'
import { getAllBlogPosts } from '@/lib/blog'

export const dynamic = 'force-static'

export async function GET() {
  const posts = await getAllBlogPosts()
  const baseUrl = process.env.SITE_URL || 'https://stock.advenoh.pe.kr'
  
  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/${post.categories?.[0]?.toLowerCase() || 'etc'}/${post.slug}</link>
      <guid>${baseUrl}/${post.categories?.[0]?.toLowerCase() || 'etc'}/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.categories?.map(category => `<category><![CDATA[${category}]]></category>`).join('') || ''}
      ${post.tags?.map(tag => `<category><![CDATA[${tag}]]></category>`).join('') || ''}
    </item>
  `).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>투자 인사이트 블로그</title>
    <link>${baseUrl}</link>
    <description>국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Investment Insights Blog</generator>
    ${rssItems}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml',
    },
  })
} 