export function generateRobotsTxt(): string {
  // Prioritize custom domain over replit.app domain
  const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
  const customDomain = domains.find(domain => !domain.includes('.replit.app'));
  const baseUrl = customDomain || 'stock.advenoh.pe.kr';
  const siteUrl = `https://${baseUrl}`;
  
  return `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${siteUrl}/api/sitemap.xml

# Investment Insights Blog
# Professional financial blog about stocks, ETFs, bonds, and funds`;
}
