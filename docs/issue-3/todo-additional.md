
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

## 📋 구체적 해결 방안 및 단계별 테스트

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

## 🧪 단계별 테스트 방법

### Phase 1: 기본 오류 해결 테스트

#### 1단계: Node.js 모듈 문제 해결 테스트
```bash
# 테스트 명령어
cd client_nextjs
npm run dev

# 확인 사항
✅ fs 모듈 오류 없음
✅ 개발 서버 정상 시작 (3초 이내)
✅ 콘솔에 Module not found 오류 없음
```

#### 2단계: JSX 구문 오류 해결 테스트
```bash
# 빌드 테스트
npm run build

# 확인 사항  
✅ "Expected '</', got 'jsx text'" 오류 없음
✅ 중복 함수 선언 오류 없음
✅ 빌드 성공 완료
```

#### 3단계: 누락된 컴포넌트 테스트
```bash
# 개발 서버 테스트
npm run dev

# 브라우저 테스트
- http://localhost:3000 접속
- 카테고리 필터 정상 렌더링 확인

# 확인 사항
✅ category-filter-client 컴포넌트 임포트 오류 없음
✅ 카테고리 필터 UI 정상 표시
✅ 클릭 이벤트 정상 작동
```

### Phase 2: Hydration 및 컴포넌트 분리 테스트

#### 4단계: Hydration Mismatch 해결 테스트
```bash
# 개발자 도구 콘솔 확인
- F12 > Console 탭 열기
- 페이지 새로고침 (Ctrl+F5)

# 확인 사항
✅ "A tree hydrated but some attributes..." 경고 없음
✅ React hydration 오류 없음
✅ 서버-클라이언트 렌더링 일치
```

#### 5단계: 이벤트 핸들러 분리 테스트
```bash
# 인터랙티브 기능 테스트
1. 이미지 로딩 실패 테스트 (네트워크 끊기)
2. 버튼 클릭 이벤트 테스트
3. 폼 입력 이벤트 테스트

# 확인 사항
✅ "Event handlers cannot be passed to Client Component" 오류 없음
✅ 모든 인터랙티브 기능 정상 작동
✅ onError, onClick 등 이벤트 핸들러 정상 실행
```

#### 6단계: API Routes 테스트
```bash
# API 엔드포인트 직접 테스트
curl http://localhost:3000/api/blog-posts
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/sitemap.xml

# 확인 사항
✅ 모든 API 엔드포인트 200 응답
✅ JSON 데이터 정상 구조
✅ 90개 이상 블로그 포스트 반환
```

### Phase 3: 성능 및 최종 테스트

#### 7단계: CSS 및 스타일링 테스트
```bash
# Tailwind CSS 빌드 테스트
npm run build

# 시각적 테스트
- 모든 페이지 방문하여 스타일 확인
- 반응형 디자인 테스트 (모바일/데스크톱)

# 확인 사항
✅ "Cannot apply unknown utility class" 경고 없음
✅ hover:shadow-lg 등 모든 유틸리티 클래스 정상 적용
✅ 반응형 레이아웃 정상 작동
```

#### 8단계: 빌드 및 배포 테스트
```bash
# 정적 빌드 테스트
npm run build
npm run export  # next export 명령어

# 로컬 정적 서버 테스트
cd out
python -m http.server 8000
# 또는
npx serve .

# 확인 사항
✅ 정적 빌드 성공 (out/ 폴더 생성)
✅ 모든 페이지 정적 파일 생성
✅ 정적 서버에서 완전 동작
```

#### 9단계: 성능 측정 테스트
```bash
# Lighthouse 테스트 (Chrome DevTools)
1. F12 > Lighthouse 탭
2. Performance, SEO, Best Practices 모두 체크
3. "Generate report" 클릭

# PageSpeed Insights 테스트
https://pagespeed.web.dev/ 에서 배포된 URL 테스트

# 확인 사항
✅ Lighthouse Performance Score >= 85
✅ First Contentful Paint <= 2초
✅ Largest Contentful Paint <= 2.5초
✅ Cumulative Layout Shift <= 0.1
```

