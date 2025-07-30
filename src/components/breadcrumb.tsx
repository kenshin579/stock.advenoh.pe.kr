import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 ${className}`} aria-label="Breadcrumb">
      <Link href="/" className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
        <Home className="h-4 w-4" />
        <span className="sr-only">홈</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400 dark:text-gray-500" />
          {item.href && index < items.length - 1 ? (
            <a 
              href={item.href} 
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className={index === items.length - 1 ? 'text-gray-900 dark:text-white font-medium' : ''}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Helper function to generate breadcrumb items for different page types
export function generateBreadcrumbs(pageType: string, data?: Record<string, string>): BreadcrumbItem[] {
  switch (pageType) {
    case 'blog-list':
      return [
        { label: '블로그' }
      ];
      
    case 'blog-post':
      const items: BreadcrumbItem[] = [
        { label: '블로그', href: '/' }
      ];
      
      if (data?.category) {
        items.push({
          label: data.category,
          href: `/?category=${encodeURIComponent(data.category)}`
        });
      }
      
      if (data?.series) {
        items.push({
          label: data.series,
          href: `/series/${encodeURIComponent(data.series)}`
        });
      }
      
      items.push({
        label: data?.title || '글'
      });
      
      return items;
      
    case 'series-list':
      return [
        { label: '블로그', href: '/' },
        { label: '시리즈' }
      ];
      
    case 'series-detail':
      return [
        { label: '블로그', href: '/' },
        { label: '시리즈', href: '/series' },
        { label: data?.name || '시리즈' }
      ];
      
    case 'category':
      return [
        { label: '블로그', href: '/' },
        { label: data?.category || '카테고리' }
      ];
      
    case 'search':
      return [
        { label: '블로그', href: '/' },
        { label: `검색: "${data?.query || ''}"` }
      ];
      
    default:
      return [];
  }
}