export function generateRobotsTxt(): string {
  const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'stock.advenoh.pe.kr';
  const siteUrl = `https://${baseUrl}`;
  
  return `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/api/sitemap.xml

# Investment Insights Blog
# Professional financial blog about stocks, ETFs, bonds, and funds`;
}
