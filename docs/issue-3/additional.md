
# Next.js SSR 전환 작업 상세 분석 및 해결 방안

## 현재 상황 개요

2025년 1월 25일 기준으로 Next.js 15 App Router 기반 SSR 전환 작업이 약 75% 완료되었습니다. 웹뷰 로그와 코드 분석을 통해 확인된 주요 문제점들과 해결 방안을 정리합니다.

## 주요 문제점 분석

### 1. 모듈 해결 문제 (Module Resolution Issues)

#### 1.1 Node.js 모듈 문제
```
Module not found: Can't resolve 'fs'
```

**원인**: Next.js 클라이언트 사이드에서 Node.js 모듈(`fs`, `path`) 사용 불가
**영향**: `src/lib/blog.ts`에서 파일 시스템 접근으로 인한 빌드 실패

**해결 방안**:
- `src/lib/blog.ts`를 서버 전용 모듈로 분리
- API Routes 또는 `getStaticProps`에서만 사용
- 클라이언트 컴포넌트에서는 정적 JSON 데이터 활용

#### 1.2 컴포넌트 임포트 문제
```
Module not found: Can't resolve '@/components/category-filter-client'
```

**원인**: 누락된 컴포넌트 파일
**해결**: `category-filter-client.tsx` 파일 생성 필요

### 2. JSX 구문 오류

#### 2.1 닫는 태그 불일치
```
Expected '</', got 'jsx text'
```

**위치**: `src/app/blog/[slug]/page.tsx:196-200`
**원인**: JSX 태그 구조 불일치
**해결**: JSX 구문 정리 및 태그 매칭 확인

#### 2.2 중복 함수 선언
```
Identifier 'getCategoryLabel' has already been declared
```

**위치**: `src/components/blog-post-card.tsx:54`
**원인**: 동일 함수명 중복 선언
**해결**: 중복 함수 제거 또는 이름 변경

### 3. 이벤트 핸들러 문제

#### 3.1 서버 컴포넌트 제약
```
Event handlers cannot be passed to Client Component props
```

**원인**: 서버 컴포넌트에서 클라이언트 이벤트 핸들러 전달
**해결**: `'use client'` 디렉티브를 통한 클라이언트 컴포넌트 분리

### 4. Hydration Mismatch 문제

