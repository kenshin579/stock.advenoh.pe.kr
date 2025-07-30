// Common image context interface
export interface ImageContext {
  postTitle?: string;
  category?: string;
  tags?: string[];
  caption?: string;
}

// Base image props interface
export interface BaseImageProps {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}

// LazyImage component props
export interface LazyImageProps extends BaseImageProps {
  width?: number;
  height?: number;
  context?: ImageContext;
  enableWebP?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
}

// BlogImage component props
export interface BlogImageProps extends BaseImageProps {
  caption?: string;
  postTitle?: string;
  category?: string;
  tags?: string[];
}

// HeroImage component props
export interface HeroImageProps extends BaseImageProps {
  width?: number;
  height?: number;
}

// ThumbnailImage component props
export interface ThumbnailImageProps extends BaseImageProps {
  size?: number;
}

// OptimizedImage component props (Next.js Image wrapper)
export interface OptimizedImageProps extends BaseImageProps {
  width: number;
  height: number;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
} 