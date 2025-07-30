// 성능 모니터링 시스템
export interface PerformanceMetrics {
  // 페이지 로드 메트릭
  pageLoadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // 사용자 인터랙션 메트릭
  firstInputDelay: number;
  timeToInteractive: number;
  
  // 리소스 로딩 메트릭
  resourceLoadTime: number;
  imageLoadTime: number;
  scriptLoadTime: number;
  
  // 메모리 사용량
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  
  // 네트워크 메트릭
  networkInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  
  // 타임스탬프
  timestamp: string;
  url: string;
  userAgent: string;
}

export interface PerformanceThresholds {
  lcp: number; // 2.5초
  fid: number; // 100ms
  cls: number; // 0.1
  pageLoadTime: number; // 3초
  firstPaint: number; // 1.8초
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsSize = 1000;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private thresholds: PerformanceThresholds = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    pageLoadTime: 3000,
    firstPaint: 1800,
  };

  private constructor() {
    this.setupPerformanceObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupPerformanceObservers(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint) 관찰
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordLCP(lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // FID (First Input Delay) 관찰
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const firstInputEntry = entry as PerformanceEventTiming;
            this.recordFID(firstInputEntry.processingStart - firstInputEntry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // CLS (Cumulative Layout Shift) 관찰
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordCLS(clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // 리소스 로딩 관찰
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordResourceLoad(entry);
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  private recordLCP(lcp: number): void {
    const currentMetrics = this.getCurrentMetrics();
    if (currentMetrics) {
      currentMetrics.lcp = lcp;
      currentMetrics.largestContentfulPaint = lcp;
      this.checkThreshold('lcp', lcp);
    }
  }

  private recordFID(fid: number): void {
    const currentMetrics = this.getCurrentMetrics();
    if (currentMetrics) {
      currentMetrics.fid = fid;
      currentMetrics.firstInputDelay = fid;
      this.checkThreshold('fid', fid);
    }
  }

  private recordCLS(cls: number): void {
    const currentMetrics = this.getCurrentMetrics();
    if (currentMetrics) {
      currentMetrics.cls = cls;
      this.checkThreshold('cls', cls);
    }
  }

  private recordResourceLoad(entry: PerformanceEntry): void {
    const currentMetrics = this.getCurrentMetrics();
    if (currentMetrics && 'duration' in entry) {
      const duration = entry.duration;
      
      if (entry.name.includes('.jpg') || entry.name.includes('.png') || entry.name.includes('.webp')) {
        currentMetrics.imageLoadTime = Math.max(currentMetrics.imageLoadTime || 0, duration);
      } else if (entry.name.includes('.js')) {
        currentMetrics.scriptLoadTime = Math.max(currentMetrics.scriptLoadTime || 0, duration);
      }
      
      currentMetrics.resourceLoadTime = Math.max(currentMetrics.resourceLoadTime || 0, duration);
    }
  }

  private getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  private checkThreshold(metric: keyof PerformanceThresholds, value: number): void {
    const threshold = this.thresholds[metric];
    if (value > threshold) {
      console.warn(`Performance threshold exceeded: ${metric} = ${value}ms (threshold: ${threshold}ms)`);
      
      // 에러 추적 시스템에 알림
      if (typeof window !== 'undefined') {
        import('./error-tracking').then(({ trackPerformanceError }) => {
          trackPerformanceError(metric, value, threshold);
        });
      }
    }
  }

  // 페이지 로드 성능 측정
  measurePageLoad(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
      resourceLoadTime: 0,
      imageLoadTime: 0,
      scriptLoadTime: 0,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // 메모리 사용량 (지원하는 경우)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }

    // 네트워크 정보 (지원하는 경우)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.networkInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }

    this.metrics.push(metrics);
    
    // 메트릭 크기 제한
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }

    // 개발 환경에서는 콘솔에 출력
    if (this.isDevelopment) {
      console.log('Performance metrics:', metrics);
    }

    // 임계값 확인
    this.checkThreshold('pageLoadTime', metrics.pageLoadTime);
    this.checkThreshold('firstPaint', metrics.firstPaint);

    return metrics;
  }

  // API 성능 측정
  measureApiCall(endpoint: string, startTime: number): () => void {
    return () => {
      const duration = performance.now() - startTime;
      console.log(`API call to ${endpoint} took ${duration.toFixed(2)}ms`);
      
      if (duration > 1000) {
        console.warn(`Slow API call detected: ${endpoint} (${duration.toFixed(2)}ms)`);
      }
    };
  }

  // 사용자 인터랙션 성능 측정
  measureUserInteraction(action: string, startTime: number): () => void {
    return () => {
      const duration = performance.now() - startTime;
      console.log(`User interaction ${action} took ${duration.toFixed(2)}ms`);
      
      if (duration > 100) {
        console.warn(`Slow user interaction detected: ${action} (${duration.toFixed(2)}ms)`);
      }
    };
  }

  // 성능 메트릭 조회
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  // 최근 메트릭 조회
  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  // 성능 통계
  getPerformanceStats(): {
    averagePageLoadTime: number;
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
    slowestPages: Array<{ url: string; loadTime: number }>;
    performanceScore: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averagePageLoadTime: 0,
        averageLCP: 0,
        averageFID: 0,
        averageCLS: 0,
        slowestPages: [],
        performanceScore: 0,
      };
    }

    const avgPageLoadTime = this.metrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / this.metrics.length;
    const avgLCP = this.metrics.reduce((sum, m) => sum + m.lcp, 0) / this.metrics.length;
    const avgFID = this.metrics.reduce((sum, m) => sum + m.fid, 0) / this.metrics.length;
    const avgCLS = this.metrics.reduce((sum, m) => sum + m.cls, 0) / this.metrics.length;

    // 가장 느린 페이지들
    const slowestPages = this.metrics
      .map(m => ({ url: m.url, loadTime: m.pageLoadTime }))
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);

    // 성능 점수 계산 (0-100)
    const lcpScore = Math.max(0, 100 - (avgLCP / 25)); // LCP 2.5초 = 0점
    const fidScore = Math.max(0, 100 - (avgFID / 1)); // FID 100ms = 0점
    const clsScore = Math.max(0, 100 - (avgCLS * 1000)); // CLS 0.1 = 0점
    const loadTimeScore = Math.max(0, 100 - (avgPageLoadTime / 30)); // 3초 = 0점

    const performanceScore = Math.round((lcpScore + fidScore + clsScore + loadTimeScore) / 4);

    return {
      averagePageLoadTime: avgPageLoadTime,
      averageLCP: avgLCP,
      averageFID: avgFID,
      averageCLS: avgCLS,
      slowestPages,
      performanceScore,
    };
  }

  // 메트릭 클리어
  clearMetrics(): void {
    this.metrics = [];
  }

  // 임계값 설정
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}

// 편의 함수들
export const performanceMonitor = PerformanceMonitor.getInstance();

export function measurePageLoad(): PerformanceMetrics {
  return performanceMonitor.measurePageLoad();
}

export function measureApiCall(endpoint: string): () => void {
  const startTime = performance.now();
  return performanceMonitor.measureApiCall(endpoint, startTime);
}

export function measureUserInteraction(action: string): () => void {
  const startTime = performance.now();
  return performanceMonitor.measureUserInteraction(action, startTime);
}

export function getPerformanceStats() {
  return performanceMonitor.getPerformanceStats();
}

export function clearPerformanceMetrics() {
  performanceMonitor.clearMetrics();
}

// 페이지 로드 시 자동 측정
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      measurePageLoad();
    }, 0);
  });
} 