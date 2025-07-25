
# SSR 전환 작업 PRD (Next.js 마이그레이션)

## 1. 프로젝트 개요

### 1.1 배경
현재 투자 블로그는 Vite + React 기반의 CSR(Client-Side Rendering) 구조로 구현되어 있습니다. SEO 최적화를 위해 Server-Side Rendering(SSR)을 도입하여 검색 엔진 크롤링 성능과 초기 페이지 로딩 속도를 개선하고자 합니다.

### 1.2 목표
- 현재 CSR 구조를 Next.js 기반 SSR 구조로 전환
- SEO 성능 향상 및 Core Web Vitals 개선
- 기존 기능과 데이터 구조 유지
- Replit 환경에서의 원활한 배포 지원

### 1.3 범위
- 프론트엔드 아키텍처 전면 재구성
- 서버 사이드 렌더링 구현
- 기존 Express.js 백엔드와의 통합
- 정적 데이터 생성 시스템 개선
- Replit Static 배포로 전환

## 2. 현재 시스템 분석

### 2.1 현재 아키텍처
```
├── client/                    # Vite + React 프론트엔드
│   ├── src/
│   │   ├── components/       # React 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── lib/             # 유틸리티 라이브러리
│   │   └── main.tsx         # 클라이언트 엔트리포인트
├── server/                   # Express.js 백엔드
│   ├── routes.ts            # API 라우팅
│   ├── services/            # 비즈니스 로직
│   └── index.ts             # 서버 엔트리포인트
└── contents/                # 마크다운 콘텐츠
```

### 2.2 주요 기능 분석

#### 2.2.1 라우팅 시스템
- **현재**: Wouter 기반 클라이언트 사이드 라우팅
- **페이지**: Home(`/`), BlogPost(`/blog/:slug`), Series(`/series`), SeriesDetail(`/series/:seriesName`)
- **이슈**: JavaScript 실행 후에만 라우팅 동작

#### 2.2.2 데이터 페칭
- **현재**: TanStack Query + fetch API
- **특징**: 프로덕션에서 정적 JSON 파일 폴백 시스템
- **이슈**: 초기 로딩 시 빈 페이지 표시

#### 2.2.3 SEO 구현
- **메타 태그**: `useEffect`로 DOM 조작
- **구조화 데이터**: 클라이언트에서 동적 생성
- **사이트맵**: Express.js에서 동적 생성
- **이슈**: 크롤러가 JavaScript 실행 전 콘텐츠에 접근 불가

#### 2.2.4 콘텐츠 관리
- **마크다운 파일**: `contents/` 디렉토리
- **이미지**: `attached_assets/` 디렉토리
- **정적 데이터 생성**: `generateStaticData.ts` 스크립트

## 3. Next.js 전환 요구사항

### 3.1 아키텍처 변경

#### 3.1.1 프로젝트 구조 재편성
```
├── pages/                    # Next.js 페이지 라우팅
│   ├── index.tsx            # 홈페이지 (/)
│   ├── blog/
│   │   └── [slug].tsx       # 블로그 포스트 (/blog/:slug)
│   ├── series/
│   │   ├── index.tsx        # 시리즈 목록 (/series)
│   │   └── [seriesName].tsx # 시리즈 상세 (/series/:seriesName)
│   ├── api/                 # API Routes (기존 Express.js 대체)
│   │   ├── blog-posts.ts
│   │   ├── categories.ts
│   │   ├── series.ts
│   │   ├── sitemap.xml.ts
│   │   └── robots.txt.ts
│   └── _app.tsx             # 앱 래퍼
├── components/              # 기존 컴포넌트 마이그레이션
├── lib/                     # 유틸리티 라이브러리
├── public/                  # 정적 파일 (images, assets)
└── contents/                # 마크다운 콘텐츠 (기존 유지)
```

#### 3.1.2 렌더링 전략
- **홈페이지**: SSG (Static Site Generation)
- **블로그 포스트**: SSG (Static Site Generation)
- **시리즈 페이지**: SSG (Static Site Generation)
- **API 데이터**: 빌드 타임에 정적 JSON 파일 생성

