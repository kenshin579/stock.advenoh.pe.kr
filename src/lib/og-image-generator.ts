// 동적 Open Graph 이미지 생성 유틸리티
export interface OGImageConfig {
  title: string;
  description?: string;
  category?: string;
  author?: string;
  date?: string;
  image?: string;
  width?: number;
  height?: number;
}

export interface OGImageData {
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  image: string;
  width: number;
  height: number;
}

class OGImageGenerator {
  private static instance: OGImageGenerator;
  private defaultConfig: OGImageData = {
    title: '투자 인사이트 - 주식, ETF, 채권, 펀드 전문 블로그',
    description: '국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석을 제공하는 블로그입니다.',
    category: 'Investment',
    author: 'Frank Oh',
    date: new Date().toISOString().split('T')[0],
    image: '/og-default.png',
    width: 1200,
    height: 630,
  };

  private constructor() {}

  static getInstance(): OGImageGenerator {
    if (!OGImageGenerator.instance) {
      OGImageGenerator.instance = new OGImageGenerator();
    }
    return OGImageGenerator.instance;
  }

  // 기본 OG 이미지 데이터 생성
  generateDefaultOGData(): OGImageData {
    return { ...this.defaultConfig };
  }

  // 블로그 포스트용 OG 이미지 데이터 생성
  generateBlogPostOGData(
    title: string,
    description?: string,
    category?: string,
    date?: string
  ): OGImageData {
    return {
      ...this.defaultConfig,
      title: this.truncateTitle(title, 60),
      description: description ? this.truncateDescription(description, 160) : this.defaultConfig.description,
      category: category || this.defaultConfig.category,
      date: date || this.defaultConfig.date,
    };
  }

  // 시리즈용 OG 이미지 데이터 생성
  generateSeriesOGData(
    title: string,
    description?: string,
    postCount?: number
  ): OGImageData {
    const seriesTitle = `시리즈: ${title}`;
    const seriesDescription = description 
      ? `${description} (총 ${postCount || 0}개 포스트)`
      : `주식 투자 시리즈 (총 ${postCount || 0}개 포스트)`;

    return {
      ...this.defaultConfig,
      title: this.truncateTitle(seriesTitle, 50),
      description: this.truncateDescription(seriesDescription, 150),
      category: 'Series',
    };
  }

  // 카테고리별 OG 이미지 데이터 생성
  generateCategoryOGData(
    category: string,
    postCount?: number
  ): OGImageData {
    const categoryTitle = `${category} 관련 포스트`;
    const categoryDescription = `${category} 카테고리의 투자 정보와 분석 (총 ${postCount || 0}개 포스트)`;

    return {
      ...this.defaultConfig,
      title: this.truncateTitle(categoryTitle, 50),
      description: this.truncateDescription(categoryDescription, 150),
      category,
    };
  }

  // 검색 결과용 OG 이미지 데이터 생성
  generateSearchOGData(query: string, resultCount?: number): OGImageData {
    const searchTitle = `"${query}" 검색 결과`;
    const searchDescription = `"${query}"에 대한 검색 결과 (총 ${resultCount || 0}개 포스트)`;

    return {
      ...this.defaultConfig,
      title: this.truncateTitle(searchTitle, 50),
      description: this.truncateDescription(searchDescription, 150),
      category: 'Search',
    };
  }

  // OG 메타데이터 HTML 생성
  generateOGMetaTags(data: OGImageData): string {
    const tags = [
      // 기본 OG 태그
      `<meta property="og:title" content="${this.escapeHtml(data.title)}" />`,
      `<meta property="og:description" content="${this.escapeHtml(data.description)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:url" content="${this.getCurrentUrl()}" />`,
      `<meta property="og:image" content="${this.getOGImageUrl(data)}" />`,
      `<meta property="og:image:width" content="${data.width}" />`,
      `<meta property="og:image:height" content="${data.height}" />`,
      `<meta property="og:site_name" content="투자 인사이트" />`,
      `<meta property="og:locale" content="ko_KR" />`,

      // Twitter Card 태그
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${this.escapeHtml(data.title)}" />`,
      `<meta name="twitter:description" content="${this.escapeHtml(data.description)}" />`,
      `<meta name="twitter:image" content="${this.getOGImageUrl(data)}" />`,
      `<meta name="twitter:site" content="@advenoh" />`,
      `<meta name="twitter:creator" content="@advenoh" />`,

      // 추가 메타데이터
      `<meta name="author" content="${this.escapeHtml(data.author)}" />`,
      `<meta name="category" content="${this.escapeHtml(data.category)}" />`,
      `<meta property="article:published_time" content="${data.date}" />`,
      `<meta property="article:author" content="${this.escapeHtml(data.author)}" />`,
      `<meta property="article:section" content="${this.escapeHtml(data.category)}" />`,
    ];

    return tags.join('\n    ');
  }

