// 에러 추적 시스템
export interface ErrorContext {
  url?: string;
  userAgent?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'api' | 'ui' | 'build' | 'runtime' | 'network';
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errorLog: ErrorReport[] = [];
  private maxLogSize = 1000; // 최대 로그 크기
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // 전역 에러 핸들러
      window.addEventListener('error', (event) => {
        this.trackError(new Error(event.message), {
          category: 'runtime',
          severity: 'high',
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });

      // Promise rejection 핸들러
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(new Error(event.reason), {
          category: 'runtime',
          severity: 'high',
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        });
      });

      // 네트워크 에러 핸들러
      window.addEventListener('offline', () => {
        this.trackError(new Error('Network connection lost'), {
          category: 'network',
          severity: 'medium',
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        });
      });
    }
  }

  trackError(
    error: Error,
    options: {
      category: ErrorReport['category'];
      severity: ErrorReport['severity'];
      context?: Partial<ErrorContext>;
    }
  ): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      severity: options.severity,
      category: options.category,
      context: {
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        ...options.context,
      },
    };

    // 로그에 추가
    this.errorLog.push(errorReport);

    // 로그 크기 제한
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // 개발 환경에서는 콘솔에 출력
    if (this.isDevelopment) {
      console.error('Error tracked:', errorReport);
    }

    // 프로덕션에서는 에러 추적 서비스로 전송 (선택사항)
    this.sendToErrorService(errorReport);
  }

  private async sendToErrorService(errorReport: ErrorReport): Promise<void> {
    try {
      // 실제 에러 추적 서비스로 전송하는 로직
      // 예: Sentry, LogRocket, Bugsnag 등
      
      // 현재는 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        const storedErrors = JSON.parse(
          localStorage.getItem('errorLog') || '[]'
        );
        storedErrors.push(errorReport);
        
        // 최대 100개까지만 저장
        if (storedErrors.length > 100) {
          storedErrors.splice(0, storedErrors.length - 100);
        }
        
        localStorage.setItem('errorLog', JSON.stringify(storedErrors));
      }

      // API로 전송 (선택사항)
      // await fetch('/api/error-tracking', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (sendError) {
      console.error('Failed to send error to tracking service:', sendError);
    }
  }

  // API 에러 추적
  trackApiError(
    endpoint: string,
    error: Error,
    requestData?: any,
    responseData?: any
  ): void {
    this.trackError(error, {
      category: 'api',
      severity: 'medium',
      context: {
        endpoint,
        requestData,
        responseData,
        method: 'API',
      },
    });
  }

  // UI 에러 추적
  trackUIError(
    component: string,
    error: Error,
    userAction?: string
  ): void {
    this.trackError(error, {
      category: 'ui',
      severity: 'low',
      context: {
        component,
        userAction,
        method: 'UI',
      },
    });
  }

  // 빌드 에러 추적
  trackBuildError(
    error: Error,
    buildStep?: string
  ): void {
    this.trackError(error, {
      category: 'build',
      severity: 'high',
      context: {
        buildStep,
        method: 'Build',
      },
    });
  }

  // 성능 에러 추적
  trackPerformanceError(
    metric: string,
    value: number,
    threshold: number
  ): void {
    this.trackError(new Error(`Performance threshold exceeded: ${metric} = ${value} (threshold: ${threshold})`), {
      category: 'runtime',
      severity: 'medium',
      context: {
        metric,
        value,
        threshold,
        method: 'Performance',
      },
    });
  }

  // 에러 로그 조회
  getErrorLog(): ErrorReport[] {
    return [...this.errorLog];
  }

  // 에러 로그 클리어
  clearErrorLog(): void {
    this.errorLog = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('errorLog');
    }
  }

  // 에러 통계
  getErrorStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: ErrorReport[];
  } {
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.errorLog.forEach((error) => {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byCategory,
      bySeverity,
      recentErrors: this.errorLog.slice(-10), // 최근 10개
    };
  }
}

// 편의 함수들
export const errorTracker = ErrorTracker.getInstance();

export function trackError(
  error: Error,
  options: {
    category: ErrorReport['category'];
    severity: ErrorReport['severity'];
    context?: Partial<ErrorContext>;
  }
): void {
  errorTracker.trackError(error, options);
}

export function trackApiError(
  endpoint: string,
  error: Error,
  requestData?: any,
  responseData?: any
): void {
  errorTracker.trackApiError(endpoint, error, requestData, responseData);
}

export function trackUIError(
  component: string,
  error: Error,
  userAction?: string
): void {
  errorTracker.trackUIError(component, error, userAction);
}

export function trackBuildError(
  error: Error,
  buildStep?: string
): void {
  errorTracker.trackBuildError(error, buildStep);
}

export function trackPerformanceError(
  metric: string,
  value: number,
  threshold: number
): void {
  errorTracker.trackPerformanceError(metric, value, threshold);
}

export function getErrorStats() {
  return errorTracker.getErrorStats();
}

export function clearErrorLog() {
  errorTracker.clearErrorLog();
} 