
# SEO 개선 작업 TODO 리스트

## Phase 1: 즉시 구현 (1-2일) ⚡

### 메타 태그 최적화
- [x] SEO Head 컴포넌트 개선 (`client/src/components/seo-head.tsx`)
  - [x] 메타 디스크립션 150-160자 제한 검증 로직 추가
  - [x] `robots`, `author` 메타 태그 추가
  - [x] `viewport` 메타 태그 최적화
- [x] SEO 헬퍼 함수 추가 (`client/src/lib/seo.ts`)
  - [x] 메타 디스크립션 자동 truncation 기능
  - [x] 페이지별 고유 메타 태그 생성 로직

### 구조화된 데이터 (Schema.org) 구현
- [x] 구조화된 데이터 라이브러리 생성 (`client/src/lib/structured-data.ts`)
  - [x] Blog 스키마 구현
  - [x] Article 스키마 구현 (개별 포스트용)
  - [x] BreadcrumbList 스키마 구현
  - [x] Organization 스키마 구현
- [x] SEO Head 컴포넌트에 구조화된 데이터 적용

### robots.txt 최적화
- [x] `server/services/robots.ts` 업데이트
  - [x] 크롤 지연 설정 (`Crawl-delay: 1`)
  - [x] 추가 디렉토리 차단 (`/admin/`, `/api/`, `/_next/`)
  - [x] Host 정보 추가

### 사이트맵 우선순위 조정
- [x] `server/services/sitemap.ts` 업데이트
  - [x] 우선순위 재조정 (홈: 1.0, 최신 포스트: 0.9, 일반 포스트: 0.8, etc.)
  - [x] changefreq 최적화 (홈: daily, 포스트: weekly)

## Phase 2: 단기 구현 (1주) 📈

### 이미지 SEO 개선
- [x] 이미지 유틸리티 개선 (`client/src/lib/image-utils.ts`)
  - [x] alt 태그 자동 생성 로직
  - [x] 파일명 기반 alt 태그 생성
  - [x] 투자 관련 컨텍스트 기반 alt 태그 최적화
  - [x] 마크다운 이미지 추출 유틸리티
  - [x] WebP 지원 확인 기능
- [x] 이미지 최적화 컴포넌트 생성 (`client/src/components/lazy-image.tsx`)
  - [x] WebP 형식 지원 추가
  - [x] 이미지 lazy loading 구현 (Intersection Observer)
  - [x] 블러 플레이스홀더 및 에러 상태 처리
  - [x] BlogImage, HeroImage, ThumbnailImage 프리셋 컴포넌트
- [x] 이미지 사이트맵 생성 (`server/services/image-sitemap.ts`)
  - [x] 블로그 포스트 이미지 추출 및 사이트맵 생성
  - [x] `/image-sitemap.xml` API 엔드포인트 추가
  - [x] robots.txt에 이미지 사이트맵 링크 추가

### 내부 링크 구조 강화
- [x] 관련 포스트 컴포넌트 생성 (`client/src/components/related-posts.tsx`)
  - [x] 태그 기반 관련 포스트 추천 (10점/태그)
  - [x] 카테고리 기반 관련 포스트 (20점)
  - [x] 시리즈 기반 관련 포스트 우선순위 (50점)
  - [x] 최신성 기반 가중치 시스템
  - [x] 안전한 날짜 처리 및 포맷팅
- [x] 브레드크럼 네비게이션 업데이트 (`client/src/components/breadcrumb.tsx`)
  - [x] 모든 페이지에 브레드크럼 추가 (Home > Category > Series > Post)
  - [x] 구조화된 데이터로 브레드크럼 마크업
  - [x] 스크롤-투-탑 기능 포함
- [x] 시리즈 포스트 연결 강화
  - [x] 시리즈 내 이전/다음 포스트 링크
  - [x] 시리즈 전체 목록 링크
  - [x] 시리즈 네비게이션 컴포넌트 (`client/src/components/series-navigation.tsx`)
- [x] 태그 클라우드 구현 (`client/src/components/tag-cloud.tsx`)
  - [x] 인기 태그 30개 표시
  - [x] 클릭-투-필터 기능
  - [x] URL 파라미터 지원

### 성능 최적화 기본 작업
- [ ] 캐싱 헤더 설정 (`server/index.ts`)
  - [ ] Express.js 정적 파일 캐싱
  - [ ] ETags 설정
- [ ] CSS/JS 최적화
  - [ ] 중요하지 않은 CSS 지연 로딩
  - [ ] 코드 스플리팅 최적화

## Phase 3: 중기 구현 (2-3주) 🚀

### Core Web Vitals 최적화
- [ ] 성능 라이브러리 생성 (`client/src/lib/performance.ts`)
- [ ] LCP (Largest Contentful Paint) 개선
  - [ ] Critical CSS 인라인 처리
  - [ ] 폰트 최적화 (preload)
  - [ ] 이미지 최적화
