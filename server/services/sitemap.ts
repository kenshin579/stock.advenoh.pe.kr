import { BlogPost } from "@shared/schema";

export function generateSitemap(posts: BlogPost[]): string {
  const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'stock.advenoh.pe.kr';
  const siteUrl = `https://${baseUrl}`;
  
  const staticPages = [
    { url: siteUrl, changefreq: 'daily', priority: '1.0' },
    { url: `${siteUrl}/admin`, changefreq: 'weekly', priority: '0.5' },
    { url: `${siteUrl}/series`, changefreq: 'weekly', priority: '0.7' },
  ];
  
  const postUrls = posts.map(post => ({
    url: `${siteUrl}/blog/${post.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date(post.updatedAt!).toISOString().split('T')[0]
  }));
  
  const allUrls = [...staticPages, ...postUrls];
  
  const urlEntries = allUrls.map(page => `
    <url>
      <loc>${page.url}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
      ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;
}
