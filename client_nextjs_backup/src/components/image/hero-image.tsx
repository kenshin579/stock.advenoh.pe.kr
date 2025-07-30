'use client';

import { cn } from '@/lib/utils';
import { HeroImageProps } from './types';
import { OptimizedImage } from './optimized-image';

export function HeroImage({
  src,
  alt,
  width = 1200,
  height = 600,
  className
}: HeroImageProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={true}
        className="w-full h-auto"
        sizes="100vw"
      />
    </div>
  );
} 