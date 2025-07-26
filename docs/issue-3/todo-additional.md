
# Next.js SSR 전환 작업 TODO - 추가 해결 방안

## 🔴 Level 1: 긴급 해결 과제 (1-2일)

### 1. Node.js 모듈 문제 해결
- [ ] **`src/lib/blog.ts` 서버 전용 모듈 분리**
  - [ ] `fs`, `path` 모듈 사용 부분을 서버 컴포넌트로 이동
  - [ ] 클라이언트에서는 정적 JSON 데이터 활용하도록 변경
  - [ ] API Routes를 통한 데이터 접근 구조 구현

### 2. JSX 구문 오류 수정
- [ ] **`src/app/blog/[slug]/page.tsx` 태그 구조 정리**
  - [ ] 196-200 라인의 JSX 태그 매칭 문제 해결
  - [ ] `Expected '</', got 'jsx text'` 오류 수정
  - [ ] JSX 구문 유효성 검증

- [ ] **`src/components/blog-post-card.tsx` 중복 함수 제거**
  - [ ] 54라인의 `getCategoryLabel` 함수 중복 선언 해결
  - [ ] 함수명 변경 또는 중복 제거

### 3. 누락된 컴포넌트 생성
- [ ] **`src/components/category-filter-client.tsx` 구현**
  - [ ] 클라이언트 사이드 카테고리 필터 컴포넌트 생성
  - [ ] `'use client'` 디렉티브 추가
  - [ ] 이벤트 핸들러 및 상태 관리 구현

## 🟡 Level 2: 중요 해결 과제 (3-5일)

### 4. Hydration Mismatch 문제 해결
- [ ] **서버-클라이언트 렌더링 일치성 확보**
  - [ ] `typeof window !== 'undefined'` 브랜치 분기 제거
  - [ ] `Date.now()`, `Math.random()` 등 동적 값 처리 개선
  - [ ] 날짜 형식화 통일
  - [ ] HTML 태그 중첩 구조 검증

### 5. 서버/클라이언트 컴포넌트 분리
- [ ] **이벤트 핸들러 클라이언트 컴포넌트 분리**
  - [ ] 이미지 컴포넌트 `onError` 핸들러 클라이언트 분리
  - [ ] 인터랙티브 요소에 `'use client'` 디렉티브 추가
  - [ ] 서버 컴포넌트에서 클라이언트 이벤트 핸들러 전달 문제 해결

### 6. API Routes 완성
- [ ] **기존 Express.js 로직 완전 이관**
  - [ ] 카테고리 데이터 API (`/api/categories`) 구현
  - [ ] 블로그 포스트 API (`/api/blog-posts`) 안정화
  - [ ] 정적 데이터 생성 로직 최적화

## 🟢 Level 3: 성능 및 안정성 개선 (1주일)

### 7. CSS 및 스타일링 문제 해결
- [ ] **Tailwind CSS 설정 완성**
  - [ ] `hover:shadow-lg` 등 미인식 유틸리티 클래스 문제 해결
  - [ ] `tailwind.config.js` 설정 검토 및 업데이트
  - [ ] CSS 빌드 프로세스 안정화

### 8. 개발 환경 최적화
- [ ] **Cross-origin 설정 추가**
  - [ ] `next.config.js`에 `allowedDevOrigins` 설정
  - [ ] 개발 서버 CORS 문제 해결
  - [ ] 127.0.0.1과 localhost 호환성 확보

### 9. 빌드 프로세스 안정화
- [ ] **빌드 오류 완전 해결**
  - [ ] `npm run build` 성공률 100% 달성
  - [ ] TypeScript 타입 오류 해결
  - [ ] ESLint 경고 처리

## 📋 구체적 해결 방안

### A. `src/lib/blog.ts` 리팩토링
```typescript
// 서버 전용 함수 분리
// src/lib/blog-server.ts (새 파일)
import fs from 'fs'
import path from 'path'

export async function getAllBlogPostsServer() {
  // fs 모듈 사용 로직
}

// src/lib/blog-client.ts (새 파일)
export async function getAllBlogPostsClient() {
  // fetch를 통한 API 호출
  const response = await fetch('/api/blog-posts')
  return response.json()
}
```

