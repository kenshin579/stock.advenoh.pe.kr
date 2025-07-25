
# SEO 개선 및 Google Search Console 색인 최적화 PRD

## 1. 개요

### 프로젝트 배경
- Google Search Console에 웹사이트가 등록되어 있음
- RSS, sitemap, robots.txt가 모두 등록된 상태
- 하지만 색인이 제대로 되지 않는 문제 발생
- 검색 노출 개선이 필요한 상황

### 목표
- Google 검색 결과에서의 색인율 향상
- 페이지별 SEO 최적화
- 검색 엔진 크롤링 효율성 개선
- 사용자 검색 유입 증대

## 2. 현재 상태 분석

### 기술적 현황
- **도메인**: `stock.advenoh.pe.kr`
- **서버**: Express.js 기반
- **클라이언트**: React + Vite
- **콘텐츠**: 투자 관련 블로그 (주식, ETF, 채권, 펀드)
- **배포**: Static 배포 지원

### SEO 관련 기능
✅ **구현 완료**
- sitemap.xml 자동 생성 (`/sitemap.xml`)
- robots.txt 제공 (`/robots.txt`)
- RSS 피드 (`/rss.xml`)
- SEO Head 컴포넌트
- 정적 사이트 생성

❌ **개선 필요**
- 메타 태그 최적화
- 구조화된 데이터 (Schema.org)
- 페이지 로딩 속도
- 내부 링크 구조
- 이미지 SEO

## 3. 문제점 분석

### Google Search Console 이슈
1. **색인 등록 문제**
   - 사이트맵 제출했으나 색인율 낮음
   - 개별 페이지 색인 요청 필요할 수 있음

2. **크롤링 효율성**
   - 페이지 구조 최적화 필요
   - 내부 링크 구조 개선 필요

3. **콘텐츠 품질**
   - 메타 디스크립션 최적화
   - 제목 태그 개선
   - 키워드 밀도 조정

## 4. 개선 방안

### 4.1 기술적 SEO 개선

#### A. 메타 태그 최적화
- 각 페이지별 고유한 title 태그
- 메타 디스크립션 150-160자 최적화
- Open Graph 태그 완성도 향상
- Twitter Card 메타 태그 추가

#### B. 구조화된 데이터 추가
- Blog 스키마 구현
- Article 스키마 구현
- BreadcrumbList 스키마
- Organization 스키마

#### C. 사이트맵 최적화
- 우선순위(priority) 값 재조정
- changefreq 값 최적화
- 이미지 사이트맵 추가
- 사이트맵 인덱스 파일 구현

### 4.2 콘텐츠 SEO 개선

#### A. URL 구조 최적화
- 의미있는 URL 슬러그 확인
- 카테고리별 URL 구조 정리
- 중복 URL 제거

#### B. 내부 링크 구조
- 관련 포스트 링크 추가
- 카테고리 간 연결 강화
- 시리즈 포스트 연결 개선

#### C. 이미지 SEO
- alt 태그 최적화
- 이미지 파일명 최적화
- WebP 형식 지원

### 4.3 성능 최적화

#### A. Core Web Vitals 개선
- LCP (Largest Contentful Paint) 최적화
- FID (First Input Delay) 개선
- CLS (Cumulative Layout Shift) 최소화

#### B. 로딩 속도 개선
- 이미지 lazy loading
- CSS/JS 번들 최적화
- 캐싱 헤더 설정

## 5. 구현 우선순위

### Phase 1: 즉시 구현 (1-2일)
1. 메타 태그 최적화
2. 구조화된 데이터 기본 구현
3. robots.txt 최적화
4. 사이트맵 우선순위 조정

### Phase 2: 단기 구현 (1주)
1. 이미지 SEO 개선
2. 내부 링크 구조 강화
3. 성능 최적화 기본 작업
4. Google Search Console 재검증

### Phase 3: 중기 구현 (2-3주)
1. Core Web Vitals 최적화
2. 고급 구조화된 데이터
3. 추가 사이트맵 (이미지, 뉴스)
4. A/B 테스트 및 모니터링

## 6. 성공 지표

### 정량적 지표
- Google Search Console 색인 페이지 수 증가
- 검색 노출 수 (Impressions) 증가
- 검색 클릭 수 증가
- 평균 검색 순위 개선
- Core Web Vitals 점수 개선

### 정성적 지표
- 검색 품질 향상
- 사용자 만족도 증대
- 브랜드 인지도 향상

## 7. 리스크 및 대응 방안

### 기술적 리스크
- 정적 배포 시 SEO 기능 제한 → 빌드 타임 SEO 데이터 생성
- 대용량 이미지 로딩 → WebP 변환 및 CDN 고려

### 콘텐츠 리스크
- 키워드 과최적화 → 자연스러운 키워드 배치
- 중복 콘텐츠 → 고유성 확보

## 8. 일정 및 리소스

### 개발 일정
- Phase 1: 2일
- Phase 2: 5일  
- Phase 3: 10일
- 총 소요 기간: 3주

### 필요 리소스
- 개발자 1명 (풀타임)
- SEO 전문가 자문 (선택사항)
- 콘텐츠 검토 시간

## 9. 다음 단계

1. **PRD 리뷰 및 승인**
2. **Phase 1 구현 시작**
3. **Google Search Console 모니터링 체계 구축**
4. **정기적인 SEO 성과 리뷰 일정 수립**

## 10. 참고 문서

- 구현 세부사항: [docs/issue-2/implementation.md](./implementation.md)
- 기술 스택 및 도구 고려사항은 구현 문서 참조

---

*이 문서는 SEO 개선을 위한 종합적인 계획을 담고 있으며, 실제 구현 시 우선순위에 따라 단계적으로 진행될 예정입니다.*
