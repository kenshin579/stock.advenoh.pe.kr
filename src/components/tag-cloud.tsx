'use client'

import Link from 'next/link';
import { Tag } from 'lucide-react';

interface TagCloudProps {
  tags: Array<{ name: string; count: number; }>;
  maxTags?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TagCloud({ 
  tags, 
  maxTags = 20, 
  showCount = true, 
  size = 'md',
  className = '' 
}: TagCloudProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Sort tags by count and limit
  const sortedTags = tags
    .sort((a, b) => b.count - a.count)
    .slice(0, maxTags);

  // Calculate tag sizes based on frequency
  const maxCount = Math.max(...sortedTags.map(tag => tag.count));
  const minCount = Math.min(...sortedTags.map(tag => tag.count));
  
  const getTagSize = (count: number) => {
    if (maxCount === minCount) return size;
    
    const ratio = (count - minCount) / (maxCount - minCount);
    
    if (size === 'sm') {
      return ratio > 0.7 ? 'text-sm' : ratio > 0.4 ? 'text-xs' : 'text-xs';
    } else if (size === 'lg') {
      return ratio > 0.7 ? 'text-xl' : ratio > 0.4 ? 'text-lg' : 'text-base';
    } else {
      return ratio > 0.7 ? 'text-lg' : ratio > 0.4 ? 'text-base' : 'text-sm';
    }
  };

  const getTagOpacity = (count: number) => {
    if (maxCount === minCount) return 'opacity-100';
    
    const ratio = (count - minCount) / (maxCount - minCount);
    return ratio > 0.7 ? 'opacity-100' : ratio > 0.4 ? 'opacity-80' : 'opacity-60';
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          인기 태그
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {sortedTags.map((tag) => (
          <Link
            key={tag.name}
            href={`/?tags=${encodeURIComponent(tag.name)}`}
            className={`
              inline-flex items-center gap-1 px-3 py-1.5 rounded-full 
              bg-gray-100 dark:bg-gray-800 
              hover:bg-blue-100 dark:hover:bg-blue-900
              text-gray-700 dark:text-gray-300
              hover:text-blue-700 dark:hover:text-blue-300
              transition-all duration-200
              border border-transparent hover:border-blue-200 dark:hover:border-blue-700
              ${getTagSize(tag.count)}
              ${getTagOpacity(tag.count)}
            `}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="font-medium">{tag.name}</span>
            {showCount && (
              <span className="text-xs opacity-75 ml-1">
                {tag.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Helper function to extract and count tags from posts
export function extractTagsWithCounts(posts: Array<{ tags?: string[] }>): Array<{ name: string; count: number; }> {
  const tagCounts = new Map<string, number>();
  
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        if (typeof tag === 'string' && tag.trim()) {
          const normalizedTag = tag.trim().toLowerCase();
          tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
        }
      });
    }
  });
  
  return Array.from(tagCounts.entries()).map(([name, count]) => ({ name, count }));
}