### B. JSX 구문 오류 해결 패턴
```typescript
// 올바른 JSX 구조
return (
  <div>
    <article>
      <div>
        {/* 컨텐츠 */}
      </div>
    </article>
  </div>
)
```

### C. 클라이언트 컴포넌트 분리 패턴
```typescript
// src/components/interactive-image.tsx
'use client'

export function InteractiveImage({ src, alt, onError }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      onError={onError}
      loading="lazy"
    />
  )
}
```

### D. Hydration 안정화 패턴
```typescript
// 서버-클라이언트 일치성 확보
export function SafeComponent() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div>Loading...</div>
  }
  
  return <div>{/* 클라이언트 전용 로직 */}</div>
}
```

## 🎯 성공 지표

### 단기 목표 (1주일 내)
- [ ] 빌드 오류 0개 달성
- [ ] 개발 서버 정상 구동 (3초 이내)
- [ ] Hydration 오류 완전 제거
- [ ] 모든 페이지 정상 렌더링

### 중기 목표 (2주일 내)
- [ ] Lighthouse 성능 점수 85점 이상
- [ ] First Contentful Paint 2초 이하
- [ ] Core Web Vitals 모든 지표 통과
- [ ] SEO 메타데이터 100% 적용

### 장기 목표 (3주일 내)
- [ ] Lighthouse 성능 점수 90점 이상
- [ ] 완전한 정적 사이트 생성 (SSG)
- [ ] Replit Static 배포 성공
- [ ] 기존 기능 100% 호환성 확보

## 📊 진행 상황 추적

### 완료된 작업 ✅
- [x] Next.js 15 App Router 기본 설정
- [x] 컴포넌트 기본 마이그레이션
- [x] 라우팅 구조 구현
- [x] API Routes 기본 구조

### 진행 중인 작업 🔄
- [ ] Node.js 모듈 문제 해결 (50%)
- [ ] JSX 구문 오류 수정 (30%)
- [ ] Hydration Mismatch 해결 (20%)

### 대기 중인 작업 ⏳
- [ ] 성능 최적화
- [ ] SEO 완성
- [ ] 배포 준비
- [ ] 모니터링 설정

## 🚨 위험 요소 및 대응 방안

### 기술적 위험
1. **빌드 시간 증가**
   - 모니터링: 5분 이상 시 최적화 필요
   - 대응: 코드 스플리팅, Tree shaking 적용

2. **Hydration 복잡성**
   - 모니터링: 개발자 도구 오류 로그 확인
   - 대응: 단계적 클라이언트 컴포넌트 분리

3. **번들 사이즈 증가**
   - 모니터링: Bundle Analyzer로 주기적 확인
   - 대응: 불필요한 의존성 제거

### 일정 위험
1. **예상보다 긴 디버깅 시간**
   - 대응: 우선순위 재조정, 단계적 해결
   - 백업 계획: 핵심 기능 우선 완성

2. **Replit 환경 제약**
   - 대응: 로컬 개발과 병행
   - 대안: Replit 지원팀 문의

## 📅 주간 마일스톤

### Week 1 (현재 주)
- 🔴 Level 1 모든 과제 완료
- 빌드 오류 해결
- 기본 페이지 렌더링 안정화

### Week 2
- 🟡 Level 2 과제 80% 완료
- Hydration 문제 해결
- API Routes 완성

### Week 3
- 🟢 Level 3 과제 완료
- 성능 최적화
- 배포 준비

### Week 4
- 최종 테스트 및 배포
- 모니터링 시스템 구축
- 문서화 완성

---

**최종 업데이트**: 2025년 1월 25일  
**담당자**: Development Team  
**검토 주기**: 매일 오후 6시  
**이슈 리포팅**: GitHub Issues 또는 Slack #nextjs-migration
