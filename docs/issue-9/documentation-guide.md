# 주석 및 문서화 개선 가이드

## 개요

이 문서는 Next.js 15 + App Router 기반 블로그 애플리케이션의 코드 주석, API 문서화, 컴포넌트 문서화, README 파일 업데이트에 대한 가이드를 제공합니다.

## 1. 코드 주석 작성 가이드

### 1.1 JSDoc 주석 표준

#### 함수 주석
```typescript
/**
 * 블로그 포스트를 가져오는 함수
 * @param slug - 블로그 포스트의 고유 식별자
 * @param options - 추가 옵션 (선택사항)
 * @returns 블로그 포스트 데이터 또는 null
 * @throws {Error} 포스트를 찾을 수 없는 경우
 * @example
 * ```typescript
 * const post = await getBlogPost('my-post-slug');
 * if (post) {
 *   console.log(post.title);
 * }
 * ```
 */
export async function getBlogPost(
  slug: string,
  options?: { includeContent?: boolean }
): Promise<BlogPost | null> {
  // 구현 로직
}
```

#### 클래스 주석
```typescript
/**
 * 블로그 포스트 관리를 위한 클래스
 * 
 * @description
 * 이 클래스는 블로그 포스트의 CRUD 작업을 처리합니다.
 * 데이터베이스 연결과 캐싱을 자동으로 관리합니다.
 * 
 * @example
 * ```typescript
 * const blogManager = new BlogPostManager();
 * const posts = await blogManager.getAllPosts();
 * ```
 */
export class BlogPostManager {
  private cache = new Map<string, BlogPost>();

  /**
   * 모든 블로그 포스트를 가져옵니다
   * @param filters - 필터링 옵션
   * @returns 블로그 포스트 배열
   */
  async getAllPosts(filters?: BlogPostFilters): Promise<BlogPost[]> {
    // 구현 로직
  }
}
```

#### 인터페이스 주석
```typescript
/**
 * 블로그 포스트 데이터 구조
 * 
 * @description
 * 블로그 포스트의 모든 필수 및 선택적 속성을 정의합니다.
 * SEO 메타데이터와 사용자 상호작용 데이터를 포함합니다.
 */
export interface BlogPost {
  /** 고유 식별자 (UUID) */
  id: string;
  
  /** URL 친화적인 슬러그 */
  slug: string;
  
  /** 포스트 제목 (최대 200자) */
  title: string;
  
  /** 포스트 요약 (최대 500자) */
  excerpt: string;
  
  /** 포스트 본문 내용 (마크다운 형식) */
  content: string;
  
  /** 발행 날짜 (ISO 8601 형식) */
  date: string;
  
  /** 작성자 이름 */
  author: string;
  
  /** 포스트 카테고리 */
  category: BlogCategory;
  
  /** 관련 태그 배열 */
  tags: string[];
  
  /** 대표 이미지 URL (선택사항) */
  featuredImage?: string;
  
  /** 예상 읽기 시간 (분) */
  readTime: number;
  
  /** 조회수 */
  views: number;
  
  /** 좋아요 수 */
  likes: number;
  
  /** SEO 메타데이터 */
  seo: {
    /** SEO 제목 */
    title: string;
    /** 메타 설명 */
    description: string;
    /** 키워드 배열 */
    keywords: string[];
  };
}
```

### 1.2 인라인 주석 가이드

#### 복잡한 로직 설명
```typescript
export function calculateReadingTime(content: string): number {
  // 평균 읽기 속도: 분당 200단어
  const wordsPerMinute = 200;
  
  // 마크다운 태그 제거 후 단어 수 계산
  const plainText = content.replace(/[#*`~\[\]()]/g, '');
  const wordCount = plainText.split(/\s+/).length;
  
  // 읽기 시간 계산 (최소 1분)
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  
  return readingTime;
}
```

#### 성능 최적화 주석
```typescript
export function useBlogPosts(posts: BlogPost[], filters: BlogPostFilters) {
  // 메모이제이션: 필터가 변경될 때만 재계산
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // 카테고리 필터 적용
    if (filters.category) {
      result = result.filter(post => post.category === filters.category);
    }

    // 검색 필터 적용 (대소문자 구분 없음)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [posts, filters]); // 의존성 배열: posts나 filters가 변경될 때만 재계산

  return filteredPosts;
}
```

## 2. API 문서화

### 2.1 API 엔드포인트 문서화

#### API 라우트 주석
```typescript
/**
 * 블로그 포스트 목록 API
 * 
 * @route GET /api/blog-posts
 * @description 블로그 포스트 목록을 가져옵니다. 필터링, 검색, 정렬 기능을 지원합니다.
 * 
 * @query {string} [category] - 카테고리별 필터링
 * @query {string} [search] - 제목/내용 검색
 * @query {string} [tags] - 태그별 필터링 (쉼표로 구분)
 * @query {number} [page=1] - 페이지 번호
 * @query {number} [limit=10] - 페이지당 항목 수
 * @query {string} [sort=date] - 정렬 필드 (date, title, views, likes)
 * @query {string} [order=desc] - 정렬 순서 (asc, desc)
 * 
 * @returns {ApiResponse<PaginatedResponse<BlogPost>>} 블로그 포스트 목록
 * 
 * @example
 * ```bash
 * # 모든 포스트 가져오기
 * GET /api/blog-posts
 * 
 * # 주식 카테고리 포스트만 가져오기
 * GET /api/blog-posts?category=stocks
 * 
 * # 검색 기능 사용
 * GET /api/blog-posts?search=투자&page=1&limit=5
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const category = searchParams.get('category') as BlogCategory | null;
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',') || [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'date';
    const order = searchParams.get('order') || 'desc';

    // 데이터베이스에서 포스트 가져오기
    const posts = await getBlogPosts({
      category,
      search,
      tags,
      page,
      limit,
      sort,
      order,
    });

    return NextResponse.json({
      success: true,
      data: posts,
      message: '블로그 포스트를 성공적으로 가져왔습니다.',
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: '블로그 포스트를 가져오는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### 2.2 API 응답 타입 문서화

```typescript
/**
 * API 응답 기본 구조
 * @template T - 응답 데이터 타입
 */
