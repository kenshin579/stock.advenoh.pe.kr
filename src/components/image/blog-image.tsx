'use client';

import { cn } from '@/lib/utils';
import { BlogImageProps } from './types';
import { LazyImage } from './lazy-image';

export function BlogImage({
  src,
  alt,
  caption,
  postTitle,
  category,
  tags,
  className
}: BlogImageProps) {
  const context = {
    postTitle,
    category,
    tags,
    caption,
  };

  return (
    <figure className={cn('my-8', className)}>
      <LazyImage
        src={src}
        alt={alt}
        context={context}
        className="w-full rounded-lg shadow-lg"
        priority={true}
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
} 