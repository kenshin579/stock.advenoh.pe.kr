'use client';

import { useState } from 'react';

interface MarkdownImageProps {
  src: string;
  alt?: string;
  title?: string;
  slug?: string;
  category?: string;
}

export function MarkdownImage({ src, alt, title, slug, category }: MarkdownImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => {
    let imageSrc = src;
    
    // Handle relative paths for blog post images
    if (slug && !src.startsWith('/') && !src.startsWith('http')) {
      let categoryDir = 'stock'; // default
      if (category) {
        switch (category.toLowerCase()) {
          case 'etf':
            categoryDir = 'etf';
            break;
          case 'weekly':
            categoryDir = 'weekly';
            break;
          case 'etc':
            categoryDir = 'etc';
            break;
          case 'stock':
          default:
            categoryDir = 'stock';
            break;
        }
      }
      
      imageSrc = `/contents/${categoryDir}/${slug}/${src}`;
    } else if (!src.startsWith('/') && !src.startsWith('http')) {
      imageSrc = `/contents/${src}`;
    }
    
    return imageSrc;
  });

  const handleError = () => {
    if (hasError) {
      // 이미 에러가 발생했으면 에러 메시지 표시
      return;
    }

    // 대체 경로 시도
    if (slug && !src.startsWith('/') && !src.startsWith('http')) {
      const categories = ['stock', 'etf', 'weekly', 'etc'];
      const currentCategory = category?.toLowerCase() || 'stock';
      const otherCategories = categories.filter(cat => cat !== currentCategory);
      
      const alternatives = [
        ...otherCategories.map(cat => `/contents/${cat}/${slug}/${src}`),
        `/contents/${src}`,
      ];
      
      const currentIndex = alternatives.indexOf(currentSrc);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < alternatives.length) {
        setCurrentSrc(alternatives[nextIndex]);
        return;
      }
    }
    
    // 모든 대체 경로가 실패하면 에러 상태로 설정
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-32 bg-muted rounded-lg border border-border/20 text-muted-foreground text-sm mb-4">
        <div className="text-center">
          <div>이미지를 불러올 수 없습니다</div>
          {alt && <div className="text-xs mt-1 opacity-60">{alt}</div>}
        </div>
      </div>
    );
  }

  return (
    <span className="block mb-4 text-center">
      <img
        src={currentSrc}
        alt={alt || ''}
        title={title}
        className="max-w-full h-auto rounded-lg shadow-md border border-border/20 inline-block"
        loading="lazy"
        onError={handleError}
      />
    </span>
  );
} 