export interface ApiResponse<T = any> {
  /** 요청 성공 여부 */
  success: boolean;
  
  /** 응답 데이터 */
  data?: T;
  
  /** 응답 메시지 */
  message: string;
  
  /** 오류 정보 (실패 시) */
  error?: string;
  
  /** 타임스탬프 */
  timestamp: string;
}

/**
 * 페이지네이션 응답 구조
 * @template T - 데이터 항목 타입
 */
export interface PaginatedResponse<T> {
  /** 데이터 배열 */
  data: T[];
  
  /** 페이지네이션 정보 */
  pagination: {
    /** 현재 페이지 */
    page: number;
    
    /** 페이지당 항목 수 */
    limit: number;
    
    /** 전체 항목 수 */
    total: number;
    
    /** 전체 페이지 수 */
    totalPages: number;
    
    /** 다음 페이지 존재 여부 */
    hasNext: boolean;
    
    /** 이전 페이지 존재 여부 */
    hasPrev: boolean;
  };
}
```

## 3. 컴포넌트 문서화

### 3.1 컴포넌트 Props 문서화

```typescript
/**
 * 블로그 포스트 카드 컴포넌트
 * 
 * @description
 * 블로그 포스트를 카드 형태로 표시하는 컴포넌트입니다.
 * 다양한 변형(variant)과 옵션을 지원하여 재사용성을 높였습니다.
 * 
 * @example
 * ```tsx
 * // 기본 사용법
 * <BlogPostCard post={post} />
 * 
 * // 피처드 포스트로 표시
 * <BlogPostCard 
 *   post={post} 
 *   variant="featured" 
 *   showExcerpt={false} 
 * />
 * 
 * // 컴팩트 모드
 * <BlogPostCard 
 *   post={post} 
 *   variant="compact" 
 *   className="hover:shadow-lg" 
 * />
 * ```
 */
export interface BlogPostCardProps {
  /** 표시할 블로그 포스트 데이터 */
  post: BlogPost;
  
  /** 카드 스타일 변형 */
  variant?: 'default' | 'featured' | 'compact';
  
  /** 요약 표시 여부 */
  showExcerpt?: boolean;
  
  /** 날짜 표시 여부 */
  showDate?: boolean;
  
  /** 추가 CSS 클래스 */
  className?: string;
  
  /** 클릭 이벤트 핸들러 */
  onClick?: (post: BlogPost) => void;
}

export default function BlogPostCard({
  post,
  variant = 'default',
  showExcerpt = true,
  showDate = true,
  className = '',
  onClick,
}: BlogPostCardProps) {
  // 컴포넌트 구현
}
```

### 3.2 컴포넌트 사용 예시

```typescript
/**
 * 검색 박스 컴포넌트
 * 
 * @description
 * 실시간 검색 기능을 제공하는 컴포넌트입니다.
 * 디바운싱을 통해 성능을 최적화했습니다.
 * 
 * @features
 * - 실시간 검색
 * - 디바운싱 (기본 300ms)
 * - 키보드 네비게이션 지원
 * - 접근성 고려
 * 
 * @example
 * ```tsx
 * // 기본 사용법
 * <SearchBox onSearch={handleSearch} />
 * 
 * // 커스텀 설정
 * <SearchBox
 *   placeholder="블로그 포스트 검색..."
 *   debounceMs={500}
 *   onSearch={(query) => console.log('Search:', query)}
 *   className="w-full max-w-md"
 * />
 * ```
 */
export interface SearchBoxProps {
  /** 검색어 입력 시 호출되는 콜백 */
  onSearch?: (query: string) => void;
  
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  
  /** 디바운스 지연 시간 (ms) */
  debounceMs?: number;
  
