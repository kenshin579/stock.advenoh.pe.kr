# Google AdSense 구현 가이드

## 개요
Google AdSense 승인을 받기 위해 모든 페이지의 `<head>` 태그에 AdSense 스크립트를 추가하는 작업입니다.

## 구현 방법

### 1. 파일 수정 위치
- **대상 파일**: `src/app/layout.tsx`
- **수정 섹션**: `<head>` 태그 내부 (106번 줄 다음)
- **적용 범위**: 전체 사이트 (메인 페이지 + 모든 article 페이지)

### 2. 추가할 AdSense 코드

```jsx
{/* Google AdSense */}
<script 
  async 
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8868959494983515"
  crossOrigin="anonymous"
/>
```

### 3. 구현 세부사항

#### 추가 위치
- **파일**: `src/app/layout.tsx`
- **위치**: 106번 줄 다음, `</head>` 태그 직전

#### JSX 문법 주의사항
- HTML의 `crossorigin` → React의 `crossOrigin` (camelCase)
- 자가 닫힘 태그 사용: `<script />` 형태

#### 스크립트 속성
- `async`: 비동기 로딩으로 페이지 성능 최적화
- `crossOrigin="anonymous"`: CORS 정책 준수

### 4. 영향 받는 페이지
- **메인 페이지**: `/` 
- **카테고리별 글 페이지**: `/[category]/[slug]`
- **시리즈 페이지**: `/series`, `/series/[seriesName]`
- **기타 모든 페이지**: 404, sitemap, robots.txt 등

## 테스트 방법

### 1. 로컬 개발 환경 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 2. 브라우저 개발자 도구 확인
1. F12로 개발자 도구 열기
2. Elements 탭에서 `<head>` 섹션 확인
3. AdSense 스크립트가 정상적으로 로드되는지 확인
4. Network 탭에서 스크립트 요청 상태 확인

### 3. 페이지별 확인 항목
- [ ] 메인 페이지 (`/`)
- [ ] 개별 글 페이지 (예: `/stock/sample-post`)
- [ ] 시리즈 페이지 (`/series`)
- [ ] 404 페이지

### 5. 예상 HTML 결과
```html
<head>
  <!-- 기존 메타태그들... -->
  <!-- 기존 스크립트들... -->
  
  <!-- Google AdSense (새로 추가됨) -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8868959494983515" crossorigin="anonymous"></script>
</head>
```

## 배포 및 검증

### 1. 배포 단계
1. 코드 수정 후 테스트
2. Git commit & push
3. 프로덕션 배포
4. 배포 후 검증

### 2. AdSense 승인 프로세스
1. 스크립트 배포 완료 후 24-48시간 대기
2. Google AdSense 계정에서 사이트 검토 요청
3. Google의 사이트 검토 대기 (보통 1-14일)
4. 승인 후 광고 설정 진행

### 3. 배포 후 확인사항
- [ ] 프로덕션 환경에서 스크립트 로드 확인
- [ ] 페이지 로딩 속도 영향 없음 확인
- [ ] 모든 페이지에서 스크립트 정상 작동 확인
- [ ] Google AdSense 계정에서 사이트 연결 상태 확인

## 트러블슈팅

### 스크립트가 로드되지 않는 경우
1. 브라우저 캐시 삭제
2. 네트워크 환경 확인 (광고 차단기 비활성화)
3. 브라우저 콘솔에서 에러 메시지 확인

### AdSense 승인이 지연되는 경우
1. 사이트 콘텐츠 품질 점검
2. 개인정보처리방침, 이용약관 페이지 추가
3. 충분한 양질의 콘텐츠 확보 후 재신청
