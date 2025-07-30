'use client';

// Core Web Vitals 측정 및 모니터링
export function measureCoreWebVitals() {
  if (typeof window === 'undefined') return;

  // LCP (Largest Contentful Paint) 측정
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    console.log('LCP:', lastEntry.startTime);
    
    // LCP가 2.5초를 초과하면 경고
    if (lastEntry.startTime > 2500) {
      console.warn('LCP is too slow:', lastEntry.startTime);
    }
  });
  
  observer.observe({ entryTypes: ['largest-contentful-paint'] });

  // FID (First Input Delay) 측정
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      const fidEntry = entry as PerformanceEventTiming;
      const fid = fidEntry.processingStart - fidEntry.startTime;
      console.log('FID:', fid);
      
      // FID가 100ms를 초과하면 경고
      if (fid > 100) {
        console.warn('FID is too slow:', fid);
      }
    });
  });
  
  fidObserver.observe({ entryTypes: ['first-input'] });

  // CLS (Cumulative Layout Shift) 측정
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clsEntry = entry as any;
      if (!clsEntry.hadRecentInput) {
        clsValue += clsEntry.value;
        console.log('CLS:', clsValue);
        
        // CLS가 0.1을 초과하면 경고
        if (clsValue > 0.1) {
          console.warn('CLS is too high:', clsValue);
        }
      }
    });
  });
  
  clsObserver.observe({ entryTypes: ['layout-shift'] });
}

// 페이지 로드 시간 측정
export function measurePageLoadTime() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    };
    
    console.log('Page Load Metrics:', metrics);
    
    // 성능 메트릭을 서버로 전송 (선택사항)
    // sendMetricsToServer(metrics);
  });
}

// 이미지 로딩 성능 측정
export function measureImagePerformance() {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    const startTime = performance.now();
    
    img.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      console.log(`Image loaded in ${loadTime.toFixed(2)}ms:`, img.src);
      
      if (loadTime > 1000) {
        console.warn('Slow image load:', img.src, loadTime);
      }
    });
    
    img.addEventListener('error', () => {
      console.error('Image failed to load:', img.src);
    });
  });
}

// 번들 크기 분석 (개발 시에만)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    // webpack-bundle-analyzer 결과를 콘솔에 출력
    console.log('Bundle analysis available in development mode');
  }
}

// 성능 메트릭 수집 및 전송
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendMetricsToServer(metrics: any) {
  // 실제 구현에서는 분석 서비스로 전송
  // 예: Google Analytics, Sentry, Custom Analytics
  console.log('Sending metrics to server:', metrics);
}

// 성능 모니터링 초기화
export function initPerformanceMonitoring() {
  measureCoreWebVitals();
  measurePageLoadTime();
  measureImagePerformance();
  
  // 개발 모드에서 번들 분석
  if (process.env.NODE_ENV === 'development') {
    analyzeBundleSize();
  }
} 