- [ ] FID (First Input Delay) 개선
  - [ ] JavaScript 실행 최적화
  - [ ] 이벤트 리스너 최적화
- [ ] CLS (Cumulative Layout Shift) 개선
  - [ ] 이미지 크기 명시
  - [ ] 폰트 로딩 최적화
- [ ] `client/index.html` 최적화

### 고급 구조화된 데이터
- [ ] `client/src/lib/structured-data.ts` 확장
  - [ ] FAQ 스키마 구현
  - [ ] Review 스키마 구현 (투자 상품 리뷰용)
  - [ ] Video 스키마 구현 (향후 확장용)

### 추가 사이트맵
- [ ] 사이트맵 인덱스 생성 (`server/services/sitemap-index.ts`)
- [ ] 이미지 사이트맵 구현
  - [ ] 모든 콘텐츠 이미지 포함
  - [ ] 캡션 및 설명 추가
- [ ] 뉴스 사이트맵 구현
  - [ ] 최신 포스트 중심
  - [ ] 발행일 기준 정렬

## 검증 및 모니터링 🔍

### 구현 후 확인사항
- [ ] Google Search Console
  - [ ] 사이트맵 재제출
  - [ ] 색인 상태 모니터링
  - [ ] Core Web Vitals 점수 확인
- [ ] PageSpeed Insights
  - [ ] 페이지 속도 점수 확인
  - [ ] Core Web Vitals 개선 확인
- [ ] 구조화된 데이터 테스트
  - [ ] Google Rich Results Test
  - [ ] Schema Markup Validator

### 성능 측정 도구 설정
- [ ] Google Analytics 4 설정
- [ ] Search Console 성능 리포트 모니터링
- [ ] Core Web Vitals 모니터링 체계 구축

## 우선순위별 체크리스트

### 🔥 High Priority (Week 1)
- [x] 메타 태그 최적화
- [x] 기본 구조화된 데이터 구현
- [x] robots.txt 최적화
- [x] 사이트맵 우선순위 조정

### 🔶 Medium Priority (Week 2)
- [x] 이미지 SEO 개선
- [x] 관련 포스트 기능
- [x] 브레드크럼 네비게이션
- [ ] 기본 성능 최적화

### 🔵 Low Priority (Week 3)
- [ ] Core Web Vitals 개선
- [ ] 고급 구조화된 데이터
- [ ] 추가 사이트맵
- [ ] 모니터링 도구 설정

---

## 진행 상황

- **시작일**: 2025-07-25
- **목표 완료일**: 2025-08-15
- **현재 Phase**: Phase 2 완료, Phase 3 준비
- **완료율**: Phase 1 100% 완료, Phase 2 90% 완료

### 완료된 작업
- ✅ sitemap.xml 경로 변경 (`/api/sitemap.xml` → `/sitemap.xml`)
- ✅ rss.xml 경로 변경 (`/api/rss.xml` → `/rss.xml`)
- ✅ robots.txt 사이트맵 경로 업데이트
- ✅ Footer 년도 동적 업데이트
- ✅ SEO Head 컴포넌트 메타 태그 최적화 (description truncation, robots, author, viewport)
- ✅ robots.txt 최적화 (crawl-delay, 추가 디렉토리 차단, Host 정보)
- ✅ 사이트맵 우선순위 시스템 (최근 30일 포스트 0.9, 기존 포스트 0.8)
- ✅ 구조화된 데이터 라이브러리 생성 (Blog, Article, Organization, Breadcrumb 스키마)
- ✅ changefreq 최적화 (homepage: daily, admin: monthly, posts: weekly)
- ✅ Author 정보 "Frank Oh"로 업데이트 (메타 태그 및 구조화된 데이터)
- ✅ Phase 2 이미지 SEO 개선 완료 (contextual alt 태그, lazy loading, WebP 지원, 이미지 사이트맵)
- ✅ 내부 링크 구조 강화 완료 (관련 글, 브레드크럼, 시리즈 네비게이션, 태그 클라우드)
- ✅ 모든 내부 네비게이션에 스크롤-투-탑 기능 추가
- ✅ 안전한 날짜 처리 시스템 구현 (`formatDateSafely` 유틸리티)
- ✅ 관련 글 표시 개선 (날짜 정상 표시, 디버그 정보 제거)

### 현재 진행 중인 작업
- 🔄 없음

### 다음 작업
- ⏭️ Phase 2: 성능 최적화 기본 작업 (캐싱 헤더, CSS/JS 최적화)
- ⏭️ Phase 3: Core Web Vitals 최적화
- ⏭️ Phase 3: 고급 구조화된 데이터 (FAQ, Review 스키마)
- ⏭️ Phase 3: 추가 사이트맵 (사이트맵 인덱스, 뉴스 사이트맵)
