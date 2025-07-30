# 투자 인사이트 블로그 - Next.js 15 SSR 버전

이 프로젝트는 Vite + React + Wouter에서 Next.js 15 + App Router로 마이그레이션된 투자 인사이트 블로그입니다.

## 🚀 주요 기능

- **SSR (Server-Side Rendering)**: Next.js 15 App Router 기반
- **성능 최적화**: Lighthouse 점수 90+ 목표
- **SEO 최적화**: 메타데이터, 구조화된 데이터, 사이트맵
- **이미지 최적화**: WebP/AVIF 포맷, lazy loading, blur placeholder
- **접근성**: ARIA 라벨, 키보드 네비게이션, 색상 대비
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **다크 모드**: 시스템 설정 기반 자동 전환

## 📁 프로젝트 구조

```
client_nextjs/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 라우트
│   │   ├── blog/           # 블로그 페이지
│   │   ├── series/         # 시리즈 페이지
│   │   └── layout.tsx      # 루트 레이아웃
│   ├── components/         # React 컴포넌트
│   │   ├── image/          # 이미지 컴포넌트
│   │   ├── ui/             # UI 컴포넌트
│   │   └── ...             # 기타 컴포넌트
│   ├── hooks/              # 커스텀 훅
│   ├── lib/                # 유틸리티 함수
│   └── types/              # TypeScript 타입 정의
├── contents/               # 마크다운 콘텐츠
├── public/                 # 정적 자산
└── ...
```

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Content**: Markdown (gray-matter, remark)
- **Deployment**: Replit Cloud Run

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.17.0 이상
- npm, yarn, pnpm, 또는 bun

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **브라우저에서 확인**
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

## 📊 성능 최적화

### Core Web Vitals 목표

- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 최적화 기법

- **이미지 최적화**: Next.js Image 컴포넌트, WebP/AVIF 포맷
- **폰트 최적화**: Google Fonts, font-display: swap
- **번들 최적화**: Tree shaking, 코드 분할
- **캐싱**: 정적 자산 캐싱, ISR (Incremental Static Regeneration)
- **코드 분할**: 동적 import, React.lazy

## 🔧 개발 가이드

### 컴포넌트 작성 규칙

1. **타입 정의**: 모든 props에 TypeScript 인터페이스 정의
2. **주석**: 복잡한 로직에 JSDoc 주석 추가
3. **에러 처리**: ErrorBoundary 사용
4. **접근성**: ARIA 라벨, 키보드 네비게이션 지원

### 이미지 컴포넌트 사용법

```tsx
import { OptimizedImage, LazyImage } from '@/components/image';

// 우선순위 이미지 (LCP)
<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority={true}
/>

// 지연 로딩 이미지
<LazyImage
  src="/blog-image.jpg"
  alt="Blog image"
  width={400}
  height={300}
  context={{ postTitle: "블로그 제목" }}
/>
```

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

## 🧪 테스트

### 성능 테스트

```bash
# Lighthouse CI 실행
npm run test:performance

# 번들 크기 분석
npm run build:analyze
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
- **에러 추적**: 자동 에러 로깅
- **사용자 행동**: 페이지 뷰, 인터랙션 분석

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
3. **환경 변수**: Replit Secrets에서 설정

### 배포 확인

- [ ] 사이트 접근 가능
- [ ] 모든 페이지 정상 로드
- [ ] 이미지 및 정적 자산 로드
- [ ] API 응답 정상
- [ ] SEO 메타데이터 확인
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