  /** 추가 CSS 클래스 */
  className?: string;
}
```

## 4. README 파일 업데이트

### 4.1 프로젝트 README.md

```markdown
# 투자 인사이트 블로그

> Next.js 15 + App Router 기반의 현대적인 블로그 플랫폼

## 🚀 주요 기능

- **SSR/SSG 지원**: SEO 최적화를 위한 서버사이드 렌더링
- **성능 최적화**: Core Web Vitals 95점 이상 달성
- **접근성**: WCAG 2.1 AA 준수
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- **실시간 검색**: 디바운싱을 통한 성능 최적화
- **다크 모드**: 사용자 선호도 기반 테마 전환

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Query (TanStack Query)

### Backend
- **Runtime**: Node.js 20
- **Database**: PostgreSQL (Drizzle ORM)
- **Authentication**: Passport.js
- **API**: RESTful API

### Development
- **Build Tool**: Next.js (Turbopack)
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **Performance**: Lighthouse CI

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 9.0.0 이상
- PostgreSQL 14.0 이상

### 설치
```bash
# 저장소 클론
git clone https://github.com/your-username/stock.advenoh.pe.kr-replit.git
cd stock.advenoh.pe.kr-replit

# 의존성 설치
npm install
cd client_nextjs && npm install && cd ..

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 값들을 설정하세요
```

### 개발 서버 실행
```bash
# 개발 모드
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 프로덕션 빌드
```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 📁 프로젝트 구조

```
├── client_nextjs/          # Next.js 애플리케이션
│   ├── src/
│   │   ├── app/           # App Router 페이지
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── lib/          # 유틸리티 함수
│   │   ├── hooks/        # 커스텀 훅
│   │   └── types/        # TypeScript 타입 정의
│   ├── public/           # 정적 자산
│   └── contents/         # 블로그 콘텐츠
├── server/               # Express.js 서버
├── shared/              # 공유 타입 및 유틸리티
├── docs/               # 프로젝트 문서
└── attached_assets/    # 첨부 파일
```

## 🔧 주요 스크립트

```bash
# 개발
npm run dev              # 개발 서버 실행
npm run dev:nextjs       # Next.js 개발 서버만 실행

# 빌드
npm run build            # 프로덕션 빌드
npm run build:nextjs     # Next.js 빌드

# 테스트
npm run test             # 단위 테스트 실행
npm run test:e2e         # E2E 테스트 실행
npm run test:coverage    # 커버리지 포함 테스트

# 코드 품질
npm run lint             # ESLint 검사
npm run lint:fix         # ESLint 자동 수정
npm run type-check       # TypeScript 타입 검사

# 성능
npm run lighthouse       # Lighthouse 성능 테스트
npm run bundle-analyze   # 번들 크기 분석
```

## 📊 성능 지표

### Core Web Vitals
- **LCP**: 1.8초 (목표: < 2.5초)
- **FID**: 12ms (목표: < 100ms)
- **CLS**: 0.05 (목표: < 0.1)

### Lighthouse 점수
- **Performance**: 95점
- **Accessibility**: 98점
- **Best Practices**: 100점
- **SEO**: 100점

## 🔍 API 문서

### 블로그 포스트 API

#### GET /api/blog-posts
블로그 포스트 목록을 가져옵니다.

**쿼리 파라미터:**
- `category` (선택): 카테고리 필터
- `search` (선택): 검색어
- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지당 항목 수 (기본값: 10)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/your-username/stock.advenoh.pe.kr-replit](https://github.com/your-username/stock.advenoh.pe.kr-replit)

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - 훌륭한 React 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크
- [Radix UI](https://www.radix-ui.com/) - 접근성을 고려한 UI 컴포넌트
```

## 5. 문서화 체크리스트

### 5.1 코드 주석
- [ ] JSDoc 주석 표준 준수
- [ ] 함수/클래스/인터페이스 주석 작성
- [ ] 복잡한 로직에 인라인 주석 추가
- [ ] 성능 최적화 주석 작성

### 5.2 API 문서화
- [ ] API 엔드포인트 주석 작성
- [ ] 요청/응답 타입 문서화
- [ ] 사용 예시 제공
- [ ] 오류 처리 문서화

### 5.3 컴포넌트 문서화
- [ ] Props 인터페이스 문서화
- [ ] 사용 예시 제공
- [ ] 기능 설명 추가
- [ ] 접근성 정보 포함

### 5.4 README 파일
- [ ] 프로젝트 개요 작성
- [ ] 설치 및 실행 가이드
- [ ] 프로젝트 구조 설명
- [ ] API 문서 링크
- [ ] 기여 가이드

## 결론

이 문서화 가이드를 통해 프로젝트의 유지보수성과 개발자 경험을 크게 향상시킬 수 있습니다. 일관된 주석 스타일과 포괄적인 문서화를 통해 새로운 개발자도 쉽게 프로젝트에 참여할 수 있습니다. 