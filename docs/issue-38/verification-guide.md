# Google Analytics 검증 가이드

## 🔧 환경변수 설정

### 1. 환경변수 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Google Analytics Configuration
NEXT_PUBLIC_GA_ID=G-9LNH27K1YS

# Site Configuration  
SITE_URL=https://stock.advenoh.pe.kr
```

### 2. 환경별 설정
- **개발환경**: `.env.local` 사용
- **운영환경**: 호스팅 플랫폼의 환경변수 설정에서 `NEXT_PUBLIC_GA_ID` 설정

## 🔍 Google Analytics 작동 검증 방법

### 1. 브라우저 개발자 도구 검증

#### 네트워크 탭 확인
1. 웹사이트 접속
2. F12 → Network 탭 열기
3. 다음 요청들이 있는지 확인:
   - `https://www.googletagmanager.com/gtag/js?id=G-9LNH27K1YS`
   - `https://www.google-analytics.com/g/collect` (데이터 전송)

#### 콘솔 확인
1. F12 → Console 탭 열기
2. 다음 명령어 실행:
   ```javascript
   // gtag 함수 존재 확인
   typeof gtag
   // 결과: "function"이어야 함
   
   // dataLayer 배열 확인
   window.dataLayer
   // 결과: 배열이 있고 GA 관련 데이터가 포함되어야 함
   ```

### 2. Google Tag Assistant 확장 프로그램

#### 설치 및 사용
1. Chrome 웹스토어에서 "Google Tag Assistant" 확장 프로그램 설치
2. 웹사이트 접속 후 확장 프로그램 클릭
3. "Enable" 버튼 클릭 후 페이지 새로고침
4. GA4 태그가 녹색으로 표시되는지 확인

#### 확인 사항
- ✅ Google Analytics 4 (GA4) 태그 발견
- ✅ 태그 상태: Working
- ✅ 페이지뷰 이벤트 전송 확인

### 3. Google Analytics 실시간 대시보드

#### 접속 방법
1. [Google Analytics](https://analytics.google.com) 접속
2. 해당 속성 선택 (G-9LNH27K1YS)
3. 좌측 메뉴에서 "보고서" → "실시간" 클릭

#### 확인 사항
- 실시간 사용자 수 표시
- 현재 활성 페이지 목록
- 이벤트 수집 상태

### 4. 페이지별 검증

다음 페이지들에서 모두 동일하게 작동하는지 확인:

#### 메인 페이지
- URL: `/`
- 확인: 페이지뷰 이벤트 전송

#### 카테고리 글 페이지
- URL: `/[category]/[slug]` (예: `/stock/investment-tips`)
- 확인: 페이지뷰 이벤트 전송

#### 시리즈 페이지
- URL: `/series/[seriesName]`
- 확인: 페이지뷰 이벤트 전송

#### 기타 페이지
- 404 페이지, 검색 결과 페이지 등
- 확인: 모든 페이지에서 GA 코드 로드

## 🐛 문제 해결

### 1. GA 코드가 로드되지 않는 경우

#### 원인 및 해결
- **환경변수 미설정**: `.env.local`에 `NEXT_PUBLIC_GA_ID` 확인
- **빌드 필요**: `npm run build && npm run start`로 운영 빌드 테스트
- **브라우저 캐시**: 하드 새로고침 (Ctrl+Shift+R)

### 2. 실시간 데이터가 보이지 않는 경우

#### 체크리스트
- [ ] Google Analytics 대시보드에서 올바른 속성 선택
- [ ] 방화벽이나 애드블로커로 인한 차단 확인
- [ ] 개발자 도구에서 네트워크 오류 확인
- [ ] GA4 설정에서 데이터 수집 활성화 확인

### 3. 특정 페이지에서만 동작하지 않는 경우

#### 디버깅 방법
1. 해당 페이지의 HTML 소스 확인
2. `<head>` 태그 내에 GA 스크립트 포함 여부 확인
3. Next.js 라우팅 오류 확인

## 📊 성공적인 설정 확인 체크리스트

- [ ] 환경변수 (`NEXT_PUBLIC_GA_ID`) 올바르게 설정
- [ ] 개발자 도구에서 gtag 함수 확인됨
- [ ] 네트워크 탭에서 GA 스크립트 로드 확인
- [ ] Google Tag Assistant에서 GA4 태그 정상 표시
- [ ] Google Analytics 실시간 대시보드에서 데이터 확인
- [ ] 모든 주요 페이지에서 동일하게 작동
- [ ] 페이지 새로고침 및 네비게이션 시 이벤트 전송

## 🎯 추가 검증 도구

### Google Analytics Debugger
```javascript
// 콘솔에서 실행하여 디버그 모드 활성화
gtag('config', 'G-9LNH27K1YS', {
  debug_mode: true
});
```

### 실시간 이벤트 확인
```javascript
// 페이지뷰 수동 전송 테스트
gtag('event', 'page_view', {
  page_title: 'Test Page',
  page_location: window.location.href
});
```

이 가이드를 따라 검증을 완료하면 Google Analytics가 정상적으로 작동하는 것을 확인할 수 있습니다.