### 🔍 자동화된 테스트 스크립트

#### 종합 테스트 스크립트 생성
```bash
# test-nextjs.sh 파일 생성
#!/bin/bash
echo "🚀 Next.js SSR 전환 테스트 시작"

echo "1️⃣ 개발 서버 시작 테스트..."
cd client_nextjs
timeout 30s npm run dev &
DEV_PID=$!
sleep 10
kill $DEV_PID

echo "2️⃣ 빌드 테스트..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공"
else
    echo "❌ 빌드 실패"
    exit 1
fi

echo "3️⃣ API 엔드포인트 테스트..."
npm run dev &
DEV_PID=$!
sleep 10

curl -f http://localhost:3000/api/blog-posts > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API Routes 정상"
else
    echo "❌ API Routes 오류"
fi

kill $DEV_PID
echo "🎉 모든 테스트 완료"
```

### 📊 테스트 체크리스트 

#### Level 1 긴급 해결 테스트
- [ ] fs 모듈 오류 해결 확인
- [ ] JSX 구문 오류 해결 확인  
- [ ] 중복 함수 선언 오류 해결 확인
- [ ] category-filter-client 컴포넌트 생성 확인
- [ ] 개발 서버 정상 시작 확인 (3초 이내)

#### Level 2 중요 해결 테스트
- [ ] Hydration Mismatch 경고 제거 확인
- [ ] 이벤트 핸들러 오류 해결 확인
- [ ] 모든 API Routes 정상 응답 확인
- [ ] 서버-클라이언트 렌더링 일치 확인
- [ ] 인터랙티브 기능 정상 작동 확인

#### Level 3 성능 및 안정성 테스트
- [ ] Tailwind CSS 유틸리티 클래스 정상 적용 확인
- [ ] 정적 빌드 및 export 성공 확인
- [ ] Lighthouse Performance Score >= 85 달성
- [ ] 모든 페이지 정상 렌더링 확인
- [ ] Cross-origin 경고 해결 확인

### 🔄 회귀 테스트 (매일 실행)

#### 기능 회귀 테스트
```bash
# 매일 오후 6시 실행할 회귀 테스트
1. 홈페이지 로딩 테스트 (5초 이내)
2. 블로그 포스트 5개 무작위 접근 테스트
3. 시리즈 페이지 정상 작동 테스트
4. 카테고리 필터링 테스트
5. 검색 기능 테스트 (구현 시)
6. 반응형 디자인 테스트
```

#### 성능 회귀 테스트
```bash
# 주간 성능 체크 (매주 금요일)
1. Lighthouse 점수 측정 및 기록
2. 번들 사이즈 변화 추적
3. 빌드 시간 측정 및 기록
4. API 응답 시간 측정
5. 메모리 사용량 체크
```

## 📅 주간 마일스톤

### Week 1 (현재 주)
- 🔴 Level 1 모든 과제 완료 + 테스트 통과
- 빌드 오류 해결 + 자동화 테스트 스크립트 작성
- 기본 페이지 렌더링 안정화 + 회귀 테스트 구축

### Week 2
- 🟡 Level 2 과제 80% 완료 + 성능 테스트 시작
- Hydration 문제 해결 + Lighthouse 측정 시작
- API Routes 완성 + 부하 테스트 구현

### Week 3
- 🟢 Level 3 과제 완료 + 최종 성능 검증
- 성능 최적화 + 목표 지표 달성 확인
- 배포 준비 + 프로덕션 테스트 완료

### Week 4
- 최종 테스트 및 배포 + 모니터링 구축
- 성능 지표 모니터링 시스템 구축
- 문서화 완성 + 테스트 가이드 작성

---

**최종 업데이트**: 2025년 1월 25일  
**담당자**: Development Team  
**검토 주기**: 매일 오후 6시  
**이슈 리포팅**: GitHub Issues 또는 Slack #nextjs-migration