  // OG 이미지 URL 생성 (개선된 버전)
  private getOGImageUrl(data: OGImageData): string {
    const baseUrl = this.getBaseUrl();
    
    // 커스텀 OG 이미지 생성 서비스 사용
    const params = new URLSearchParams({
      title: data.title,
      description: data.description,
      category: data.category,
      author: data.author,
      date: data.date,
      width: data.width.toString(),
      height: data.height.toString(),
    });

    // 내부 OG 이미지 생성 API 사용
    const ogImageUrl = `${baseUrl}/api/og-image?${params.toString()}`;
    
    return ogImageUrl;
  }

  // 현재 URL 가져오기
  private getCurrentUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return 'https://stock.advenoh.pe.kr';
  }

  // 기본 URL 가져오기
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://stock.advenoh.pe.kr';
  }

  // 제목 길이 제한
  private truncateTitle(title: string, maxLength: number): string {
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength - 3) + '...';
  }

  // 설명 길이 제한
  private truncateDescription(description: string, maxLength: number): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength - 3) + '...';
  }

  // HTML 이스케이프 (서버사이드 호환)
  private escapeHtml(text: string): string {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // 서버사이드에서 사용할 수 있는 이스케이프 함수
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // OG 이미지 유효성 검사
  validateOGData(data: OGImageData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (data.title && data.title.length > 60) {
      errors.push('Title is too long (max 60 characters)');
    }

    if (data.description && data.description.length > 160) {
      errors.push('Description is too long (max 160 characters)');
    }

    if (!data.width || data.width < 600 || data.width > 1200) {
      errors.push('Width should be between 600 and 1200 pixels');
    }

    if (!data.height || data.height < 315 || data.height > 630) {
      errors.push('Height should be between 315 and 630 pixels');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // OG 이미지 미리보기 URL 생성 (테스트용)
  generatePreviewUrl(data: OGImageData): string {
    const baseUrl = this.getBaseUrl();
    const params = new URLSearchParams({
      title: data.title,
      description: data.description,
      category: data.category,
      author: data.author,
      date: data.date,
      preview: 'true',
    });

    return `${baseUrl}/api/og-image?${params.toString()}`;
  }
}

// 편의 함수들
export const ogImageGenerator = OGImageGenerator.getInstance();

export function generateDefaultOGData(): OGImageData {
  return ogImageGenerator.generateDefaultOGData();
}

export function generateBlogPostOGData(
  title: string,
  description?: string,
  category?: string,
  date?: string
): OGImageData {
  return ogImageGenerator.generateBlogPostOGData(title, description, category, date);
}

export function generateSeriesOGData(
  title: string,
  description?: string,
  postCount?: number
): OGImageData {
  return ogImageGenerator.generateSeriesOGData(title, description, postCount);
}

export function generateCategoryOGData(
  category: string,
  postCount?: number
): OGImageData {
  return ogImageGenerator.generateCategoryOGData(category, postCount);
}

export function generateSearchOGData(
  query: string,
  resultCount?: number
): OGImageData {
  return ogImageGenerator.generateSearchOGData(query, resultCount);
}

export function generateOGMetaTags(data: OGImageData): string {
  return ogImageGenerator.generateOGMetaTags(data);
}

export function validateOGData(data: OGImageData): {
  isValid: boolean;
  errors: string[];
} {
  return ogImageGenerator.validateOGData(data);
}

export function generatePreviewUrl(data: OGImageData): string {
  return ogImageGenerator.generatePreviewUrl(data);
} 