'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 클라이언트 사이드에서만 렌더링되는 컴포넌트
 * SSR과 하이드레이션 이슈를 방지하기 위해 사용
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 특정 조건에서만 클라이언트에서 렌더링되는 컴포넌트
 */
export function ClientOnlyWhen({ 
  children, 
  condition, 
  fallback = null 
}: ClientOnlyProps & { condition: boolean }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || !condition) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 지연 로딩을 위한 클라이언트 전용 컴포넌트
 */
export function ClientOnlyLazy({ 
  children, 
  fallback = null,
  delay = 0 
}: ClientOnlyProps & { delay?: number }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 