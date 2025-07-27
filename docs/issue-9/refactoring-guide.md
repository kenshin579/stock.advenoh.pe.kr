# Next.js 최적화 리팩토링 가이드

## 개요

이 문서는 Next.js 15 + App Router 기반 블로그 애플리케이션의 최적화를 위한 리팩토링 가이드를 제공합니다. 컴포넌트 구조, 타입 정의, 성능 최적화, 코드 품질 개선에 대한 구체적인 방법을 다룹니다.

## 1. 컴포넌트 구조 최적화

### 1.1 컴포넌트 분리 원칙

#### 서버/클라이언트 컴포넌트 분리
```typescript
// ✅ 좋은 예: 서버 컴포넌트 (기본값)
// src/components/blog-post-card.tsx
export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold">{post.title}</h2>
      <p className="text-gray-600">{post.excerpt}</p>
      <time className="text-sm text-gray-500">{post.date}</time>
    </article>
  );
}

// ✅ 좋은 예: 클라이언트 컴포넌트 (인터랙션 필요시)
// src/components/search-box.tsx
'use client';

import { useState } from 'react';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="검색..."
      className="w-full px-4 py-2 border rounded-lg"
    />
  );
}
```

#### 컴포넌트 계층 구조
```
src/components/
├── ui/                    # 기본 UI 컴포넌트
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── index.ts
├── layout/               # 레이아웃 컴포넌트
│   ├── header.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   └── index.ts
├── blog/                 # 블로그 관련 컴포넌트
│   ├── post-card.tsx
│   ├── post-list.tsx
│   ├── post-content.tsx
│   └── index.ts
├── common/               # 공통 컴포넌트
│   ├── loading.tsx
│   ├── error-boundary.tsx
│   └── index.ts
└── index.ts              # 메인 export
```

### 1.2 컴포넌트 최적화 패턴

#### Props 인터페이스 정의
```typescript
// src/types/components.ts
export interface BlogPostCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
  showExcerpt?: boolean;
  showDate?: boolean;
  className?: string;
}

export interface SearchBoxProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  className?: string;
}
```

#### 컴포넌트 최적화
```typescript
// src/components/blog/post-card.tsx
import { memo } from 'react';
import type { BlogPostCardProps } from '@/types/components';

const BlogPostCard = memo(function BlogPostCard({
  post,
  variant = 'default',
  showExcerpt = true,
  showDate = true,
  className = '',
}: BlogPostCardProps) {
  const cardClasses = {
    default: 'p-6 border rounded-lg',
    featured: 'p-8 border-2 border-blue-500 rounded-xl',
    compact: 'p-4 border rounded',
  };

  return (
    <article className={`${cardClasses[variant]} ${className}`}>
      <h2 className="text-xl font-bold">{post.title}</h2>
      {showExcerpt && <p className="text-gray-600">{post.excerpt}</p>}
      {showDate && (
        <time className="text-sm text-gray-500">{post.date}</time>
      )}
    </article>
  );
});

export default BlogPostCard;
```

### 1.3 컴포넌트 재사용성 향상

#### Compound Components 패턴
```typescript
// src/components/ui/card.tsx
import { createContext, useContext, type ReactNode } from 'react';

interface CardContextType {
  variant: 'default' | 'elevated' | 'outlined';
}

const CardContext = createContext<CardContextType>({ variant: 'default' });

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const baseClasses = 'rounded-lg border';
  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-transparent border-2',
  };

  return (
    <CardContext.Provider value={{ variant }}>
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-6 border-b ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

// 사용 예시
<Card variant="elevated">
  <CardHeader>
    <h2>제목</h2>
  </CardHeader>
  <CardContent>
    <p>내용</p>
  </CardContent>
</Card>
```

## 2. 타입 정의 개선

### 2.1 중앙화된 타입 정의