#### 3.1.3 배포 전략
- **배포 방식**: Replit Static 배포
- **빌드 출력**: `next export`를 통한 정적 파일 생성
- **API 데이터**: 빌드 타임에 모든 데이터를 정적 JSON으로 생성
- **이미지 최적화**: Next.js Image 컴포넌트의 정적 최적화 활용
- **성능**: CDN을 통한 빠른 로딩 및 글로벌 배포

### 3.2 컴포넌트 마이그레이션

#### 3.2.1 페이지 컴포넌트 변경
| 현재 파일 | Next.js 파일 | 변경 사항 |
|----------|-------------|-----------|
| `pages/home.tsx` | `pages/index.tsx` | `getStaticProps` 추가 |
| `pages/blog-post.tsx` | `pages/blog/[slug].tsx` | `getStaticPaths`, `getStaticProps` 추가 |
| `pages/series.tsx` | `pages/series/index.tsx` | `getStaticProps` 추가 |
| `pages/series-detail.tsx` | `pages/series/[seriesName].tsx` | `getStaticPaths`, `getStaticProps` 추가 |

#### 3.2.2 SEO 컴포넌트 개선
- **현재**: `seo-head.tsx` - `useEffect`로 DOM 조작
- **변경**: Next.js `Head` 컴포넌트 활용
- **개선점**: 서버에서 메타 태그 렌더링

#### 3.2.3 이미지 최적화
- **현재**: `lazy-image.tsx` - 커스텀 구현
- **변경**: Next.js `Image` 컴포넌트 활용
- **개선점**: 자동 최적화, WebP 변환, 반응형 이미지

### 3.3 데이터 레이어 변경

#### 3.3.1 API 라우팅
- **현재**: Express.js 서버 (`server/routes.ts`)
- **변경**: Next.js API Routes (`pages/api/`)
- **마이그레이션 대상**:
  - `/api/blog-posts` → `pages/api/blog-posts.ts`
  - `/api/categories` → `pages/api/categories.ts`
  - `/api/series` → `pages/api/series.ts`
  - `/sitemap.xml` → `pages/api/sitemap.xml.ts`
  - `/robots.txt` → `pages/api/robots.txt.ts`

#### 3.3.2 데이터 페칭 전략
- **현재**: TanStack Query + 클라이언트 페칭
- **변경**: `getStaticProps`, `getServerSideProps` 활용
- **정적 데이터**: 빌드 타임에 생성
- **동적 데이터**: 서버에서 실시간 생성

### 3.4 콘텐츠 관리 시스템

#### 3.4.1 마크다운 처리
- **현재**: `contentImporter.ts` - 런타임 처리
- **변경**: 빌드 타임 정적 생성
- **개선점**: 빌드 시 마크다운 파싱 및 메타데이터 추출

#### 3.4.2 이미지 관리
- **현재**: `attached_assets/` - Express.js 정적 서빙
- **변경**: `public/` 디렉토리 - Next.js 정적 파일 서빙
- **최적화**: Next.js Image 컴포넌트 자동 최적화

## 4. 기술적 고려사항

### 4.1 성능 최적화

#### 4.1.1 Core Web Vitals 개선
- **LCP**: 서버에서 완전 렌더링된 HTML 제공
- **FID**: JavaScript 번들 사이즈 최적화
- **CLS**: 레이아웃 시프트 최소화

#### 4.1.2 빌드 최적화
- **Code Splitting**: 페이지별 자동 분할
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Static Export**: 정적 파일 생성 옵션

### 4.2 SEO 개선

#### 4.2.1 메타 태그 최적화
- 서버 사이드 메타 태그 생성
- 동적 Open Graph 이미지 생성
- 구조화된 데이터 서버 렌더링

#### 4.2.2 사이트맵 및 크롤링
- Next.js API Routes로 동적 사이트맵 생성
- 이미지 사이트맵 최적화
- robots.txt 동적 생성

### 4.3 Replit 환경 최적화

