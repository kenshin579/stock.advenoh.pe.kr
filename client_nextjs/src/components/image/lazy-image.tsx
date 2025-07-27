'use client';

import { useState, useRef, useEffect } from 'react';
import { generateContextualAlt, getOptimizedImageProps, supportsWebP } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { LazyImageProps } from './types';

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  context,
  enableWebP = true,
  quality = 85,
  placeholder = 'blur',
  sizes,
  priority = false
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [optimizedAlt, setOptimizedAlt] = useState(alt || '');

  // Generate optimized alt text
  useEffect(() => {
    if (!alt && src) {
      const filename = src.split('/').pop() || '';
      const contextualAlt = generateContextualAlt(filename, context);
      setOptimizedAlt(contextualAlt);
    } else {
      setOptimizedAlt(alt || '');
    }
  }, [alt, src, context]);

  // Check WebP support
  useEffect(() => {
    if (enableWebP) {
      supportsWebP().then(setWebpSupported);
    } else {
      setWebpSupported(false);
    }
  }, [enableWebP]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Get optimized image source
  const getOptimizedSrc = () => {
    if (webpSupported === null) return src;
    
    let optimizedSrc = src;
    
    // Add quality parameter
    const separator = src.includes('?') ? '&' : '?';
    optimizedSrc += `${separator}q=${quality}`;
    
    // Add WebP format if supported
    if (webpSupported && enableWebP) {
      optimizedSrc += '&fmt=webp';
    }
    
    return optimizedSrc;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isInView && (
        <img
          ref={imgRef}
          src={getOptimizedSrc()}
          alt={optimizedAlt}
          width={width}
          height={height}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'duration-700 ease-in-out transition-all',
            isLoaded ? 'scale-100 blur-0 grayscale-0' : 'scale-110 blur-2xl grayscale'
          )}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
      )}
      
      {/* Placeholder */}
      {!isInView && (
        <div 
          className="bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
} 