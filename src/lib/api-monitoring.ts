// API 성능 모니터링 유틸리티

export interface ApiMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export interface PerformanceThresholds {
  warning: number; // ms
  error: number; // ms
}

// 기본 성능 임계값
export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  warning: 500,
  error: 1000,
};

// 성능 메트릭 저장소 (메모리 기반, 프로덕션에서는 Redis나 DB 사용 권장)
class ApiMetricsStore {
  private metrics: ApiMetrics[] = [];
  private maxMetrics = 1000; // 최대 저장 메트릭 수

  addMetric(metric: ApiMetrics) {
    this.metrics.push(metric);
    
    // 최대 개수 초과 시 오래된 메트릭 제거
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): ApiMetrics[] {
    return [...this.metrics];
  }

  getMetricsByEndpoint(endpoint: string): ApiMetrics[] {
    return this.metrics.filter(m => m.endpoint === endpoint);
  }

  getSlowQueries(threshold: number = 1000): ApiMetrics[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  getErrorQueries(): ApiMetrics[] {
    return this.metrics.filter(m => m.status >= 400);
  }

  getAverageResponseTime(endpoint?: string): number {
    const targetMetrics = endpoint 
      ? this.getMetricsByEndpoint(endpoint)
      : this.metrics;
    
    if (targetMetrics.length === 0) return 0;
    
    const totalDuration = targetMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / targetMetrics.length;
  }

  clear() {
    this.metrics = [];
  }
}

// 전역 메트릭 저장소
export const apiMetricsStore = new ApiMetricsStore();

// API 성능 측정 함수
export function measureApiPerformance(
  endpoint: string,
  method: string = 'GET',
  thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS
) {
  const startTime = performance.now();
  
  return {
    end: (status: number, userAgent?: string, ip?: string) => {
      const duration = performance.now() - startTime;
      
      const metric: ApiMetrics = {
        endpoint,
        method,
        duration,
        status,
        timestamp: new Date().toISOString(),
        userAgent,
        ip,
      };
      
      // 메트릭 저장
      apiMetricsStore.addMetric(metric);
      
      // 성능 로깅
      if (duration > thresholds.error) {
        console.error(`🚨 Slow API call: ${method} ${endpoint} took ${duration.toFixed(2)}ms (status: ${status})`);
      } else if (duration > thresholds.warning) {
        console.warn(`⚠️  Slow API call: ${method} ${endpoint} took ${duration.toFixed(2)}ms (status: ${status})`);
      } else {
        console.log(`✅ API call: ${method} ${endpoint} took ${duration.toFixed(2)}ms (status: ${status})`);
      }
      
      return metric;
    }
  };
}

// 성능 분석 함수
export function analyzeApiPerformance() {
  const metrics = apiMetricsStore.getMetrics();
  
  if (metrics.length === 0) {
    return {
      totalCalls: 0,
      averageResponseTime: 0,
      slowQueries: [],
      errorQueries: [],
      topEndpoints: [],
    };
  }
  
  // 엔드포인트별 통계
  const endpointStats = new Map<string, { count: number; totalDuration: number; errors: number }>();
  
  metrics.forEach(metric => {
    const stats = endpointStats.get(metric.endpoint) || { count: 0, totalDuration: 0, errors: 0 };
    stats.count++;
    stats.totalDuration += metric.duration;
    if (metric.status >= 400) stats.errors++;
    endpointStats.set(metric.endpoint, stats);
  });
  
  // 상위 엔드포인트 (호출 횟수 기준)
  const topEndpoints = Array.from(endpointStats.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      count: stats.count,
      averageDuration: stats.totalDuration / stats.count,
      errorRate: (stats.errors / stats.count) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalCalls: metrics.length,
    averageResponseTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
    slowQueries: apiMetricsStore.getSlowQueries(),
    errorQueries: apiMetricsStore.getErrorQueries(),
    topEndpoints,
  };
}

// 성능 리포트 생성
export function generatePerformanceReport(): string {
  const analysis = analyzeApiPerformance();
  
  let report = `📊 API Performance Report\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `📈 Overall Statistics:\n`;
  report += `- Total API calls: ${analysis.totalCalls}\n`;
  report += `- Average response time: ${analysis.averageResponseTime.toFixed(2)}ms\n`;
  report += `- Slow queries (>1s): ${analysis.slowQueries.length}\n`;
  report += `- Error queries: ${analysis.errorQueries.length}\n\n`;
  
  report += `🏆 Top Endpoints:\n`;
  analysis.topEndpoints.forEach((endpoint, index) => {
    report += `${index + 1}. ${endpoint.endpoint}\n`;
    report += `   - Calls: ${endpoint.count}\n`;
    report += `   - Avg duration: ${endpoint.averageDuration.toFixed(2)}ms\n`;
    report += `   - Error rate: ${endpoint.errorRate.toFixed(1)}%\n`;
  });
  
  if (analysis.slowQueries.length > 0) {
    report += `\n🐌 Slow Queries:\n`;
    analysis.slowQueries.slice(0, 5).forEach(query => {
      report += `- ${query.method} ${query.endpoint}: ${query.duration.toFixed(2)}ms (${query.status})\n`;
    });
  }
  
  if (analysis.errorQueries.length > 0) {
    report += `\n❌ Error Queries:\n`;
    analysis.errorQueries.slice(0, 5).forEach(query => {
      report += `- ${query.method} ${query.endpoint}: ${query.status} (${query.duration.toFixed(2)}ms)\n`;
    });
  }
  
  return report;
} 