#### 4.3.1 Static 배포 설정
- **배포 타입**: `deploymentTarget = "static"`
- **빌드 명령어**: `npm run build && npm run export`
- **퍼블릭 디렉토리**: `out/` (Next.js export 출력)
- **개발 환경**: `npm run dev`

#### 4.3.2 Next.js 설정
```javascript
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true // Static 배포에서 필요
  }
}
```

#### 4.3.3 환경 변수
- `NODE_ENV`: 환경 설정
- `NEXT_PUBLIC_SITE_URL`: 사이트 URL (SEO용)
- 데이터베이스 연결 불필요 (정적 배포)

## 5. 마이그레이션 계획

### 5.1 Phase 1: 프로젝트 설정 (1주)
- Next.js 프로젝트 초기화
- 기본 페이지 구조 생성
- Tailwind CSS 설정
- 기존 컴포넌트 이동

### 5.2 Phase 2: 페이지 마이그레이션 (2주)
- 홈페이지 SSG 구현
- 블로그 포스트 페이지 SSG 구현
- 시리즈 페이지 SSG 구현
- 404 페이지 구현

### 5.3 Phase 3: API 및 데이터 레이어 (1주)
- API Routes 구현
- 정적 데이터 생성 로직 이동
- 사이트맵 및 robots.txt API 구현

### 5.4 Phase 4: SEO 및 최적화 (1주)
- 메타 태그 서버 렌더링
- 구조화된 데이터 구현
- 이미지 최적화 적용
- 성능 테스트 및 최적화

### 5.5 Phase 5: Static 배포 설정 및 테스트 (1주)
- Next.js export 설정 구성
- 정적 파일 생성 테스트
- Replit Static 배포 구성
- SEO 및 성능 테스트
- 기능 테스트 및 검증

## 6. 리스크 및 대응 방안

### 6.1 기술적 리스크
- **데이터 마이그레이션**: 기존 정적 데이터 호환성 확인
- **컴포넌트 호환성**: Wouter → Next.js Router 변경
- **스타일링**: Tailwind CSS 설정 호환성

### 6.2 성능 리스크
- **빌드 시간**: 90개 포스트 정적 생성 시간
- **Static 배포 제약**: 서버 사이드 기능 제한
- **번들 사이즈**: Next.js 기본 번들 사이즈 증가
- **이미지 최적화**: Static 배포에서의 이미지 처리 제한

### 6.3 SEO 리스크
- **URL 구조**: 기존 URL 유지 필요
- **메타 태그**: 기존 SEO 설정 호환성
- **사이트맵**: 검색 엔진 재인덱싱 필요

## 7. 성공 지표

### 7.1 성능 지표
- **LCP**: 2.5초 이하
- **FID**: 100ms 이하  
- **CLS**: 0.1 이하
- **페이지 로딩 속도**: 50% 이상 개선

### 7.2 SEO 지표
- **Google PageSpeed Insights**: 90점 이상
- **검색 엔진 색인 속도**: 48시간 이내
- **메타 태그 렌더링**: 크롤러 즉시 인식

### 7.3 개발 지표
- **빌드 시간**: 5분 이내
- **개발 서버 시작**: 30초 이내
- **코드 호환성**: 기존 기능 100% 유지

## 8. 결론

Next.js SSG(Static Site Generation)와 Replit Static 배포로의 전환은 현재 투자 블로그의 SEO 성능과 로딩 속도를 크게 향상시킬 것으로 예상됩니다. 

### 주요 개선 효과
- **SEO 최적화**: 빌드 타임에 완전한 HTML과 메타 태그 생성
- **성능 향상**: CDN을 통한 빠른 로딩 및 글로벌 배포
- **비용 효율성**: Static 배포의 저렴한 운영 비용
- **안정성**: 서버 의존성 없는 안정적인 서비스 제공

약 6주간의 마이그레이션 기간을 통해 기존 기능을 유지하면서도 성능, SEO, 그리고 운영 효율성을 크게 개선할 수 있을 것으로 판단됩니다.
