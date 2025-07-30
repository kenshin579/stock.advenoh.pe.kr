'use client';

import Image from 'next/image';
import { useState } from 'react';
import { OptimizedImageProps } from './types';

/**
 * OptimizedImage 컴포넌트
 * 
 * Next.js Image 컴포넌트를 래핑하여 최적화된 이미지 로딩을 제공합니다.
 * 
 * 주요 기능:
 * - 자동 이미지 최적화 (WebP, AVIF 포맷 지원)
 * - Lazy loading 및 blur placeholder
 * - 에러 처리 및 로딩 상태 표시
 * - 반응형 이미지 크기 조정
 * 
 * @param src - 이미지 소스 URL
 * @param alt - 이미지 대체 텍스트 (접근성 필수)
 * @param width - 이미지 너비 (픽셀)
 * @param height - 이미지 높이 (픽셀)
 * @param priority - 우선 로딩 여부 (LCP 이미지에 권장)
 * @param className - 추가 CSS 클래스
 * @param sizes - 반응형 이미지 크기 정의
 * @param quality - 이미지 품질 (1-100, 기본값: 85)
 * @param placeholder - 플레이스홀더 타입 ('blur' | 'empty')
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'blur',
}: OptimizedImageProps) {
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || '');

  // 기본 blur placeholder (SVG)
  // 작은 크기의 SVG를 base64로 인코딩하여 빠른 로딩
  const defaultBlurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMCAxMEgzMFYzMEgxMFYxMFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+';

  // Fallback 이미지 URL
  const fallbackImageUrl = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop&auto=format';

  const handleError = () => {
    if (currentSrc !== fallbackImageUrl) {
      setCurrentSrc(fallbackImageUrl);
      setHasError(false);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // 에러 상태일 때 fallback UI 표시
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Next.js Image 컴포넌트 */}
      <Image
        src={currentSrc}
        alt={alt || ''}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : ''}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
        style={{
          objectFit: 'cover',
        }}
      />
      
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
} 