#### 타입 파일 구조
```
src/types/
├── index.ts              # 메인 export
├── api.ts                # API 관련 타입
├── blog.ts               # 블로그 관련 타입
├── components.ts         # 컴포넌트 Props 타입
├── common.ts             # 공통 타입
└── utils.ts              # 유틸리티 타입
```

#### API 타입 정의
```typescript
// src/types/api.ts
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API 함수 타입
export type ApiFunction<TParams = void, TResponse = any> = (
  params: TParams
) => Promise<ApiResponse<TResponse>>;
```

#### 블로그 타입 정의
```typescript
// src/types/blog.ts
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: BlogCategory;
  tags: string[];
  featuredImage?: string;
  readTime: number;
  views: number;
  likes: number;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export type BlogCategory = 'stocks' | 'etf' | 'bonds' | 'funds' | 'analysis';

export interface BlogPostFilters {
  category?: BlogCategory;
  search?: string;
  tags?: string[];
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface BlogPostSort {
  field: 'date' | 'title' | 'views' | 'likes';
  order: 'asc' | 'desc';
}
```

### 2.2 제네릭 타입 활용

#### 유틸리티 타입
```typescript
// src/types/utils.ts
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// 사용 예시
type PartialBlogPost = Optional<BlogPost, 'featuredImage' | 'tags'>;
type RequiredBlogPost = Required<BlogPost, 'title' | 'content'>;
```

#### 조건부 타입
```typescript
// src/types/utils.ts
export type ConditionalProps<T, Condition> = Condition extends true
  ? T & { required: true }
  : T & { required?: false };

export type AsyncComponentProps<T> = {
  data: T;
  loading: boolean;
  error: Error | null;
};

// 사용 예시
type BlogPostWithCondition = ConditionalProps<BlogPost, true>;
type AsyncBlogPost = AsyncComponentProps<BlogPost>;
```

### 2.3 타입 가드 및 검증

#### 타입 가드 함수
```typescript
// src/lib/type-guards.ts
import type { BlogPost, BlogCategory } from '@/types/blog';

export function isBlogPost(obj: any): obj is BlogPost {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.content === 'string'
  );
}

export function isBlogCategory(value: string): value is BlogCategory {
  const categories: BlogCategory[] = ['stocks', 'etf', 'bonds', 'funds', 'analysis'];
  return categories.includes(value as BlogCategory);
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
```

#### Zod 스키마 검증
```typescript
// src/lib/schemas.ts
import { z } from 'zod';

export const BlogPostSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500),
  content: z.string().min(1),
  date: z.string().datetime(),
  author: z.string().min(1),
  category: z.enum(['stocks', 'etf', 'bonds', 'funds', 'analysis']),
  tags: z.array(z.string()),
  featuredImage: z.string().url().optional(),
  readTime: z.number().positive(),
  views: z.number().nonnegative(),
  likes: z.number().nonnegative(),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
  }),
});

export type ValidatedBlogPost = z.infer<typeof BlogPostSchema>;
```

## 3. 성능 최적화 리팩토링

### 3.1 메모이제이션 최적화

#### React.memo 활용
```typescript
// src/components/blog/post-list.tsx
import { memo, useMemo } from 'react';
import type { BlogPost } from '@/types/blog';
import BlogPostCard from './post-card';

interface PostListProps {
  posts: BlogPost[];
  variant?: 'grid' | 'list';
  className?: string;
}

const PostList = memo(function PostList({
  posts,
  variant = 'grid',
  className = '',
}: PostListProps) {
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [posts]);

  const gridClasses = variant === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-6';

  return (
    <div className={`${gridClasses} ${className}`}>
      {sortedPosts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );
});

export default PostList;
```

