'use client';

import { cn } from '@/lib/utils';
import { ThumbnailImageProps } from './types';
import { OptimizedImage } from './optimized-image';

export function ThumbnailImage({
  src,
  alt,
  size = 150,
  className
}: ThumbnailImageProps) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-lg object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
} 