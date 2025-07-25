
# Next.js SSR 전환 작업 TODO

## Phase 1: 프로젝트 설정 (1주) 🚀

### 환경 설정
- [x] Next.js 프로젝트 초기화
  - [x] `npx create-next-app@latest client_nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [x] 기존 client 디렉토리 백업 (`cp -r client client_backup`)
  - [x] next.config.ts 설정 (static export, trailingSlash, images unoptimized)
- [x] 필수 패키지 설치
  - [x] gray-matter, remark, remark-html, remark-gfm
  - [x] rehype-highlight, unified
  - [x] @next/font 설정
- [x] 기본 디렉토리 구조 생성
  - [x] app/ 디렉토리 구조 생성
  - [x] components/, lib/, hooks/ 디렉토리 이동

### 기존 컴포넌트 이동
- [x] 컴포넌트 Next.js 호환 변경
  - [x] `cp -r client_backup/src/components client_nextjs/src/`
  - [x] `cp -r client_backup/src/lib client_nextjs/src/`
  - [x] `cp -r client_backup/src/hooks client_nextjs/src/`
- [x] Wouter → Next.js Link 컴포넌트 변경
  - [x] header.tsx 라우팅 업데이트
  - [x] blog-post-card.tsx 링크 수정
  - [x] breadcrumb.tsx 링크 수정
- [x] 이미지 컴포넌트 업데이트
  - [x] lazy-image.tsx 유지 (정적 배포용)
  - [x] 'use client' 지시어 추가

## Phase 2: 페이지 마이그레이션 (2주) 📄

### App Router 구조 구현
- [x] 루트 레이아웃 구현 (`app/layout.tsx`)
  - [x] 메타데이터 설정
  - [x] ThemeProvider, Header, Footer 통합
  - [x] 글로벌 스타일 적용
- [x] 홈페이지 SSG 구현 (`app/page.tsx`)
  - [x] getAllBlogPosts, getAllCategories 함수 구현
  - [x] Hero, BlogPostCard, CategoryFilter 컴포넌트 통합
  - [x] 구조화된 데이터 추가
- [x] 블로그 포스트 페이지 (`app/blog/[slug]/page.tsx`)
  - [x] generateStaticParams 구현
  - [x] generateMetadata 구현 (SEO 최적화)
  - [x] MarkdownRenderer, TableOfContents, RelatedPosts 통합
  - [x] Breadcrumb 네비게이션 추가
  - [x] Next.js 15 params Promise 타입 적용
- [x] 시리즈 페이지 구현
  - [x] 시리즈 목록 페이지 (`app/series/page.tsx`)
  - [x] 시리즈 상세 페이지 (`app/series/[seriesName]/page.tsx`)
  - [x] generateStaticParams 및 generateMetadata 구현
  - [x] Next.js 15 params Promise 타입 적용
- [x] 404 페이지 구현 (`app/not-found.tsx`)

### 데이터 레이어 구현
- [x] 블로그 데이터 처리 라이브러리 (`lib/blog.ts`)
  - [x] getAllBlogPosts 함수 (마크다운 파싱)
  - [x] getBlogPost 함수 (개별 포스트)
  - [x] getAllCategories, getAllSeries 함수
  - [x] parseMarkdownFile, generateSlugFromPath 유틸리티
  - [x] inferCategoriesFromPath, extractExcerpt 함수
  - [x] getRelatedPosts 함수 구현
- [x] 콘텐츠 임포터 로직 이동
  - [x] contents/ 디렉토리 연결
  - [x] attached_assets/ → public/ 이미지 이동
  - [x] 시리즈 메타데이터 처리

## Phase 3: API 및 데이터 레이어 (1주) 🔌

### API Routes 구현
- [x] 블로그 포스트 API (`app/api/blog-posts/route.ts`)
- [x] 카테고리 API (`app/api/categories/route.ts`)  
- [x] 시리즈 API (`app/api/series/route.ts`)
- [x] 사이트맵 API (`app/api/sitemap.xml/route.ts`)
  - [x] 홈페이지, 시리즈 페이지 URL 포함
  - [x] 블로그 포스트 URL 동적 생성
  - [x] lastmod, changefreq, priority 설정
- [x] robots.txt API (`app/api/robots.txt/route.ts`)
  - [x] 사이트맵 링크 포함
  - [x] 크롤 지연 및 차단 디렉토리 설정

### 정적 데이터 생성
- [x] 빌드 타임 정적 데이터 생성
  - [x] generateStaticData.ts 스크립트 Next.js용 변경
  - [x] public/api/ 디렉토리 JSON 파일 생성
  - [x] 시리즈 데이터 포함

## Phase 4: SEO 및 최적화 (1주) 🔍

### SEO 컴포넌트 구현
- [x] 구조화된 데이터 라이브러리 (`lib/structured-data.ts`)
  - [x] generateBlogPostStructuredData 함수
  - [x] generateWebsiteStructuredData 함수
  - [x] Organization, Person 스키마 구현
- [x] 메타 태그 서버 렌더링
  - [x] 각 페이지별 generateMetadata 함수
  - [x] Open Graph, Twitter Card 메타데이터
  - [x] 동적 타이틀, 설명, 키워드 생성

### 이미지 최적화
- [x] 기존 LazyImage 컴포넌트 유지 (정적 배포 호환)
  - [x] 블러 플레이스홀더, 에러 상태 처리
  - [x] WebP 형식 지원 확인
- [x] 이미지 사이트맵 구현
  - [x] 마크다운 이미지 추출 유틸리티
  - [x] `/image-sitemap.xml` API 엔드포인트

### 성능 최적화
- [x] Core Web Vitals 개선
  - [x] 코드 스플리팅 확인
  - [x] 번들 사이즈 최적화
  - [x] 이미지 lazy loading 구현
- [x] 빌드 최적화
  - [x] Tree shaking 확인
  - [x] Static export 설정

## Phase 5: Static 배포 설정 및 테스트 (1주) 🚀

### Replit Static 배포 구성
- [x] Next.js export 설정
  - [x] `output: 'export'` 설정
  - [x] out/ 디렉토리 생성 확인
  - [x] 정적 파일 최적화
- [x] next.config.ts 설정
  - [x] `output: 'export'` 모드
  - [x] `trailingSlash: true`
  - [x] `images: { unoptimized: true }`
- [x] 빌드 스크립트 생성
  - [x] package.json 스크립트 업데이트
  - [x] ESLint 경고 무시 설정

### 테스트 및 검증
- [x] 기능 테스트
  - [x] 홈페이지 로딩 및 렌더링
  - [x] 블로그 포스트 페이지 접근
  - [x] 시리즈 페이지 기능
  - [ ] 검색 기능 (클라이언트 사이드) - 추후 구현
  - [x] 카테고리 필터링 (기본 구조)
  - [x] 반응형 디자인
- [x] SEO 검증
  - [x] 메타 태그 생성 확인
  - [x] 구조화된 데이터 검증
  - [x] 사이트맵 및 robots.txt 확인
  - [x] 이미지 사이트맵 검증
- [x] 빌드 테스트
  - [x] Next.js 빌드 성공 확인
  - [x] Static export 작동 확인
  - [ ] Lighthouse 점수 확인 (목표: 90점 이상) - 배포 후 측정
  - [ ] Core Web Vitals 측정 - 배포 후 측정

## 데이터 마이그레이션 및 호환성 🔄

### 기존 데이터 보존
- [x] 마크다운 파일 구조 유지
  - [x] contents/ 디렉토리 그대로 활용
  - [x] 90개 블로그 포스트 모든 데이터 보존
  - [x] 6개 시리즈 구조 유지
- [x] 이미지 파일 이동
  - [x] attached_assets/ → public/ 디렉토리
  - [x] 이미지 경로 자동 업데이트
- [x] URL 구조 호환성
  - [x] 기존 `/blog/:slug` 구조 유지
  - [x] `/series` 및 `/series/:name` 구조 유지
  - [x] 정적 라우팅 구조 구현

### 기능 호환성
- [x] 기존 기능 90% 유지
  - [x] Layout, Theme, Dark/Light Toggle
  - [x] Series Navigation
  - [x] 관련 포스트 추천 시스템
  - [x] 브레드크럼 네비게이션
  - [x] 태그 클라우드 기능
  - [ ] Search Bar (Phase 3에서 구현 예정)
- [x] 스타일링 호환성
  - [x] Tailwind CSS 설정 그대로 유지
  - [x] shadcn/ui 컴포넌트 호환성
  - [x] 반응형 디자인 유지

## 리스크 관리 및 대응 ⚠️

### 기술적 리스크
- [x] 컴포넌트 호환성 확인
  - [x] Wouter → Next.js Router 변경 사항
  - [x] TanStack Query → getStaticProps 변경
  - [x] useEffect 기반 SEO → Metadata API 변경
  - [x] Next.js 15 params Promise 타입 대응
- [x] 성능 리스크 대응
  - [x] 빌드 시간 최적화 (목표: 5분 이내)
  - [x] 정적 생성 시간 모니터링
  - [x] 번들 사이즈 증가 확인

### 배포 리스크
- [x] Static 배포 제약 확인
  - [x] 서버 사이드 기능 제한 대응
  - [x] API Routes 정적 파일 생성 확인
  - [x] 이미지 최적화 제한 대응
- [x] SEO 리스크 관리
  - [x] 기존 URL 구조 유지
  - [x] 검색 엔진 재인덱싱 준비
  - [x] 메타 태그 호환성 확인

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

## 현재 진행 상황 (2025년 1월 25일 업데이트)

**✅ Phase 1-2 완료**: Next.js 마이그레이션 성공!
- 전체 아키텍처를 Vite+React+Wouter → Next.js 15 App Router로 완전 변경
- 90개 블로그 포스트 및 6개 시리즈 모든 데이터 보존
- 빌드 성공 및 정적 배포 준비 완료
- SEO 최적화 기본 구조 구현 (generateMetadata, 구조화된 데이터)

**🔄 다음 단계**: Phase 3 - 검색 기능 구현, Lighthouse 성능 측정
**예상 완료율**: 75% 완료

**주요 개선 효과**:
- SEO 최적화: 서버사이드 메타 태그 생성
- 성능 향상: 정적 사이트 생성으로 빠른 로딩
- 유지보수성: Next.js 표준 구조 적용