#### useMemo와 useCallback 최적화
```typescript
// src/hooks/use-blog-posts.ts
import { useMemo, useCallback } from 'react';
import type { BlogPost, BlogPostFilters, BlogPostSort } from '@/types/blog';

export function useBlogPosts(
  posts: BlogPost[],
  filters: BlogPostFilters,
  sort: BlogPostSort
) {
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // 카테고리 필터
    if (filters.category) {
      result = result.filter(post => post.category === filters.category);
    }

    // 검색 필터
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 태그 필터
    if (filters.tags?.length) {
      result = result.filter(post =>
        filters.tags!.some(tag => post.tags.includes(tag))
      );
    }

    return result;
  }, [posts, filters]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (sort.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredPosts, sort]);

  const toggleLike = useCallback(async (postId: string) => {
    // 좋아요 토글 로직
    console.log('Toggle like for post:', postId);
  }, []);

  return {
    posts: sortedPosts,
    totalCount: filteredPosts.length,
    toggleLike,
  };
}
```

### 3.2 코드 스플리팅 최적화

#### 동적 임포트
```typescript
// src/components/lazy-components.tsx
import { Suspense, lazy } from 'react';

// 무거운 컴포넌트들을 동적으로 로드
const BlogPostEditor = lazy(() => import('./blog/post-editor'));
const ImageGallery = lazy(() => import('./common/image-gallery'));
const ChartComponent = lazy(() => import('./common/chart'));

// 로딩 컴포넌트
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}

// 사용 예시
export function LazyBlogPostEditor() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BlogPostEditor />
    </Suspense>
  );
}
```

#### 페이지별 코드 스플리팅
```typescript
// src/app/blog/[slug]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/blog';
import LoadingSpinner from '@/components/common/loading-spinner';

// 무거운 컴포넌트들을 동적으로 로드
const BlogPostContent = lazy(() => import('@/components/blog/post-content'));
const RelatedPosts = lazy(() => import('@/components/blog/related-posts'));
const Comments = lazy(() => import('@/components/blog/comments'));

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
      <Suspense fallback={<LoadingSpinner />}>
        <BlogPostContent post={post} />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <RelatedPosts category={post.category} currentSlug={post.slug} />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Comments postId={post.id} />
      </Suspense>
    </article>
  );
}
```

### 3.3 번들 크기 최적화

#### 트리 쉐이킹 최적화
```typescript
// src/lib/icons.ts
// 아이콘을 개별적으로 임포트하여 번들 크기 최적화
export { 
  HomeIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  // 필요한 아이콘만 임포트
} from 'lucide-react';

// 사용 예시
import { HomeIcon, SearchIcon } from '@/lib/icons';
```

#### 유틸리티 함수 최적화
```typescript
// src/lib/utils.ts
// 필요한 함수만 임포트할 수 있도록 개별 export
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 사용 예시
import { formatDate, truncateText } from '@/lib/utils';
```

## 4. 코드 품질 개선

### 4.1 에러 핸들링 개선

#### 에러 바운더리
```typescript
// src/components/common/error-boundary.tsx
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // 에러 로깅 서비스로 전송
    // logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">오류가 발생했습니다</h2>
          <p className="text-gray-600 mt-2">
            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API 에러 핸들링
```typescript
// src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError('알 수 없는 오류가 발생했습니다', 500);
}

// 사용 예시
try {
  const response = await fetch('/api/blog-posts');
  if (!response.ok) {
    throw new ApiError('블로그 포스트를 불러올 수 없습니다', response.status);
  }
  return await response.json();
} catch (error) {
  const apiError = handleApiError(error);
  console.error('API Error:', apiError);
  throw apiError;
}
```

### 4.2 로깅 및 모니터링

#### 로깅 유틸리티
```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: any, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };

    if (this.isDevelopment) {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    } else {
      // 프로덕션에서는 로깅 서비스로 전송
      this.sendToLoggingService(entry);
    }
  }

  debug(message: string, data?: any, context?: Record<string, any>) {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: any, context?: Record<string, any>) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: Record<string, any>) {
    this.log('warn', message, data, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, error, context);
  }

  private sendToLoggingService(entry: LogEntry) {
    // 로깅 서비스 전송 로직
    console.log('Sending to logging service:', entry);
  }
}

