import { BlogPost } from "@shared/schema";

export function generateSitemap(posts: BlogPost[]): string {
  // Prioritize custom domain over replit.app domain
  const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
  const customDomain = domains.find(domain => !domain.includes('.replit.app'));
  const baseUrl = customDomain || 'stock.advenoh.pe.kr';
  const siteUrl = `https://${baseUrl}`;
  
  // Calculate date threshold for recent posts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const staticPages = [
    { url: siteUrl, changefreq: 'daily', priority: '1.0' },
    { url: `${siteUrl}/admin`, changefreq: 'monthly', priority: '0.5' },
    { url: `${siteUrl}/series`, changefreq: 'weekly', priority: '0.7' },
  ];
  
  const postUrls = posts.map(post => {
    const postDate = new Date(post.createdAt || post.updatedAt || 0);
    const isRecent = postDate > thirtyDaysAgo;
    
    return {
      url: `${siteUrl}/${(post.category || 'etc').toLowerCase()}/${post.slug}`,
      changefreq: 'weekly',
      priority: isRecent ? '0.9' : '0.8', // Higher priority for recent posts
      lastmod: new Date(post.updatedAt!).toISOString().split('T')[0]
    };
  });
  
  const allUrls = [...staticPages, ...postUrls];
  
  const urlEntries = allUrls.map(page => `
    <url>
      <loc>${page.url}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
      ${'lastmod' in page && page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;
}
