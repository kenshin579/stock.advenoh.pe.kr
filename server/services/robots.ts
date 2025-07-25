export function generateRobotsTxt(): string {
  // Prioritize custom domain over replit.app domain
  const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
  const customDomain = domains.find(domain => !domain.includes('.replit.app'));
  const baseUrl = customDomain || 'stock.advenoh.pe.kr';
  const siteUrl = `https://${baseUrl}`;
  
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Crawl-delay: 1

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/image-sitemap.xml

# Host
Host: ${siteUrl}

# Investment Insights Blog
# Professional financial blog about stocks, ETFs, bonds, and funds`;
}