export const logger = new Logger();
```

### 4.3 테스트 가능한 코드 작성

#### 테스트 가능한 컴포넌트
```typescript
// src/components/blog/post-card.test.tsx
import { render, screen } from '@testing-library/react';
import BlogPostCard from './post-card';
import type { BlogPost } from '@/types/blog';

const mockPost: BlogPost = {
  id: '1',
  slug: 'test-post',
  title: '테스트 포스트',
  excerpt: '테스트 포스트 요약',
  content: '테스트 포스트 내용',
  date: '2024-01-01',
  author: '테스트 작성자',
  category: 'stocks',
  tags: ['테스트', '블로그'],
  readTime: 5,
  views: 100,
  likes: 10,
  seo: {
    title: 'SEO 제목',
    description: 'SEO 설명',
    keywords: ['키워드1', '키워드2'],
  },
};

describe('BlogPostCard', () => {
  it('renders post title and excerpt', () => {
    render(<BlogPostCard post={mockPost} />);
    
    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
    expect(screen.getByText('테스트 포스트 요약')).toBeInTheDocument();
  });

  it('hides excerpt when showExcerpt is false', () => {
    render(<BlogPostCard post={mockPost} showExcerpt={false} />);
    
    expect(screen.getByText('테스트 포스트')).toBeInTheDocument();
    expect(screen.queryByText('테스트 포스트 요약')).not.toBeInTheDocument();
  });
});
```

#### 테스트 가능한 훅
```typescript
// src/hooks/use-blog-posts.test.ts
import { renderHook } from '@testing-library/react';
import { useBlogPosts } from './use-blog-posts';
import type { BlogPost } from '@/types/blog';

const mockPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'post-1',
    title: '포스트 1',
    excerpt: '요약 1',
    content: '내용 1',
    date: '2024-01-01',
    author: '작성자 1',
    category: 'stocks',
    tags: ['태그1'],
    readTime: 5,
    views: 100,
    likes: 10,
    seo: { title: '', description: '', keywords: [] },
  },
  // ... 더 많은 mock 데이터
];

describe('useBlogPosts', () => {
  it('filters posts by category', () => {
    const { result } = renderHook(() =>
      useBlogPosts(mockPosts, { category: 'stocks' }, { field: 'date', order: 'desc' })
    );

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].category).toBe('stocks');
  });

  it('sorts posts by date in descending order', () => {
    const { result } = renderHook(() =>
      useBlogPosts(mockPosts, {}, { field: 'date', order: 'desc' })
    );

    const dates = result.current.posts.map(post => post.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });
});
```

## 5. 리팩토링 체크리스트

### 5.1 컴포넌트 구조
- [ ] 서버/클라이언트 컴포넌트 적절히 분리
- [ ] 컴포넌트 계층 구조 최적화
- [ ] Props 인터페이스 명확히 정의
- [ ] 재사용 가능한 컴포넌트 패턴 적용

### 5.2 타입 정의
- [ ] 중앙화된 타입 정의 구조 구축
- [ ] 제네릭 타입 적절히 활용
- [ ] 타입 가드 및 검증 로직 구현
- [ ] Zod 스키마 검증 적용

### 5.3 성능 최적화
- [ ] React.memo 적절히 활용
- [ ] useMemo, useCallback 최적화
- [ ] 코드 스플리팅 구현
- [ ] 번들 크기 최적화

### 5.4 코드 품질
- [ ] 에러 핸들링 개선
- [ ] 로깅 및 모니터링 구현
- [ ] 테스트 가능한 코드 작성
- [ ] 코드 가독성 향상

## 결론

이 리팩토링 가이드를 통해 Next.js 애플리케이션의 성능, 유지보수성, 확장성을 크게 향상시킬 수 있습니다. 각 단계를 체계적으로 적용하고, 지속적인 모니터링을 통해 개선 효과를 측정하세요. 