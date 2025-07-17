import { BlogPost } from '@shared/schema';

export function generateStructuredData(post: BlogPost, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage || `${baseUrl}/default-og-image.jpg`,
    "author": {
      "@type": "Person",
      "name": "투자분석가"
    },
    "publisher": {
      "@type": "Organization",
      "name": "투자 인사이트 블로그",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`
    },
    "keywords": post.tags?.join(', ') || '',
    "articleSection": post.category,
    "wordCount": post.content.split(/\s+/).length,
    "inLanguage": "ko-KR"
  };
}

export function generateBlogStructuredData(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "투자 인사이트 블로그",
    "description": "국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석",
    "url": baseUrl,
    "inLanguage": "ko-KR",
    "author": {
      "@type": "Person",
      "name": "투자분석가"
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

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  const domains = process.env.REPLIT_DOMAINS || 'localhost:5000';
  const domain = domains.split(',')[0];
  return `https://${domain}`;
}
