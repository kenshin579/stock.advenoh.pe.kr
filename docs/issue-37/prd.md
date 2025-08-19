## 요구사항
- google adsense 활성화를 위해 <head></head> 태그 사이에 아래 애드센스 코드를 넣어줘야 한다
  - 메인 페이지, 각 article에 다 포함이 되어야 한다

```
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8868959494983515"
     crossorigin="anonymous"></script>
```

## 기술적 구현 방안

### 프로젝트 구조 분석
- Next.js App Router 사용
- `src/app/layout.tsx`가 루트 레이아웃으로 모든 페이지에 공통으로 적용됨
- 현재 Google Analytics는 이미 layout.tsx의 head 태그에 구현되어 있음

### 수정 대상 파일
- **파일**: `src/app/layout.tsx`
- **수정 위치**: `<head>` 태그 내부 (94번째 줄 근처, Google Analytics 스크립트 다음)
- **적용 범위**: 모든 페이지 (메인 페이지 + 모든 article 페이지)

### 구현 방법
1. `src/app/layout.tsx` 파일의 `<head>` 섹션에 Google AdSense 스크립트 추가
2. Google Analytics 스크립트와 동일한 방식으로 구현
3. `async` 속성과 `crossorigin="anonymous"` 속성 포함

### 코드 위치
- 기존 Google Analytics 코드 (95-106번 줄) 다음에 추가
- `{generateMetaTags(siteMetadata)}` 이후, `</head>` 태그 이전

### 예상 코드
```jsx
{/* Google AdSense */}
<script 
  async 
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8868959494983515"
  crossOrigin="anonymous"
/>
```

### 검증 방법
1. 브라우저 개발자 도구에서 head 태그에 스크립트가 정상적으로 로드되는지 확인
2. 메인 페이지(`/`)와 개별 글 페이지(`/[category]/[slug]`)에서 모두 스크립트가 포함되는지 확인
3. Google AdSense 계정에서 사이트 검토 요청 후 승인 대기

