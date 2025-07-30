// Twitter Cards 완성 유틸리티
export interface TwitterCardData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  site?: string;
  creator?: string;
  domain?: string;
}

export interface TwitterCardMeta {
  name: string;
  content: string;
}

class TwitterCardGenerator {
  private static instance: TwitterCardGenerator;
  private defaultConfig: TwitterCardData = {
    card: 'summary_large_image',
    title: '투자 인사이트 - 주식, ETF, 채권, 펀드 전문 블로그',
    description: '국내외 주식, ETF, 채권, 펀드에 대한 전문적인 투자 정보와 분석을 제공하는 블로그입니다.',
    image: 'https://stock.advenoh.pe.kr/api/og-image',
    imageAlt: '투자 인사이트 - 주식 투자 정보와 ETF 분석',
    site: '@advenoh',
    creator: '@advenoh',
    domain: 'stock.advenoh.pe.kr',
  };

  private constructor() {}

  static getInstance(): TwitterCardGenerator {
    if (!TwitterCardGenerator.instance) {
      TwitterCardGenerator.instance = new TwitterCardGenerator();
    }
    return TwitterCardGenerator.instance;
  }

  // 기본 Twitter Card 데이터 생성
  generateDefaultTwitterCard(): TwitterCardData {
    return { ...this.defaultConfig };
  }

  // 블로그 포스트용 Twitter Card 데이터 생성
  generateBlogPostTwitterCard(
    title: string,
    description?: string,
    image?: string,
    author?: string
  ): TwitterCardData {
    return {
      ...this.defaultConfig,
      title: this.truncateTitle(title, 70),
      description: description ? this.truncateDescription(description, 200) : this.defaultConfig.description,
      image: image || this.getOGImageUrl(title, description),
      imageAlt: description ? `${title} - ${description}` : title,
      creator: author ? `@${author}` : this.defaultConfig.creator,
    };
  }

  // 시리즈용 Twitter Card 데이터 생성
  generateSeriesTwitterCard(
    title: string,
    description?: string,
    postCount?: number,
    image?: string
  ): TwitterCardData {
    const seriesTitle = `시리즈: ${title}`;
    const seriesDescription = description 
      ? `${description} (총 ${postCount || 0}개 포스트)`
      : `주식 투자 시리즈 (총 ${postCount || 0}개 포스트)`;

    return {
      ...this.defaultConfig,
      title: this.truncateTitle(seriesTitle, 60),
      description: this.truncateDescription(seriesDescription, 180),
      image: image || this.getOGImageUrl(seriesTitle, seriesDescription),
      imageAlt: seriesDescription,
    };
  }

  // 카테고리별 Twitter Card 데이터 생성
  generateCategoryTwitterCard(
    category: string,
    postCount?: number,
    image?: string
  ): TwitterCardData {
    const categoryTitle = `${category} 관련 포스트`;
    const categoryDescription = `${category} 카테고리의 투자 정보와 분석 (총 ${postCount || 0}개 포스트)`;

    return {
      ...this.defaultConfig,
      title: this.truncateTitle(categoryTitle, 60),
      description: this.truncateDescription(categoryDescription, 180),
      image: image || this.getOGImageUrl(categoryTitle, categoryDescription),
      imageAlt: categoryDescription,
    };
  }

  // 검색 결과용 Twitter Card 데이터 생성
  generateSearchTwitterCard(
    query: string,
    resultCount?: number,
    image?: string
  ): TwitterCardData {
    const searchTitle = `"${query}" 검색 결과`;
    const searchDescription = `"${query}"에 대한 검색 결과 (총 ${resultCount || 0}개 포스트)`;

    return {
      ...this.defaultConfig,
      title: this.truncateTitle(searchTitle, 60),
      description: this.truncateDescription(searchDescription, 180),
      image: image || this.getOGImageUrl(searchTitle, searchDescription),
      imageAlt: searchDescription,
    };
  }

  // Twitter Card 메타 태그 HTML 생성
  generateTwitterCardMetaTags(data: TwitterCardData): string {
    const metaTags: TwitterCardMeta[] = [
      { name: 'twitter:card', content: data.card },
      { name: 'twitter:title', content: data.title },
      { name: 'twitter:description', content: data.description },
      { name: 'twitter:image', content: data.image },
    ];

    if (data.imageAlt) {
      metaTags.push({ name: 'twitter:image:alt', content: data.imageAlt });
    }

    if (data.site) {
      metaTags.push({ name: 'twitter:site', content: data.site });
    }

    if (data.creator) {
      metaTags.push({ name: 'twitter:creator', content: data.creator });
    }

    if (data.domain) {
      metaTags.push({ name: 'twitter:domain', content: data.domain });
    }

    return metaTags
      .map(tag => `<meta name="${tag.name}" content="${this.escapeHtml(tag.content)}" />`)
      .join('\n    ');
  }

