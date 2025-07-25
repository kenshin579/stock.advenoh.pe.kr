
# Next.js SSR 전환 작업 TODO

## Phase 1: 프로젝트 설정 (1주) 🚀

### 환경 설정
- [ ] Next.js 프로젝트 초기화
  - [ ] `npx create-next-app@latest client_nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [ ] 기존 client 디렉토리 백업 (`cp -r client client_backup`)
  - [ ] next.config.js 설정 (static export, trailingSlash, images unoptimized)
- [ ] 필수 패키지 설치
  - [ ] gray-matter, remark, remark-html, remark-gfm
  - [ ] rehype-highlight, unified
  - [ ] @next/font 설정
- [ ] 기본 디렉토리 구조 생성
  - [ ] app/ 디렉토리 구조 생성
  - [ ] components/, lib/, hooks/ 디렉토리 이동

### 기존 컴포넌트 이동
- [ ] 컴포넌트 Next.js 호환 변경
  - [ ] `cp -r client_backup/src/components client_nextjs/src/`
  - [ ] `cp -r client_backup/src/lib client_nextjs/src/`
  - [ ] `cp -r client_backup/src/hooks client_nextjs/src/`
- [ ] Wouter → Next.js Link 컴포넌트 변경
  - [ ] header.tsx 라우팅 업데이트
  - [ ] blog-post-card.tsx 링크 수정
  - [ ] breadcrumb.tsx 링크 수정
- [ ] 이미지 컴포넌트 업데이트
  - [ ] lazy-image.tsx → optimized-image.tsx
  - [ ] Next.js Image 컴포넌트 활용

## Phase 2: 페이지 마이그레이션 (2주) 📄

### App Router 구조 구현
- [ ] 루트 레이아웃 구현 (`app/layout.tsx`)
  - [ ] 메타데이터 설정
  - [ ] ThemeProvider, Header, Footer 통합
  - [ ] 글로벌 스타일 적용
- [ ] 홈페이지 SSG 구현 (`app/page.tsx`)
  - [ ] getAllBlogPosts, getAllCategories 함수 구현
  - [ ] Hero, BlogPostCard, CategoryFilter 컴포넌트 통합
  - [ ] 구조화된 데이터 추가
- [ ] 블로그 포스트 페이지 (`app/blog/[slug]/page.tsx`)
  - [ ] generateStaticParams 구현
  - [ ] generateMetadata 구현 (SEO 최적화)
  - [ ] MarkdownRenderer, TableOfContents, RelatedPosts 통합
  - [ ] Breadcrumb 네비게이션 추가
- [ ] 시리즈 페이지 구현
  - [ ] 시리즈 목록 페이지 (`app/series/page.tsx`)
  - [ ] 시리즈 상세 페이지 (`app/series/[seriesName]/page.tsx`)
  - [ ] generateStaticParams 및 generateMetadata 구현
- [ ] 404 페이지 구현 (`app/not-found.tsx`)

### 데이터 레이어 구현
- [ ] 블로그 데이터 처리 라이브러리 (`lib/blog.ts`)
  - [ ] getAllBlogPosts 함수 (마크다운 파싱)
  - [ ] getBlogPost 함수 (개별 포스트)
  - [ ] getAllCategories, getAllSeries 함수
  - [ ] parseMarkdownFile, generateSlugFromPath 유틸리티
  - [ ] inferCategoriesFromPath, extractExcerpt 함수
- [ ] 콘텐츠 임포터 로직 이동
  - [ ] contents/ 디렉토리 연결
  - [ ] attached_assets/ → public/ 이미지 이동
  - [ ] 시리즈 메타데이터 처리

## Phase 3: API 및 데이터 레이어 (1주) 🔌

### API Routes 구현
- [ ] 블로그 포스트 API (`app/api/blog-posts/route.ts`)
- [ ] 카테고리 API (`app/api/categories/route.ts`)  
- [ ] 시리즈 API (`app/api/series/route.ts`)
- [ ] 사이트맵 API (`app/api/sitemap.xml/route.ts`)
  - [ ] 홈페이지, 시리즈 페이지 URL 포함
  - [ ] 블로그 포스트 URL 동적 생성
  - [ ] lastmod, changefreq, priority 설정
- [ ] robots.txt API (`app/api/robots.txt/route.ts`)
  - [ ] 사이트맵 링크 포함
  - [ ] 크롤 지연 및 차단 디렉토리 설정

### 정적 데이터 생성
- [ ] 빌드 타임 정적 데이터 생성
  - [ ] generateStaticData.ts 스크립트 Next.js용 변경
  - [ ] public/api/ 디렉토리 JSON 파일 생성
  - [ ] 시리즈 데이터 포함

## Phase 4: SEO 및 최적화 (1주) 🔍

### SEO 컴포넌트 구현
- [ ] 구조화된 데이터 라이브러리 (`lib/structured-data.ts`)
  - [ ] generateBlogPostStructuredData 함수
  - [ ] generateWebsiteStructuredData 함수
  - [ ] Organization, Person 스키마 구현
- [ ] 메타 태그 서버 렌더링
  - [ ] 각 페이지별 generateMetadata 함수
  - [ ] Open Graph, Twitter Card 메타데이터
  - [ ] 동적 타이틀, 설명, 키워드 생성

### 이미지 최적화
- [ ] Next.js Image 컴포넌트 활용
  - [ ] OptimizedImage 컴포넌트 구현
  - [ ] 블러 플레이스홀더, 에러 상태 처리
  - [ ] WebP 형식 지원 확인
- [ ] 이미지 사이트맵 구현
  - [ ] 마크다운 이미지 추출 유틸리티
  - [ ] `/image-sitemap.xml` API 엔드포인트

### 성능 최적화
- [ ] Core Web Vitals 개선
  - [ ] 코드 스플리팅 확인
  - [ ] 번들 사이즈 최적화
  - [ ] 이미지 lazy loading 구현
- [ ] 빌드 최적화
  - [ ] Tree shaking 확인
  - [ ] Static export 설정

## Phase 5: Static 배포 설정 및 테스트 (1주) 🚀

### Replit Static 배포 구성
- [ ] Next.js export 설정
  - [ ] `next export` 명령어 설정
  - [ ] out/ 디렉토리 생성 확인
  - [ ] 정적 파일 최적화
- [ ] replit.toml 업데이트
  - [ ] `deploymentTarget = "static"`
  - [ ] `build = ["npm run build"]`
  - [ ] `publicDir = "out"`
- [ ] 빌드 스크립트 생성
  - [ ] build-static.sh 스크립트
  - [ ] package.json 스크립트 업데이트

### 테스트 및 검증
- [ ] 기능 테스트
  - [ ] 홈페이지 로딩 및 렌더링
  - [ ] 블로그 포스트 페이지 접근
  - [ ] 시리즈 페이지 기능
  - [ ] 검색 기능 (클라이언트 사이드)
  - [ ] 카테고리 필터링
  - [ ] 반응형 디자인
- [ ] SEO 검증
  - [ ] 메타 태그 생성 확인
  - [ ] 구조화된 데이터 검증
  - [ ] 사이트맵 및 robots.txt 확인
  - [ ] 이미지 사이트맵 검증
- [ ] 성능 테스트
  - [ ] Lighthouse 점수 확인 (목표: 90점 이상)
  - [ ] Core Web Vitals 측정
  - [ ] 페이지 로딩 속도 개선 확인

## 데이터 마이그레이션 및 호환성 🔄

### 기존 데이터 보존
- [ ] 마크다운 파일 구조 유지
  - [ ] contents/ 디렉토리 그대로 활용
  - [ ] 90개 블로그 포스트 모든 데이터 보존
  - [ ] 6개 시리즈 구조 유지
- [ ] 이미지 파일 이동
  - [ ] attached_assets/ → public/ 디렉토리
  - [ ] 이미지 경로 자동 업데이트
- [ ] URL 구조 호환성
  - [ ] 기존 `/blog/:slug` 구조 유지
  - [ ] `/series` 및 `/series/:name` 구조 유지
  - [ ] SEO를 위한 URL 리디렉션 설정

### 기능 호환성
- [ ] 기존 기능 100% 유지
  - [ ] Layout, Theme, Dark/Light Toggle
  - [ ] Series Navigation, Search Bar
  - [ ] 관련 포스트 추천 시스템
  - [ ] 브레드크럼 네비게이션
  - [ ] 태그 클라우드 기능
- [ ] 스타일링 호환성
  - [ ] Tailwind CSS 설정 그대로 유지
  - [ ] shadcn/ui 컴포넌트 호환성
  - [ ] 반응형 디자인 유지

## 리스크 관리 및 대응 ⚠️

### 기술적 리스크
- [ ] 컴포넌트 호환성 확인
  - [ ] Wouter → Next.js Router 변경 사항
  - [ ] TanStack Query → getStaticProps 변경
  - [ ] useEffect 기반 SEO → Metadata API 변경
- [ ] 성능 리스크 대응
  - [ ] 빌드 시간 최적화 (목표: 5분 이내)
  - [ ] 정적 생성 시간 모니터링
  - [ ] 번들 사이즈 증가 확인

### 배포 리스크
- [ ] Static 배포 제약 확인
  - [ ] 서버 사이드 기능 제한 대응
  - [ ] API Routes 정적 파일 생성 확인
  - [ ] 이미지 최적화 제한 대응
- [ ] SEO 리스크 관리
  - [ ] 기존 URL 구조 유지
  - [ ] 검색 엔진 재인덱싱 준비
  - [ ] 메타 태그 호환성 확인

## 성공 지표 및 검증 📊

### 성능 지표 달성
- [ ] Lighthouse 점수: 90점 이상
- [ ] LCP: 2.5초 이하
- [ ] FID: 100ms 이하
- [ ] CLS: 0.1 이하
- [ ] 페이지 로딩 속도: 50% 이상 개선

### SEO 지표 확인
- [ ] Google PageSpeed Insights: 90점 이상
- [ ] 메타 태그 크롤러 즉시 인식
- [ ] 구조화된 데이터 유효성 검증
- [ ] 사이트맵 제출 및 색인 확인

### 개발 지표 달성
- [ ] 빌드 시간: 5분 이내
- [ ] 개발 서버 시작: 30초 이내
- [ ] 기존 기능 100% 유지
- [ ] 코드 호환성 확보

## 마이그레이션 완료 후 작업 ✅

### 모니터링 설정
- [ ] Google Search Console 설정
  - [ ] 새 사이트맵 제출
  - [ ] 색인 상태 모니터링
  - [ ] Core Web Vitals 추적
- [ ] 성능 모니터링
  - [ ] PageSpeed Insights 정기 확인
  - [ ] 사용자 경험 지표 추적

### 문서화 및 정리
- [ ] 마이그레이션 결과 문서화
- [ ] 새로운 개발 가이드 작성
- [ ] 배포 프로세스 업데이트
- [ ] 기존 client_backup 디렉토리 정리

---

**예상 소요 시간**: 총 6주
**주요 개선 효과**: SEO 최적화, 성능 향상 (50% 이상), 비용 절감 (Static 배포)
**위험도**: 중간 (기존 기능 100% 유지하면서 아키텍처 업그레이드)
