import { BlogPost } from './blog';

// Blog Schema for homepage
export function generateBlogSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "투자 인사이트 블로그",
    "description": "국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석",
    "url": baseUrl,
    "inLanguage": "ko-KR",
    "author": {
      "@type": "Person",
      "name": "Frank Oh"
    },
    "publisher": {
      "@type": "Organization",
      "name": "투자 인사이트 블로그",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  };
}

// Article Schema for individual blog posts
export function generateArticleSchema(post: BlogPost, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage || `${baseUrl}/default-og-image.jpg`,
    "author": {
      "@type": "Person",
      "name": "Frank Oh"
    },
    "publisher": {
      "@type": "Organization",
      "name": "투자 인사이트 블로그",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    },
    "keywords": post.tags?.join(', ') || '',
    "articleSection": post.categories.join(', '),
    "wordCount": post.content.split(/\s+/).length,
    "inLanguage": "ko-KR"
  };
}

// Organization Schema for site-wide use
export function generateOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "투자 인사이트 블로그",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.png`
    },
    "description": "국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석을 제공하는 개인 블로그",
    "sameAs": [
      // Add social media URLs if available
    ]
  };
}

// BreadcrumbList Schema for navigation
export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url?: string}>, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      ...(crumb.url && { "item": crumb.url })
    }))
  };
}

// WebSite Schema for search functionality
export function generateWebSiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "투자 인사이트 블로그",
    "url": baseUrl,
    "description": "국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

// FAQ Schema for frequently asked questions (future use)
export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Helper function to combine multiple schemas
export function combineSchemas(...schemas: any[]) {
  return schemas.filter(Boolean);
}

// Main generateStructuredData function
export function generateStructuredData(type: 'website' | 'blog' | 'article', data: any) {
  const baseUrl = process.env.SITE_URL || 'https://stock.advenoh.pe.kr'
  
  switch (type) {
    case 'website':
      return generateWebSiteSchema(baseUrl)
    case 'blog':
      return generateBlogSchema(baseUrl)
    case 'article':
      return generateArticleSchema(data, baseUrl)
    default:
      return generateWebSiteSchema(baseUrl)
  }
}