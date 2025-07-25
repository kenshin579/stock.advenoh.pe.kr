import { BlogPost } from '@shared/schema';

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

// HowTo Schema for investment guides and tutorials
export function generateHowToSchema(post: BlogPost, baseUrl: string) {
  // Extract steps from markdown content (simplified extraction)
  const steps = extractHowToSteps(post.content);
  
  if (steps.length === 0) {
    return null; // Not a how-to article
  }

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": post.title,
    "description": post.excerpt,
    "image": post.featuredImage || `${baseUrl}/default-og-image.jpg`,
    "totalTime": `PT${Math.max(5, Math.ceil(post.content.split(/\s+/).length / 200))}M`,
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "KRW",
      "value": "0"
    },
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && { 
        "image": {
          "@type": "ImageObject",
          "url": step.image
        }
      })
    })),
    "author": {
      "@type": "Person",
      "name": "Frank Oh"
    },
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt
  };
}

// Review Schema for investment product reviews
export function generateReviewSchema(post: BlogPost, baseUrl: string, rating?: number) {
  if (!post.content.includes('리뷰') && !post.content.includes('평가') && !post.content.includes('분석')) {
    return null; // Not a review article
  }

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "FinancialProduct",
      "name": extractProductName(post.title),
      "description": post.excerpt
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": rating || 4,
      "bestRating": 5,
      "worstRating": 1
    },
    "author": {
      "@type": "Person",
      "name": "Frank Oh"
    },
    "datePublished": post.createdAt,
    "reviewBody": post.excerpt
  };
}

// Series/Course Schema for educational content series
export function generateCourseSchema(seriesName: string, posts: BlogPost[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": seriesName,
    "description": `${seriesName}에 대한 체계적인 학습 과정`,
    "provider": {
      "@type": "Organization",
      "name": "투자 인사이트 블로그"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "instructor": {
        "@type": "Person",
        "name": "Frank Oh"
      }
    },
    "coursePrerequisites": "기본적인 투자 지식",
    "teaches": posts.map(post => post.title),
    "inLanguage": "ko-KR",
    "url": `${baseUrl}/series/${encodeURIComponent(seriesName)}`
  };
}

// Helper function to combine multiple schemas
export function combineSchemas(...schemas: any[]) {
  return schemas.filter(Boolean);
}