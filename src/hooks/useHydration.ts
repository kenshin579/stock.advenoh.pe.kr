'use client';

import { useEffect, useState } from 'react';

/**
 * 하이드레이션 상태를 관리하는 훅
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsHydrated(true);
  }, []);

  return {
    isHydrated,
    isClient,
    isServer: !isClient,
  };
}

/**
 * 서버와 클라이언트 간 상태 불일치를 해결하는 훅
 */
export function useServerClientSync<T>(
  serverValue: T,
  clientValue: T,
  defaultValue?: T
) {
  const { isHydrated } = useHydration();
  const [syncedValue, setSyncedValue] = useState<T>(defaultValue || serverValue);

  useEffect(() => {
    if (isHydrated) {
      setSyncedValue(clientValue);
    }
  }, [isHydrated, clientValue]);

  return syncedValue;
}

/**
 * 하이드레이션 에러를 감지하고 처리하는 훅
 */
export function useHydrationError() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('hydration') || 
          event.error?.message?.includes('Hydration')) {
        setHasError(true);
        setError(event.error);
        console.warn('Hydration error detected:', event.error);
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return {
    hasError,
    error,
    clearError: () => {
      setHasError(false);
      setError(null);
    },
  };
}

/**
 * 안전한 상태 업데이트를 위한 훅
 */
export function useSafeState<T>(initialValue: T) {
  const { isHydrated } = useHydration();
  const [value, setValue] = useState<T>(initialValue);

  const safeSetValue = (newValue: T | ((prev: T) => T)) => {
    if (isHydrated) {
      setValue(newValue);
    }
  };

  return [value, safeSetValue] as const;
}

/**
 * 클라이언트 전용 상태를 위한 훅
 */
export function useClientState<T>(initialValue: T) {
  const { isClient } = useHydration();
  const [value, setValue] = useState<T>(initialValue);

  // 서버에서는 초기값을 반환하고, 클라이언트에서만 상태 업데이트
  if (!isClient) {
    return [initialValue, () => {}] as const;
  }

  return [value, setValue] as const;
}

/**
 * 하이드레이션 완료 후 실행되는 훅
 */
export function useAfterHydration(callback: () => void | (() => void)) {
  const { isHydrated } = useHydration();

  useEffect(() => {
    if (isHydrated) {
      const cleanup = callback();
      return cleanup;
    }
  }, [isHydrated, callback]);
}

/**
 * 하이드레이션 상태를 디버깅하는 훅
 */
export function useHydrationDebug() {
  const { isHydrated, isClient, isServer } = useHydration();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Hydration Debug:', {
        isHydrated,
        isClient,
        isServer,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isHydrated, isClient, isServer]);

  return { isHydrated, isClient, isServer };
} 