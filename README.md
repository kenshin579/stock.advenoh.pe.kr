# 투자 인사이트 블로그 - Next.js + Express 통합 버전

## 🚀 프로젝트 개요

이 프로젝트는 투자 인사이트를 공유하는 한국어 금융 블로그입니다. Next.js 15 App Router와 Express.js를 통합하여 SSR(Server-Side Rendering)과 API 서버를 함께 제공합니다.

## 🏗️ 시스템 아키텍처

### 프론트엔드 (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Content**: Markdown (gray-matter, remark)
- **SEO**: 메타데이터, 구조화된 데이터, 사이트맵

### 백엔드 (Express.js)
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL session store
- **Development**: Hot module replacement

## 📁 프로젝트 구조

```
/
├── src/                    # Next.js 소스 코드
│   ├── app/               # App Router
│   │   ├── api/          # API 라우트
│   │   ├── blog/         # 블로그 페이지
│   │   ├── series/       # 시리즈 페이지
│   │   └── layout.tsx    # 루트 레이아웃
│   ├── components/        # React 컴포넌트
│   ├── hooks/            # 커스텀 훅
│   ├── lib/              # 유틸리티 함수
│   └── types/            # TypeScript 타입 정의
├── server/                # Express 서버
│   ├── index.ts          # 서버 진입점
│   ├── routes.ts         # API 라우트
│   └── services/         # 서비스 로직
├── shared/                # 공유 스키마
├── contents/              # 마크다운 콘텐츠
├── public/                # 정적 자산
│   └── contents/         # 이미지 파일
└── docs/                  # 문서
```

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** (App Router)
- **React 19.1.0**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI + shadcn/ui**
- **React Query**

### Backend
- **Express.js**
- **TypeScript**
- **Drizzle ORM**
- **PostgreSQL**
- **Passport.js**

### Development
- **ESLint**
- **PostCSS**
- **Lighthouse CI**

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.17.0 이상
- npm, yarn, pnpm, 또는 bun
- PostgreSQL 데이터베이스 (선택사항)

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   ```bash
   # .env.local 파일 생성
   DATABASE_URL=your_database_url_here
   SITE_URL=http://localhost:3000
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 빌드 및 배포

1. **프로덕션 빌드**
   ```bash
   npm run build
   ```

2. **프로덕션 서버 실행**
   ```bash
   npm run start
   ```

## 📊 주요 기능

### 블로그 기능
- **SSR 렌더링**: Next.js App Router 기반
- **마크다운 지원**: gray-matter, remark를 통한 콘텐츠 처리
- **카테고리 필터링**: 주식, ETF, 주간 리뷰 등
- **검색 기능**: 제목, 내용, 태그 기반 검색
- **시리즈 기능**: 연관 포스트 그룹화
- **이미지 최적화**: WebP/AVIF 포맷, lazy loading

### SEO 최적화
- **메타데이터**: 동적 메타 태그 생성
- **구조화된 데이터**: JSON-LD 스키마
- **사이트맵**: 자동 생성
- **RSS 피드**: 블로그 구독 지원
- **Open Graph**: 소셜 미디어 공유 최적화

### 성능 최적화
- **Core Web Vitals**: LCP, FID, CLS 최적화
- **번들 최적화**: Tree shaking, 코드 분할
- **캐싱**: 정적 자산 캐싱, ISR
- **이미지 최적화**: Next.js Image 컴포넌트

## 🔧 개발 가이드

### 컴포넌트 작성 규칙

1. **타입 정의**: 모든 props에 TypeScript 인터페이스 정의
2. **주석**: 복잡한 로직에 JSDoc 주석 추가
3. **에러 처리**: ErrorBoundary 사용
4. **접근성**: ARIA 라벨, 키보드 네비게이션 지원

### API 라우트 작성법

```tsx
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // API 로직
    return NextResponse.json({ data: 'success' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 블로그 포스트 작성법

1. **마크다운 파일 생성**: `contents/category/slug/index.md`
2. **Frontmatter 작성**:
   ```yaml
   ---
   title: "포스트 제목"
   date: "2024-12-01"
   author: "작성자"
   categories: ["stock", "etf"]
   tags: ["투자", "분석"]
   excerpt: "포스트 요약"
   featuredImage: "image.jpg"
   ---
   ```
3. **콘텐츠 작성**: 마크다운 형식으로 작성

## 🧪 테스트

### 성능 테스트

```bash
# Lighthouse CI 실행
npm run test:performance

# 번들 크기 분석
npm run build
```

### 기능 테스트

```bash
# 개발 서버에서 수동 테스트
npm run dev

# 빌드 테스트
npm run build
```

## 📈 모니터링

### 성능 모니터링

- **Core Web Vitals**: 실시간 측정
- **Google Analytics**: 페이지뷰, 사용자 행동 추적
  - 실시간 사용자 모니터링
  - 인기 콘텐츠 분석
  - 트래픽 소스 추적
- **에러 추적**: 자동 에러 로깅

### 로그 확인

```bash
# 개발 서버 로그
npm run dev

# 프로덕션 로그
npm run start
```

## 🔄 배포

### Replit 배포

1. **자동 배포**: Git push 시 자동 배포
2. **수동 배포**: Replit 대시보드에서 배포 버튼 클릭
3. **환경 변수**: Replit Secrets에서 다음 변수들 설정
   - `DATABASE_URL`: PostgreSQL 연결 URL
   - `SITE_URL`: 배포된 사이트 URL

### 배포 확인

- [ ] 사이트 접근 가능
- [ ] 모든 페이지 정상 로드
- [ ] 이미지 및 정적 자산 로드
- [ ] API 응답 정상
- [ ] SEO 메타데이터 확인
- [ ] Google Analytics 작동 확인 (개발자 도구에서 gtag 함수 및 네트워크 요청 확인 - G-9LNH27K1YS)
- [ ] 성능 지표 측정

## 🐛 문제 해결

### 일반적인 문제

1. **빌드 실패**
   ```bash
   # 캐시 클리어
   rm -rf .next
   rm -rf node_modules/.cache
   npm run build
   ```

2. **하이드레이션 에러**
   - 클라이언트 컴포넌트에 'use client' 지시어 추가
   - 서버와 클라이언트 간 상태 불일치 확인

3. **이미지 최적화 문제**
   - next.config.ts에서 이미지 도메인 설정 확인
   - 이미지 파일 경로 및 형식 확인

### 지원

문제가 발생하면 다음을 확인하세요:

1. **로그 확인**: 개발자 도구 콘솔
2. **네트워크 탭**: API 요청/응답 확인
3. **성능 탭**: Core Web Vitals 측정

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**개발자**: 투자 인사이트 블로그 팀  
**최종 업데이트**: 2024년 12월  
**마이그레이션 완료**: Next.js 15 + Express 통합 