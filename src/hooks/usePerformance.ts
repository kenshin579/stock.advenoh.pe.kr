'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

interface PerformanceObserver {
  observe: (entry: any) => void;
  disconnect: () => void;
}

export function usePerformance() {
  const metricsRef = useRef<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
  });

  const observerRef = useRef<PerformanceObserver | null>(null);

  const measurePageLoadTime = useCallback(() => {
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metricsRef.current.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
      }
    }
  }, []);

  const measureFirstContentfulPaint = useCallback(() => {
    if (typeof window !== 'undefined') {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metricsRef.current.firstContentfulPaint = fcpEntry.startTime;
      }
    }
  }, []);

  const measureLargestContentfulPaint = useCallback(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new (window as any).PerformanceObserver((list: any) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          metricsRef.current.largestContentfulPaint = lastEntry.startTime;
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      observerRef.current = observer;
    }
  }, []);

  const measureFirstInputDelay = useCallback(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new (window as any).PerformanceObserver((list: any) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            metricsRef.current.firstInputDelay = entry.processingStart - entry.startTime;
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }, []);

  const measureCumulativeLayoutShift = useCallback(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new (window as any).PerformanceObserver((list: any) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        metricsRef.current.cumulativeLayoutShift = clsValue;
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }, []);

  const logMetrics = useCallback(() => {
    console.log('Performance Metrics:', metricsRef.current);
    
    // 성능 기준 체크
    const { pageLoadTime, firstContentfulPaint, largestContentfulPaint, firstInputDelay, cumulativeLayoutShift } = metricsRef.current;
    
    if (pageLoadTime > 3000) {
      console.warn('Page load time is slow:', pageLoadTime);
    }
    
    if (firstContentfulPaint > 1800) {
      console.warn('First Contentful Paint is slow:', firstContentfulPaint);
    }
    
    if (largestContentfulPaint > 2500) {
      console.warn('Largest Contentful Paint is slow:', largestContentfulPaint);
    }
    
    if (firstInputDelay > 100) {
      console.warn('First Input Delay is high:', firstInputDelay);
    }
    
    if (cumulativeLayoutShift > 0.1) {
      console.warn('Cumulative Layout Shift is high:', cumulativeLayoutShift);
    }
  }, []);

  useEffect(() => {
    // 페이지 로드 완료 후 메트릭 측정
    if (document.readyState === 'complete') {
      measurePageLoadTime();
      measureFirstContentfulPaint();
    } else {
      window.addEventListener('load', () => {
        measurePageLoadTime();
        measureFirstContentfulPaint();
      });
    }

    // Core Web Vitals 측정
    measureLargestContentfulPaint();
    measureFirstInputDelay();
    measureCumulativeLayoutShift();

    // 컴포넌트 언마운트 시 observer 정리
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [measurePageLoadTime, measureFirstContentfulPaint, measureLargestContentfulPaint, measureFirstInputDelay, measureCumulativeLayoutShift]);

  return {
    metrics: metricsRef.current,
    logMetrics,
  };
} 