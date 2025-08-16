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
    "image": post.featuredImage || `${baseUrl}/api/og-image?title=${encodeURIComponent(post.title)}`,
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
      "@id": `${baseUrl}/${post.categories?.[0]?.toLowerCase() || 'etc'}/${post.slug}`
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
export function combineSchemas(...schemas: unknown[]) {
  return schemas.filter(Boolean);
}

// Main generateStructuredData function
export function generateStructuredData(type: 'website' | 'blog' | 'article', data?: unknown) {
  const baseUrl = process.env.SITE_URL || 'https://stock.advenoh.pe.kr'
  
  switch (type) {
    case 'website':
      return generateWebSiteSchema(baseUrl)
    case 'blog':
      return generateBlogSchema(baseUrl)
    case 'article':
      return generateArticleSchema(data as BlogPost, baseUrl)
    default:
      return generateWebSiteSchema(baseUrl)
  }
}

// JSON-LD 스키마 검증 인터페이스
export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// JSON-LD 스키마 검증 클래스
class SchemaValidator {
  private static instance: SchemaValidator;

  private constructor() {}

  static getInstance(): SchemaValidator {
    if (!SchemaValidator.instance) {
      SchemaValidator.instance = new SchemaValidator();
    }
    return SchemaValidator.instance;
  }

  // 스키마 유효성 검사
  validateSchema(schema: unknown): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!schema || typeof schema !== 'object') {
      errors.push('Schema must be a valid object');
      return { isValid: false, errors, warnings, suggestions };
    }

    const schemaObj = schema as Record<string, unknown>;

    // 필수 필드 검사
    if (!schemaObj['@context']) {
      errors.push('Missing @context field');
    } else if (schemaObj['@context'] !== 'https://schema.org') {
      warnings.push('@context should be "https://schema.org"');
    }

    if (!schemaObj['@type']) {
      errors.push('Missing @type field');
    }

    // 타입별 검증
    const type = schemaObj['@type'] as string;
    switch (type) {
      case 'BlogPosting':
        this.validateBlogPostingSchema(schemaObj, errors, warnings, suggestions);
        break;
      case 'Blog':
        this.validateBlogSchema(schemaObj, errors, warnings, suggestions);
        break;
      case 'WebSite':
        this.validateWebSiteSchema(schemaObj, errors, warnings, suggestions);
        break;
      case 'Organization':
        this.validateOrganizationSchema(schemaObj, errors, warnings, suggestions);
        break;
      case 'BreadcrumbList':
        this.validateBreadcrumbSchema(schemaObj, errors, warnings, suggestions);
        break;
      default:
        warnings.push(`Unknown schema type: ${type}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  // BlogPosting 스키마 검증
  private validateBlogPostingSchema(
    schema: Record<string, unknown>,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    const requiredFields = ['headline', 'description', 'author', 'datePublished'];
    
    for (const field of requiredFields) {
      if (!schema[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (schema.headline && typeof schema.headline === 'string' && schema.headline.length > 110) {
      warnings.push('Headline is too long (max 110 characters recommended)');
    }

    if (schema.description && typeof schema.description === 'string' && schema.description.length > 160) {
      warnings.push('Description is too long (max 160 characters recommended)');
    }

    if (schema.image && typeof schema.image === 'string') {
      if (!this.isValidUrl(schema.image)) {
        warnings.push('Image URL may not be valid');
      }
    } else {
      suggestions.push('Consider adding an image for better SEO');
    }
  }

  // Blog 스키마 검증
  private validateBlogSchema(
    schema: Record<string, unknown>,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    const requiredFields = ['name', 'description', 'url'];
    
    for (const field of requiredFields) {
      if (!schema[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (schema.url && typeof schema.url === 'string' && !this.isValidUrl(schema.url)) {
      warnings.push('Blog URL may not be valid');
    }
  }

  // WebSite 스키마 검증
  private validateWebSiteSchema(
    schema: Record<string, unknown>,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    const requiredFields = ['name', 'url'];
    
    for (const field of requiredFields) {
      if (!schema[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (schema.url && typeof schema.url === 'string' && !this.isValidUrl(schema.url)) {
      warnings.push('Website URL may not be valid');
    }
  }

  // Organization 스키마 검증
  private validateOrganizationSchema(
    schema: Record<string, unknown>,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    const requiredFields = ['name', 'url'];
    
    for (const field of requiredFields) {
      if (!schema[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (schema.logo && typeof schema.logo === 'object') {
      const logo = schema.logo as Record<string, unknown>;
      if (!logo.url || typeof logo.url !== 'string') {
        warnings.push('Logo should have a valid URL');
      }
    }
  }

  // BreadcrumbList 스키마 검증
  private validateBreadcrumbSchema(
    schema: Record<string, unknown>,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ): void {
    if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
      errors.push('BreadcrumbList must have itemListElement array');
      return;
    }

    const items = schema.itemListElement as Array<Record<string, unknown>>;
    
    if (items.length === 0) {
      warnings.push('BreadcrumbList should have at least one item');
    }

    items.forEach((item, index) => {
      if (!item.name) {
        errors.push(`Breadcrumb item ${index + 1} missing name`);
      }
      if (!item.position || typeof item.position !== 'number') {
        warnings.push(`Breadcrumb item ${index + 1} should have position`);
      }
    });
  }

  // URL 유효성 검사
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Google Rich Results 테스트 URL 생성
  generateTestUrl(schema: unknown): string {
    const baseUrl = 'https://search.google.com/test/rich-results';
    const schemaJson = JSON.stringify(schema);
    const encodedSchema = encodeURIComponent(schemaJson);
    
    return `${baseUrl}?url=${encodeURIComponent(this.getCurrentUrl())}&schema=${encodedSchema}`;
  }

  // 현재 URL 가져오기
  private getCurrentUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return 'https://stock.advenoh.pe.kr';
  }
}

// 편의 함수들
export const schemaValidator = SchemaValidator.getInstance();

export function validateSchema(schema: unknown): SchemaValidationResult {
  return schemaValidator.validateSchema(schema);
}

export function generateSchemaTestUrl(schema: unknown): string {
  return schemaValidator.generateTestUrl(schema);
}