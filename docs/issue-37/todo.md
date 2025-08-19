# Google AdSense 구현 작업 계획

## 전체 작업 개요
Google AdSense 승인을 위한 스크립트 추가 및 승인 프로세스 진행

**예상 소요 시간**: 2-3주 (코드 작업 1일 + AdSense 승인 대기 1-2주)

---

## Phase 1: 개발 및 코드 수정 📝
**목표**: AdSense 스크립트를 모든 페이지에 추가
**예상 소요 시간**: 1-2시간

### 1.1 개발 환경 준비
- [x] 프로젝트 로컬 환경 설정 확인
- [x] `src/app/layout.tsx` 파일 백업
- [x] 개발 서버 실행 (`npm run build`)

### 1.2 코드 수정
- [x] `src/app/layout.tsx` 파일 열기
- [x] Google Analytics 스크립트 섹션 찾기 (95-106번 줄)
- [x] AdSense 스크립트 코드 추가
  ```jsx
  {/* Google AdSense */}
  <script 
    async 
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8868959494983515"
    crossOrigin="anonymous"
  />
  ```
- [x] 코드 문법 및 들여쓰기 확인

### 1.3 기본 동작 확인
- [x] TypeScript/ESLint 오류 없음 확인
- [x] 로컬 서버에서 페이지 정상 로드 확인

---

## Phase 2: 테스트 및 검증 🧪
**목표**: 모든 페이지에서 AdSense 스크립트가 정상 로드되는지 확인
**예상 소요 시간**: 2-3시간

### 2.1 로컬 테스트
- [ ] 브라우저 개발자 도구로 `<head>` 태그 확인
- [ ] AdSense 스크립트가 HTML에 포함되었는지 확인
- [ ] Network 탭에서 스크립트 요청 상태 확인

### 2.2 페이지별 테스트
- [ ] 메인 페이지 (`/`) 테스트
- [ ] 개별 글 페이지 테스트 (예: `/stock/sample-post`)
- [ ] 시리즈 페이지 (`/series`) 테스트
- [ ] 404 페이지 테스트
- [ ] 모바일 반응형 테스트

### 2.3 성능 테스트
- [ ] 페이지 로딩 속도 영향도 확인
- [ ] Lighthouse 성능 점수 확인
- [ ] 콘솔 에러 메시지 없음 확인

### 2.4 브라우저 호환성 테스트
- [ ] Chrome 브라우저 테스트
- [ ] Safari 브라우저 테스트
- [ ] Firefox 브라우저 테스트
- [ ] Edge 브라우저 테스트

---

## Phase 3: 배포 및 AdSense 승인 요청 🚀
**목표**: 프로덕션 환경에 배포하고 AdSense 승인 요청
**예상 소요 시간**: 1일 + 1-2주 승인 대기

### 3.1 배포 준비
- [ ] 코드 변경사항 최종 검토
- [ ] Git commit 메시지 작성
  ```
  feat: Add Google AdSense script to all pages
  
  - Add AdSense script to layout.tsx head section
  - Script loads on all pages including main and article pages
  - Preparation for AdSense approval process
  ```
- [ ] Git push to remote repository

### 3.2 프로덕션 배포
- [ ] 배포 파이프라인 실행
- [ ] 배포 완료 확인
- [ ] 프로덕션 환경에서 스크립트 로드 확인

### 3.3 배포 후 검증
- [ ] 프로덕션 URL에서 `<head>` 태그 확인
- [ ] 다양한 페이지에서 스크립트 정상 로드 확인
- [ ] 성능 및 사용자 경험 확인

### 3.4 AdSense 승인 요청
- [ ] Google AdSense 계정 로그인
- [ ] 사이트 URL 추가 및 연결
- [ ] 사이트 검토 요청 제출
- [ ] 승인 대기 (보통 1-14일)

---

## Phase 4: 승인 후 후속 작업 ✅
**목표**: AdSense 승인 후 광고 설정 및 최적화
**예상 소요 시간**: 1-2일

### 4.1 승인 확인
- [ ] AdSense 계정에서 승인 알림 확인
- [ ] 사이트 상태 "승인됨" 확인
- [ ] 광고 단위 생성 가능 상태 확인

### 4.2 광고 설정 (선택사항)
- [ ] 자동 광고 설정 검토
- [ ] 광고 배치 위치 결정
- [ ] 광고 형태 및 크기 설정
- [ ] 광고 수익 최적화 설정

### 4.3 모니터링 설정
- [ ] AdSense 대시보드 모니터링 설정
- [ ] Google Analytics와 AdSense 연동
- [ ] 수익 리포트 설정

### 4.4 문서화
- [ ] AdSense 설정 과정 문서화
- [ ] 향후 유지보수 가이드 작성
- [ ] 팀원 공유 및 인수인계

---

## 위험 요소 및 대응 방안 ⚠️

### 기술적 위험
- **위험**: 스크립트 로드 실패
- **대응**: 네트워크 환경 확인, 브라우저 캐시 삭제

### 승인 관련 위험
- **위험**: AdSense 승인 거부
- **대응**: 콘텐츠 품질 개선, 개인정보처리방침 추가, 재신청

### 성능 관련 위험
- **위험**: 페이지 로딩 속도 저하
- **대응**: async 속성 활용, 성능 모니터링

---

## 체크포인트 📋

### Phase 1 완료 조건 ✅ COMPLETED
- ✅ AdSense 스크립트가 `layout.tsx`에 정상 추가됨 (107-113번 줄)
- ✅ 로컬 환경에서 스크립트 로드 확인 (빌드 성공)

### Phase 2 완료 조건
- ✅ 모든 주요 페이지에서 스크립트 정상 동작
- ✅ 브라우저 호환성 확인 완료
- ✅ 성능 저하 없음 확인

### Phase 3 완료 조건
- ✅ 프로덕션 배포 완료
- ✅ AdSense 승인 요청 제출
- ✅ 승인 대기 상태

### Phase 4 완료 조건
- ✅ AdSense 승인 완료
- ✅ 광고 설정 완료 (선택사항)
- ✅ 모니터링 체계 구축

---

## 연락처 및 참고 자료 📚

### Google AdSense 고객센터
- [AdSense 시작 가이드](https://support.google.com/adsense/answer/6242051)
- [사이트 승인 정책](https://support.google.com/adsense/answer/48182)

### 내부 문서
- `docs/issue-37/prd.md` - 요구사항 정의서
- `docs/issue-37/implementation.md` - 구현 가이드
