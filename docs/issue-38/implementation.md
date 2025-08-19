# Google Analytics 구현 문서

## 요구사항 분석

### 주요 요구사항
- Google Analytics 활성화를 위해 `<head>` 태그 사이에 Google Analytics 코드 추가
- 메인 페이지와 각 article 페이지에 모두 포함되어야 함
- 사용할 Analytics ID: `G-9LNH27K1YS`

## 현재 구현 상태

### ✅ 이미 구현 완료
Google Analytics 코드가 이미 `src/app/layout.tsx` 파일에 정확히 구현되어 있습니다.

**파일 위치**: `src/app/layout.tsx` (95-106번 라인)

```typescript
{/* Google Analytics */}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-9LNH27K1YS"></script>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-9LNH27K1YS');
    `
  }}
/>
```

### 구현 특징

1. **전역 적용**: Next.js의 `RootLayout` 구조를 활용하여 모든 페이지에 자동 적용
2. **올바른 스크립트 로딩**: 
   - `async` 속성으로 비동기 로딩
   - `dangerouslySetInnerHTML`을 사용하여 gtag 초기화 코드 삽입
3. **적용 범위**:
   - 메인 페이지 (`/`)
   - 카테고리별 글 페이지 (`/[category]/[slug]`)
   - 시리즈 페이지 (`/series/[seriesName]`)
   - 기타 모든 페이지

### 코드 구조 분석

**Next.js App Router 구조**:
```
src/app/
├── layout.tsx          ← Google Analytics 코드 위치 (전역 적용)
├── page.tsx           ← 메인 페이지
├── [category]/
│   └── [slug]/
│       └── page.tsx   ← 개별 글 페이지
└── series/
    └── [seriesName]/
        └── page.tsx   ← 시리즈 페이지
```

## 검증 방법

### 1. 브라우저 개발자 도구 확인
- 네트워크 탭에서 `googletagmanager.com` 요청 확인
- 콘솔에서 `window.gtag` 함수 존재 확인

### 2. Google Analytics 대시보드
- 실시간 사용자 데이터 확인
- 페이지뷰 수집 상태 모니터링

### 3. Google Tag Assistant 확장 프로그램
- GA4 태그 정상 작동 여부 확인

## 추가 고려사항

### 1. 개인정보 보호
현재 구현에는 쿠키 동의 처리가 없습니다. GDPR 준수가 필요한 경우 쿠키 동의 배너 추가를 고려해야 합니다.

### 2. 성능 최적화
- `async` 속성으로 이미 최적화되어 있음
- 필요시 `defer` 속성 고려 가능

### 3. 환경변수 관리
Analytics ID를 환경변수로 관리하여 개발/운영 환경 분리 가능:
```typescript
gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'G-9LNH27K1YS');
```

## 결론

**요구사항은 이미 완전히 구현되어 있습니다.** 추가 작업이 필요하지 않으며, Google Analytics가 모든 페이지에서 정상적으로 작동할 것으로 예상됩니다.
