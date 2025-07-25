import { useState, useRef, useEffect } from 'react';
import { generateContextualAlt, getOptimizedImageProps, supportsWebP } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  context?: {
    postTitle?: string;
    category?: string;
    tags?: string[];
    caption?: string;
  };
  enableWebP?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
  priority?: boolean;
}

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
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
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
        rootMargin: '50px' // Start loading 50px before entering viewport
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
      optimizedSrc += `&fm=webp`;
    }
    
    // Add size parameters if provided
    if (width) optimizedSrc += `&w=${width}`;
    if (height) optimizedSrc += `&h=${height}`;
    
    return optimizedSrc;
  };

  // Get image props
  const imageProps = getOptimizedImageProps(
    isInView ? getOptimizedSrc() : '',
    optimizedAlt,
    {
      enableLazyLoading: !priority,
      quality
    }
  );

  // Generate responsive srcSet if sizes provided
  const srcSet = sizes && isInView ? `${getOptimizedSrc()} 1x` : undefined;

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{ 
        aspectRatio: width && height ? `${width}/${height}` : undefined 
      }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse"
          style={{
            backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '20px 20px'
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          {...imageProps}
          width={width}
          height={height}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            width && height ? 'w-full h-full object-cover' : 'max-w-full h-auto'
          )}
        />
      )}

      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Preset component for blog post images
export function BlogImage({
  src,
  alt,
  caption,
  postTitle,
  category,
  tags,
  className
}: {
  src: string;
  alt?: string;
  caption?: string;
  postTitle?: string;
  category?: string;
  tags?: string[];
  className?: string;
}) {
  return (
    <figure className={cn('my-6', className)}>
      <LazyImage
        src={src}
        alt={alt}
        context={{
          postTitle,
          category,
          tags,
          caption
        }}
        className="rounded-lg shadow-md"
        quality={90}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Preset component for hero/featured images
export function HeroImage({
  src,
  alt,
  className
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      priority={true}
      quality={95}
      className={cn('w-full h-64 md:h-80 lg:h-96', className)}
      sizes="100vw"
    />
  );
}

// Preset component for thumbnail images
export function ThumbnailImage({
  src,
  alt,
  size = 150,
  className
}: {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-md', className)}
      quality={80}
      placeholder="empty"
    />
  );
}