  // Twitter Card 미리보기 HTML 생성 (테스트용)
  generateTwitterCardPreview(data: TwitterCardData): string {
    const isLargeImage = data.card === 'summary_large_image';
    
    return `
<div style="
  max-width: ${isLargeImage ? '600px' : '300px'};
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
">
  ${isLargeImage ? `
    <div style="
      width: 100%;
      height: 314px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      padding: 20px;
    ">
      ${data.imageAlt || 'Image'}
    </div>
  ` : ''}
  <div style="padding: 12px;">
    <div style="
      font-size: 14px;
      color: #657786;
      margin-bottom: 4px;
    ">
      ${data.domain || 'stock.advenoh.pe.kr'}
    </div>
    <div style="
      font-size: 16px;
      font-weight: bold;
      color: #14171a;
      line-height: 1.4;
      margin-bottom: 4px;
    ">
      ${data.title}
    </div>
    <div style="
      font-size: 14px;
      color: #657786;
      line-height: 1.4;
      margin-bottom: 8px;
    ">
      ${data.description}
    </div>
    <div style="
      font-size: 12px;
      color: #657786;
    ">
      ${data.site || '@advenoh'}
    </div>
  </div>
</div>
    `.trim();
  }

  // Twitter Card 유효성 검사
  validateTwitterCardData(data: TwitterCardData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 필수 필드 검사
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!data.image || data.image.trim().length === 0) {
      errors.push('Image URL is required');
    }

    // 길이 제한 검사
    if (data.title && data.title.length > 70) {
      errors.push('Title is too long (max 70 characters)');
    }

    if (data.description && data.description.length > 200) {
      errors.push('Description is too long (max 200 characters)');
    }

    // 이미지 URL 유효성 검사
    if (data.image && !this.isValidImageUrl(data.image)) {
      warnings.push('Image URL may not be valid');
    }

    // 이미지 크기 권장사항
    if (data.card === 'summary_large_image') {
      warnings.push('Large image cards should use images with minimum dimensions of 300x157 pixels');
    } else {
      warnings.push('Summary cards should use images with minimum dimensions of 144x144 pixels');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
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

  // 이미지 URL 유효성 검사
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // OG 이미지 URL 생성
  private getOGImageUrl(title: string, description?: string): string {
    const baseUrl = this.getBaseUrl();
    const params = new URLSearchParams({
      title,
      description: description || '',
      category: 'Investment',
      author: 'Frank Oh',
      date: new Date().toISOString().split('T')[0],
    });

    return `${baseUrl}/api/og-image?${params.toString()}`;
  }

  // Twitter Card 테스트 도구
  generateTestUrl(data: TwitterCardData): string {
    const baseUrl = 'https://cards-dev.twitter.com/validator';
    const params = new URLSearchParams({
      url: this.getCurrentUrl(),
    });

    return `${baseUrl}?${params.toString()}`;
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
}

// 편의 함수들
export const twitterCardGenerator = TwitterCardGenerator.getInstance();

export function generateDefaultTwitterCard(): TwitterCardData {
  return twitterCardGenerator.generateDefaultTwitterCard();
}

export function generateBlogPostTwitterCard(
  title: string,
  description?: string,
  image?: string,
  author?: string
): TwitterCardData {
  return twitterCardGenerator.generateBlogPostTwitterCard(title, description, image, author);
}

export function generateSeriesTwitterCard(
  title: string,
  description?: string,
  postCount?: number,
  image?: string
): TwitterCardData {
  return twitterCardGenerator.generateSeriesTwitterCard(title, description, postCount, image);
}

export function generateCategoryTwitterCard(
  category: string,
  postCount?: number,
  image?: string
): TwitterCardData {
  return twitterCardGenerator.generateCategoryTwitterCard(category, postCount, image);
}

export function generateSearchTwitterCard(
  query: string,
  resultCount?: number,
  image?: string
): TwitterCardData {
  return twitterCardGenerator.generateSearchTwitterCard(query, resultCount, image);
}

export function generateTwitterCardMetaTags(data: TwitterCardData): string {
  return twitterCardGenerator.generateTwitterCardMetaTags(data);
}

export function generateTwitterCardPreview(data: TwitterCardData): string {
  return twitterCardGenerator.generateTwitterCardPreview(data);
}

export function validateTwitterCardData(data: TwitterCardData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  return twitterCardGenerator.validateTwitterCardData(data);
}

export function generateTestUrl(data: TwitterCardData): string {
  return twitterCardGenerator.generateTestUrl(data);
} 