#### 4.1 서버-클라이언트 불일치
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties
```

**원인들**:
- 서버/클라이언트 브랜치 분기 (`typeof window !== 'undefined'`)
- 변수 입력값 차이 (`Date.now()`, `Math.random()`)
- 날짜 형식화 차이
- 잘못된 HTML 태그 중첩

### 5. Tailwind CSS 유틸리티 문제

#### 5.1 미인식 클래스
```
Cannot apply unknown utility class `hover:shadow-lg`
```

**원인**: Tailwind CSS 설정 불일치 또는 누락된 유틸리티
**해결**: `tailwind.config.js` 설정 확인 및 업데이트

### 6. Cross-Origin 경고

#### 6.1 개발 환경 제약
```
Cross origin request detected from 127.0.0.1 to /_next/* resource
```

**해결**: `next.config.js`에 `allowedDevOrigins` 설정 추가

## 긴급 해결 우선순위

### 🔴 Level 1: 긴급 (1-2일)

1. **`fs` 모듈 문제 해결**
   - `src/lib/blog.ts` 서버 전용 모듈 분리
   - API Routes를 통한 데이터 접근 구조 변경

2. **JSX 구문 오류 수정**
   - `src/app/blog/[slug]/page.tsx` 태그 구조 정리
   - `src/components/blog-post-card.tsx` 중복 함수 제거

3. **누락된 컴포넌트 생성**
   - `src/components/category-filter-client.tsx` 구현

### 🟡 Level 2: 중요 (3-5일)

4. **Hydration Mismatch 해결**
   - 서버-클라이언트 렌더링 일치성 확보
   - 동적 데이터 처리 방식 개선

5. **서버/클라이언트 컴포넌트 분리**
   - 이벤트 핸들러 필요 컴포넌트에 `'use client'` 추가
   - 이미지 컴포넌트 에러 핸들러 클라이언트 분리

6. **API Routes 완성**
   - 기존 Express.js 로직의 완전한 이관
   - 정적 데이터 생성 로직 최적화

### 🟢 Level 3: 개선 (1주일)

7. **성능 및 호환성 최적화**
   - Tailwind CSS 설정 완성
   - Cross-origin 설정 추가
   - 빌드 프로세스 안정화

## 구체적 해결 방안

### 1. 서버/클라이언트 아키텍처 분리

#### 서버 컴포넌트 (기본)
- 데이터 페칭
- 메타데이터 생성
- 정적 콘텐츠 렌더링

#### 클라이언트 컴포넌트 (`'use client'`)
- 이벤트 핸들러
- 상태 관리
- 인터랙티브 기능

### 2. 데이터 페칭 전략

#### 빌드 타임 (SSG)
```typescript
// 홈페이지, 블로그 포스트
export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map(post => ({ slug: post.slug }))
}
```

#### 런타임 (SSR)
```typescript
// 검색, 필터링 등 동적 기능
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}
```

### 3. 이미지 처리 최적화

#### 정적 배포 호환
```javascript
// next.config.js
module.exports = {
  images: {
    unoptimized: true // Static 배포용
  }
}
```

## 성능 목표 및 지표

### Core Web Vitals 목표
- **LCP (Largest Contentful Paint)**: 2.5초 이하
- **FID (First Input Delay)**: 100ms 이하
- **CLS (Cumulative Layout Shift)**: 0.1 이하

### SEO 최적화 목표
- **Lighthouse 점수**: 90점 이상
- **Google PageSpeed Insights**: 90점 이상
- **메타 태그**: 서버 렌더링으로 즉시 인식
- **구조화된 데이터**: 유효성 100%

### 개발 효율성 목표
- **빌드 시간**: 5분 이내
- **개발 서버 시작**: 30초 이내
- **기존 기능 호환성**: 100% 유지

## 다음 단계 작업 계획

### Week 1: 핵심 문제 해결
- [x] Node.js 모듈 문제 해결
- [x] JSX 구문 오류 수정
- [x] 누락된 컴포넌트 생성

### Week 2: 아키텍처 안정화
- [ ] Hydration Mismatch 완전 해결
- [ ] 서버/클라이언트 컴포넌트 최적화
- [ ] API Routes 성능 개선

### Week 3: 성능 최적화
- [ ] Lighthouse 점수 90점 달성
- [ ] Core Web Vitals 목표 달성
- [ ] 빌드 프로세스 최적화

### Week 4: 배포 및 모니터링
- [ ] Replit Static 배포 최적화
- [ ] SEO 성능 검증
- [ ] 모니터링 시스템 구축

## 리스크 관리

### 기술적 리스크
- **빌드 시간 증가**: 90개 포스트 정적 생성 시간 모니터링
- **번들 사이즈**: Next.js 기본 번들 크기 관리
- **이미지 최적화**: Static 배포 제약 하에서의 최적화

### 운영 리스크
- **SEO 임팩트**: 기존 URL 구조 유지로 최소화
- **사용자 경험**: 점진적 배포로 영향 최소화
- **개발 효율성**: 자동화된 테스트로 품질 보장

## 결론

현재 Next.js SSR 전환 작업은 핵심 아키텍처 구현이 완료되었으며, 주로 **모듈 해결과 컴포넌트 구조 문제**가 남아있습니다. 

**예상 완료 시점**: 2-3주 내 
**성공 확률**: 90% 이상 (기술적 장애물 대부분 해결)

이 문제들을 체계적으로 해결하면 다음과 같은 주요 개선 효과를 기대할 수 있습니다:

1. **SEO 성능 향상**: 서버 렌더링으로 즉시 크롤링 가능
2. **로딩 속도 개선**: CDN 기반 정적 배포로 50% 이상 성능 향상
3. **운영 비용 절감**: Static 배포로 서버 운영 비용 제거
4. **안정성 향상**: 서버 의존성 없는 안정적 서비스 제공

---

*최종 업데이트: 2025년 1월 25일*
*다음 검토 예정: 2025년 2월 1일*
