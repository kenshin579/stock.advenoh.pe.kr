import { BlogPost } from "@shared/schema";

export function generateRssFeed(posts: BlogPost[]): string {
  // Prioritize custom domain over replit.app domain
  const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
  const customDomain = domains.find(domain => !domain.includes('.replit.app'));
  const baseUrl = customDomain || 'stock.advenoh.pe.kr';
  const siteUrl = `https://${baseUrl}`;
  
  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/${(post.category || 'etc').toLowerCase()}/${post.slug}</link>
      <guid>${siteUrl}/${(post.category || 'etc').toLowerCase()}/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.createdAt!).toUTCString()}</pubDate>
      <category>${post.category}</category>
      ${post.tags?.map(tag => `<category><![CDATA[${tag}]]></category>`).join('') || ''}
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>투자 인사이트 블로그</title>
    <link>${siteUrl}</link>
    <description>국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Investment Insights Blog</generator>
    ${rssItems}
  </channel>
</rss>`;
}
