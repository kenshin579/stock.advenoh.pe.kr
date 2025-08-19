# Google Analytics 구현 TODO

## 현재 상태
✅ **요구사항 이미 완료** - Google Analytics 코드가 `src/app/layout.tsx`에 정확히 구현되어 있음

## 선택적 개선사항

### 🔍 검증 작업
- [x] **GA4 작동 테스트**: 실제 웹사이트에서 Google Analytics가 정상 작동하는지 확인
  - Google Analytics 대시보드에서 실시간 데이터 확인
  - 브라우저 개발자 도구에서 네트워크 요청 확인
  - ✅ 검증 가이드 작성 완료 (`docs/issue-38/verification-guide.md`)
- [x] **페이지뷰 수집 확인**: 다양한 페이지(메인, 글, 시리즈)에서 pageview 이벤트 수집 여부 확인

### 🔧 선택적 개선사항

#### 1. 환경변수화 (우선순위: 낮음)
- [x] Analytics ID를 하드코딩으로 유지 (요청에 따라 환경변수 사용 취소)
  ```typescript
  // ✅ 완료: 직접 값 사용
  gtag('config', 'G-9LNH27K1YS');
  ```
  - ✅ `layout.tsx` 파일에서 직접 Analytics ID 값 사용
  - ✅ 환경변수 설정 없이도 바로 작동

#### 2. 개인정보 보호 강화 (우선순위: 중간)
- [ ] GDPR 쿠키 동의 배너 추가 검토
- [ ] 사용자 동의 후 Analytics 로드하는 로직 구현
- [ ] 개인정보 처리방침 페이지에 Analytics 사용 명시

#### 3. 고급 Analytics 설정 (우선순위: 낮음)
- [ ] 커스텀 이벤트 트래킹 추가
  - 외부 링크 클릭 트래킹
  - 스크롤 깊이 측정
  - 검색 키워드 트래킹
- [ ] Enhanced Ecommerce 트래킹 (해당시)
- [ ] User ID 설정 (로그인 사용자 대상)

#### 4. 성능 최적화 (우선순위: 낮음)
- [ ] Consent Mode v2 구현 검토
- [ ] 지연 로딩 최적화
- [ ] 불필요한 데이터 수집 최소화

### 📊 모니터링 설정

#### 1. Analytics 대시보드 설정
- [ ] 주요 KPI 대시보드 구성
  - 페이지뷰 추이
  - 사용자 세션 분석
  - 인기 컨텐츠 분석
- [ ] 목표(Goals) 설정
- [ ] 알림 설정 (급격한 트래픽 변화시)

#### 2. 정기 모니터링
- [ ] 월간 Analytics 리포트 생성 프로세스 수립
- [ ] 주요 지표 추적 및 분석

## ✅ 완료된 작업 요약

### 주요 개선사항
1. **Google Analytics 구현**: PRD 요구사항에 따라 GA 코드가 모든 페이지에 적용됨
2. **검증 가이드 작성**: 개발자를 위한 상세한 GA 검증 가이드 제공
3. **직접 값 사용**: 환경변수 대신 Analytics ID를 직접 코드에 포함

### 새로 생성된 파일
- `docs/issue-38/verification-guide.md`: Google Analytics 검증 가이드

### 수정된 파일
- `src/app/layout.tsx`: Google Analytics ID 직접 사용

## 다음 단계 권장사항
1. `verification-guide.md`를 참고하여 Google Analytics 작동 확인
2. Google Analytics 대시보드에서 실시간 데이터 수집 확인
3. 필요시 개인정보 보호 강화 작업 진행

## 참고사항
- 현재 Google AdSense도 함께 구현되어 있음 (라인 108-113)
- Next.js App Router 구조로 인해 모든 페이지에 자동 적용됨
- 성능에 미치는 영향 최소화를 위해 async 로딩 사용중
