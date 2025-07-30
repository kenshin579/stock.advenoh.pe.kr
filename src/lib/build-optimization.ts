// 정적 데이터 생성 최적화 유틸리티

import { getAllBlogPostsServer, getAllCategoriesServer } from '@/lib/blog-server';
import { validateAllData, BLOG_POST_SCHEMA, CATEGORY_SCHEMA } from '@/lib/data-validation';

export interface BuildOptimizationConfig {
  enableIncrementalBuild: boolean;
  enableDataValidation: boolean;
  enableErrorRecovery: boolean;
  maxRetries: number;
  cacheTimeout: number; // ms
}

// 기본 설정
export const DEFAULT_BUILD_CONFIG: BuildOptimizationConfig = {
  enableIncrementalBuild: true,
  enableDataValidation: true,
  enableErrorRecovery: true,
  maxRetries: 3,
  cacheTimeout: 5 * 60 * 1000, // 5분
};

// 빌드 캐시 관리
class BuildCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private config: BuildOptimizationConfig;

  constructor(config: BuildOptimizationConfig) {
    this.config = config;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // 캐시 만료 확인
    if (Date.now() - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  // 캐시 키 목록 반환
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // 패턴 기반 캐시 삭제
  deleteByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// 빌드 최적화 클래스
export class BuildOptimizer {
  private cache: BuildCache;
  private config: BuildOptimizationConfig;
  private buildStartTime: number = 0;

  constructor(config: BuildOptimizationConfig = DEFAULT_BUILD_CONFIG) {
    this.config = config;
    this.cache = new BuildCache(config);
  }

  // 빌드 시작
  startBuild(): void {
    this.buildStartTime = Date.now();
    console.log('🚀 Starting optimized build process...');
  }

  // 빌드 완료
  endBuild(): void {
    const duration = Date.now() - this.buildStartTime;
    console.log(`✅ Build completed in ${duration}ms`);
  }

  // 블로그 포스트 데이터 생성 (최적화)
  async generateBlogPostsData(retryCount = 0): Promise<any[]> {
    const cacheKey = 'blog-posts';
    
    try {
      // 캐시 확인
      if (this.config.enableIncrementalBuild && this.cache.has(cacheKey)) {
        console.log('📦 Using cached blog posts data');
        return this.cache.get(cacheKey);
      }

      console.log('📝 Generating blog posts data...');
      const posts = await getAllBlogPostsServer();

      // 데이터 검증
      if (this.config.enableDataValidation) {
        const validationResult = validateAllData(posts, posts, BLOG_POST_SCHEMA);
        if (!validationResult.isValid) {
          console.warn('⚠️ Blog posts validation warnings:', validationResult.warnings);
          if (validationResult.errors.length > 0) {
            throw new Error(`Blog posts validation failed: ${validationResult.errors.join(', ')}`);
          }
        }
      }

      // 캐시 저장
      this.cache.set(cacheKey, posts);
      console.log(`✅ Generated ${posts.length} blog posts`);

      return posts;
    } catch (error) {
      console.error('❌ Error generating blog posts:', error);
      
      // 에러 복구 시도
      if (this.config.enableErrorRecovery && retryCount < this.config.maxRetries) {
        console.log(`🔄 Retrying blog posts generation (${retryCount + 1}/${this.config.maxRetries})`);
        await this.delay(1000 * (retryCount + 1)); // 지수 백오프
        return this.generateBlogPostsData(retryCount + 1);
      }

      throw error;
    }
  }

  // 카테고리 데이터 생성 (최적화)
  async generateCategoriesData(retryCount = 0): Promise<any[]> {
    const cacheKey = 'categories';
    
    try {
      // 캐시 확인
      if (this.config.enableIncrementalBuild && this.cache.has(cacheKey)) {
        console.log('📦 Using cached categories data');
        return this.cache.get(cacheKey);
      }

      console.log('📝 Generating categories data...');
      const categories = await getAllCategoriesServer();

      // 데이터 검증
      if (this.config.enableDataValidation) {
        const validationResult = validateAllData(categories, categories, CATEGORY_SCHEMA);
        if (!validationResult.isValid) {
          console.warn('⚠️ Categories validation warnings:', validationResult.warnings);
          if (validationResult.errors.length > 0) {
            throw new Error(`Categories validation failed: ${validationResult.errors.join(', ')}`);
          }
        }
      }

      // 캐시 저장
      this.cache.set(cacheKey, categories);
      console.log(`✅ Generated ${categories.length} categories`);

      return categories;
    } catch (error) {
      console.error('❌ Error generating categories:', error);
      
      // 에러 복구 시도
      if (this.config.enableErrorRecovery && retryCount < this.config.maxRetries) {
        console.log(`🔄 Retrying categories generation (${retryCount + 1}/${this.config.maxRetries})`);
        await this.delay(1000 * (retryCount + 1));
        return this.generateCategoriesData(retryCount + 1);
      }

      throw error;
    }
  }

  // 증분 빌드 지원
  async generateIncrementalData(lastBuildTime?: number): Promise<{
    blogPosts: any[];
    categories: any[];
    isIncremental: boolean;
  }> {
    if (!this.config.enableIncrementalBuild || !lastBuildTime) {
      // 전체 빌드
      const [blogPosts, categories] = await Promise.all([
        this.generateBlogPostsData(),
        this.generateCategoriesData(),
      ]);

      return {
        blogPosts,
        categories,
        isIncremental: false,
      };
    }

    // 증분 빌드 로직 (실제 구현에서는 파일 수정 시간 등을 확인)
    console.log('🔄 Performing incremental build...');
    
    const [blogPosts, categories] = await Promise.all([
      this.generateBlogPostsData(),
      this.generateCategoriesData(),
    ]);

    return {
      blogPosts,
      categories,
      isIncremental: true,
    };
  }

  // 빌드 성능 분석
  analyzeBuildPerformance(): {
    totalTime: number;
    cacheHits: number;
    cacheMisses: number;
    validationTime: number;
    errorCount: number;
  } {
    const totalTime = Date.now() - this.buildStartTime;
    
    return {
      totalTime,
      cacheHits: 0, // 실제 구현에서는 추적
      cacheMisses: 0,
      validationTime: 0,
      errorCount: 0,
    };
  }

  // 캐시 무효화
  invalidateCache(pattern?: string): void {
    if (pattern) {
      // 패턴 기반 캐시 무효화
      this.cache.deleteByPattern(pattern);
    } else {
      // 전체 캐시 무효화
      this.cache.clear();
    }
    
    console.log('🗑️ Cache invalidated');
  }

  // 지연 함수
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 전역 빌드 최적화 인스턴스
export const buildOptimizer = new BuildOptimizer();

// 빌드 최적화 헬퍼 함수들
export async function optimizedBuild(config?: Partial<BuildOptimizationConfig>) {
  const optimizer = new BuildOptimizer({
    ...DEFAULT_BUILD_CONFIG,
    ...config,
  });

  optimizer.startBuild();

  try {
    const result = await optimizer.generateIncrementalData();
    const performance = optimizer.analyzeBuildPerformance();
    
    console.log('📊 Build Performance:', performance);
    
    return result;
  } finally {
    optimizer.endBuild();
  }
}

// 빌드 상태 모니터링
export function monitorBuildProgress(callback: (progress: number, message: string) => void) {
  let progress = 0;
  
  const updateProgress = (increment: number, message: string) => {
    progress = Math.min(100, progress + increment);
    callback(progress, message);
  };

  return {
    updateProgress,
    complete: () => callback(100, 'Build completed'),
  };
} 