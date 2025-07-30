// 사용자 행동 분석 시스템
export interface PageView {
  url: string;
  title: string;
  timestamp: string;
  referrer: string;
  userAgent: string;
  sessionId: string;
  duration?: number;
  scrollDepth?: number;
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'search';
  element: string;
  value?: string;
  timestamp: string;
  url: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface ContentEngagement {
  contentId: string;
  contentType: 'blog' | 'series' | 'page';
  action: 'view' | 'click' | 'share' | 'bookmark';
  timestamp: string;
  sessionId: string;
  duration?: number;
  scrollDepth?: number;
}

export interface SearchQuery {
  query: string;
  results: number;
  timestamp: string;
  sessionId: string;
  filters?: Record<string, any>;
}

class UserAnalytics {
  private static instance: UserAnalytics;
  private pageViews: PageView[] = [];
  private interactions: UserInteraction[] = [];
  private contentEngagements: ContentEngagement[] = [];
  private searchQueries: SearchQuery[] = [];
  private maxDataSize = 1000;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private sessionId: string;
  private pageStartTime: number = 0;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.trackPageView();
  }

  static getInstance(): UserAnalytics {
    if (!UserAnalytics.instance) {
      UserAnalytics.instance = new UserAnalytics();
    }
    return UserAnalytics.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      // 페이지 언로드 시 페이지 체류 시간 기록
      window.addEventListener('beforeunload', () => {
        this.recordPageDuration();
      });

      // 페이지 가시성 변경 시
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.recordPageDuration();
        } else {
          this.pageStartTime = Date.now();
        }
      });

      // 클릭 이벤트 추적
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        this.trackInteraction('click', target.tagName.toLowerCase(), {
          className: target.className,
          id: target.id,
          text: target.textContent?.substring(0, 50),
        });
      });

      // 스크롤 이벤트 추적 (디바운스 적용)
      let scrollTimeout: NodeJS.Timeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollDepth = this.calculateScrollDepth();
          this.trackScrollDepth(scrollDepth);
        }, 100);
      });

      // 입력 이벤트 추적
      document.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.type === 'search' || target.placeholder?.includes('검색')) {
          this.trackSearchInput(target.value);
        }
      });

      // 폼 제출 이벤트 추적
      document.addEventListener('submit', (event) => {
        const form = event.target as HTMLFormElement;
        this.trackFormSubmission(form);
      });
    }
  }

  private trackPageView(): void {
    const pageView: PageView = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
    };

    this.pageViews.push(pageView);
    this.pageStartTime = Date.now();

    // 개발 환경에서는 콘솔에 출력
    if (this.isDevelopment) {
      console.log('Page view tracked:', pageView);
    }

    // 데이터 크기 제한
    this.limitDataSize();
  }

  private recordPageDuration(): void {
    if (this.pageViews.length > 0) {
      const duration = Date.now() - this.pageStartTime;
      this.pageViews[this.pageViews.length - 1].duration = duration;
    }
  }

  private calculateScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    return documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
  }

  private trackScrollDepth(depth: number): void {
    // 스크롤 깊이가 25%, 50%, 75%, 100%에 도달했을 때만 기록
    const thresholds = [25, 50, 75, 100];
    const currentPageView = this.pageViews[this.pageViews.length - 1];
    
    if (currentPageView && !currentPageView.scrollDepth) {
      currentPageView.scrollDepth = 0;
    }

    if (currentPageView && currentPageView.scrollDepth !== undefined) {
      const maxReached = Math.max(...thresholds.filter(t => depth >= t));
      if (maxReached > currentPageView.scrollDepth) {
        currentPageView.scrollDepth = maxReached;
        
        // 콘텐츠 참여도 기록
        this.trackContentEngagement('page', 'view', {
          scrollDepth: maxReached,
        });
      }
    }
  }

  trackInteraction(
    type: UserInteraction['type'],
    element: string,
    metadata?: Record<string, any>
  ): void {
    const interaction: UserInteraction = {
      type,
      element,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      sessionId: this.sessionId,
      metadata,
    };

    this.interactions.push(interaction);

    if (this.isDevelopment) {
      console.log('User interaction tracked:', interaction);
    }

    this.limitDataSize();
  }

  trackContentEngagement(
    contentType: ContentEngagement['contentType'],
    action: ContentEngagement['action'],
    metadata?: Record<string, any>
  ): void {
    const contentId = this.extractContentId();
    
    const engagement: ContentEngagement = {
      contentId,
      contentType,
      action,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      duration: metadata?.duration,
      scrollDepth: metadata?.scrollDepth,
    };

    this.contentEngagements.push(engagement);

    if (this.isDevelopment) {
      console.log('Content engagement tracked:', engagement);
    }

    this.limitDataSize();
  }

  trackSearchQuery(
    query: string,
    results: number,
    filters?: Record<string, any>
  ): void {
    const searchQuery: SearchQuery = {
      query,
      results,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      filters,
    };

    this.searchQueries.push(searchQuery);

    if (this.isDevelopment) {
      console.log('Search query tracked:', searchQuery);
    }

    this.limitDataSize();
  }

  private searchTimeout?: NodeJS.Timeout;
  
  private trackSearchInput(value: string): void {
    // 검색 입력 추적 (디바운스 적용)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      if (value.trim()) {
        this.trackInteraction('search', 'search-input', { query: value });
      }
    }, 500);
  }

  private trackFormSubmission(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const formValues: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      formValues[key] = value;
    }

    this.trackInteraction('input', 'form-submit', {
      formId: form.id,
      formAction: form.action,
      formValues,
    });
  }

  private extractContentId(): string {
    const path = window.location.pathname;
    
    // 블로그 포스트 ID 추출
    if (path.includes('/contents/')) {
      const parts = path.split('/');
      return parts[parts.length - 1] || 'unknown';
    }
    
    // 시리즈 ID 추출
    if (path.includes('/series/')) {
      const parts = path.split('/');
      return parts[parts.length - 1] || 'unknown';
    }
    
    return path || 'home';
  }

  private limitDataSize(): void {
    if (this.pageViews.length > this.maxDataSize) {
      this.pageViews = this.pageViews.slice(-this.maxDataSize);
    }
    if (this.interactions.length > this.maxDataSize) {
      this.interactions = this.interactions.slice(-this.maxDataSize);
    }
    if (this.contentEngagements.length > this.maxDataSize) {
      this.contentEngagements = this.contentEngagements.slice(-this.maxDataSize);
    }
    if (this.searchQueries.length > this.maxDataSize) {
      this.searchQueries = this.searchQueries.slice(-this.maxDataSize);
    }
  }

  // 분석 데이터 조회
  getPageViews(): PageView[] {
    return [...this.pageViews];
  }

  getInteractions(): UserInteraction[] {
    return [...this.interactions];
  }

  getContentEngagements(): ContentEngagement[] {
    return [...this.contentEngagements];
  }

  getSearchQueries(): SearchQuery[] {
    return [...this.searchQueries];
  }

  // 사용자 행동 통계
  getUserBehaviorStats(): {
    totalPageViews: number;
    averageSessionDuration: number;
    mostVisitedPages: Array<{ url: string; views: number }>;
    popularContent: Array<{ contentId: string; engagements: number }>;
    searchTrends: Array<{ query: string; count: number }>;
    interactionPatterns: Record<string, number>;
  } {
    // 페이지별 방문 횟수
    const pageViewsCount: Record<string, number> = {};
    this.pageViews.forEach(view => {
      pageViewsCount[view.url] = (pageViewsCount[view.url] || 0) + 1;
    });

    const mostVisitedPages = Object.entries(pageViewsCount)
      .map(([url, views]) => ({ url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // 콘텐츠 참여도
    const contentEngagementsCount: Record<string, number> = {};
    this.contentEngagements.forEach(engagement => {
      contentEngagementsCount[engagement.contentId] = (contentEngagementsCount[engagement.contentId] || 0) + 1;
    });

    const popularContent = Object.entries(contentEngagementsCount)
      .map(([contentId, engagements]) => ({ contentId, engagements }))
      .sort((a, b) => b.engagements - a.engagements)
      .slice(0, 10);

    // 검색 트렌드
    const searchCount: Record<string, number> = {};
    this.searchQueries.forEach(query => {
      searchCount[query.query] = (searchCount[query.query] || 0) + 1;
    });

    const searchTrends = Object.entries(searchCount)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 인터랙션 패턴
    const interactionPatterns: Record<string, number> = {};
    this.interactions.forEach(interaction => {
      interactionPatterns[interaction.type] = (interactionPatterns[interaction.type] || 0) + 1;
    });

    // 평균 세션 시간
    const sessions: Record<string, number[]> = {};
    this.pageViews.forEach(view => {
      if (!sessions[view.sessionId]) {
        sessions[view.sessionId] = [];
      }
      if (view.duration) {
        sessions[view.sessionId].push(view.duration);
      }
    });

    const averageSessionDuration = Object.values(sessions)
      .reduce((total, durations) => total + durations.reduce((sum, d) => sum + d, 0), 0) / 
      Object.values(sessions).reduce((total, durations) => total + durations.length, 0) || 0;

    return {
      totalPageViews: this.pageViews.length,
      averageSessionDuration,
      mostVisitedPages,
      popularContent,
      searchTrends,
      interactionPatterns,
    };
  }

  // 데이터 내보내기
  exportData(): {
    pageViews: PageView[];
    interactions: UserInteraction[];
    contentEngagements: ContentEngagement[];
    searchQueries: SearchQuery[];
    stats: ReturnType<typeof this.getUserBehaviorStats>;
  } {
    return {
      pageViews: this.getPageViews(),
      interactions: this.getInteractions(),
      contentEngagements: this.getContentEngagements(),
      searchQueries: this.getSearchQueries(),
      stats: this.getUserBehaviorStats(),
    };
  }

  // 데이터 클리어
  clearData(): void {
    this.pageViews = [];
    this.interactions = [];
    this.contentEngagements = [];
    this.searchQueries = [];
  }
}

// 편의 함수들
export const userAnalytics = UserAnalytics.getInstance();

// trackPageView는 private이므로 외부에서 직접 호출할 수 없음
// 대신 페이지 로드 시 자동으로 호출됨

export function trackInteraction(
  type: UserInteraction['type'],
  element: string,
  metadata?: Record<string, any>
): void {
  userAnalytics.trackInteraction(type, element, metadata);
}

export function trackContentEngagement(
  contentType: ContentEngagement['contentType'],
  action: ContentEngagement['action'],
  metadata?: Record<string, any>
): void {
  userAnalytics.trackContentEngagement(contentType, action, metadata);
}

export function trackSearchQuery(
  query: string,
  results: number,
  filters?: Record<string, any>
): void {
  userAnalytics.trackSearchQuery(query, results, filters);
}

export function getUserBehaviorStats() {
  return userAnalytics.getUserBehaviorStats();
}

export function exportAnalyticsData() {
  return userAnalytics.exportData();
}

export function clearAnalyticsData() {
  userAnalytics.clearData();
} 