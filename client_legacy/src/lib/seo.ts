import { BlogPost } from '@shared/schema';
import { generateArticleSchema, generateBlogSchema, generateBreadcrumbSchema, generateWebSiteSchema, combineSchemas } from './structured-data';

// Legacy function for backward compatibility
export function generateStructuredData(post: BlogPost, baseUrl: string) {
  return generateArticleSchema(post, baseUrl);
}

// Legacy function for backward compatibility  
export function generateBlogStructuredData(baseUrl: string) {
  return generateBlogSchema(baseUrl);
}

// Enhanced function that combines multiple schemas for better SEO
export function generateCombinedStructuredData(post: BlogPost, baseUrl: string, breadcrumbs?: Array<{name: string, url?: string}>) {
  return [
    generateArticleSchema(post, baseUrl),
    generateWebSiteSchema(baseUrl),
    ...(breadcrumbs ? [generateBreadcrumbSchema(breadcrumbs, baseUrl)] : [])
  ];
}

// Helper function to generate breadcrumbs for blog posts
export function generateBlogPostBreadcrumbs(post: BlogPost, baseUrl: string) {
  return [
    { name: '홈', url: baseUrl },
    { name: getCategoryDisplayName(post.category), url: `${baseUrl}/?category=${post.category}` },
    { name: post.title }
  ];
}

// Helper function to get Korean category names
function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    'Stock': '주식',
    'ETF': 'ETF',
    'bonds': '채권',
    'funds': '펀드',
    'analysis': '분석'
  };
  
  return categoryMap[category] || category;
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  const domains = process.env.REPLIT_DOMAINS || 'localhost:5000';
  const domain = domains.split(',')[0];
  return `https://${domain}`;
}
