# TODO: client_nextjs 폴더 파일들을 루트로 이동

## 📋 작업 개요
PRD와 Implementation 문서를 기반으로 실제 수행할 작업 목록입니다.

## 🚀 Phase 1: 준비 작업

### 1.1 현재 상태 백업
- [ ] `client_nextjs` 폴더 전체 백업
  ```bash
  cp -r client_nextjs client_nextjs_backup
  ```
- [ ] Git 커밋으로 현재 상태 저장
  ```bash
  git add .
  git commit -m "Backup before client_nextjs migration"
  ```

### 1.2 의존성 분석
- [ ] 루트 `package.json`과 `client_nextjs/package.json` 비교 분석
- [ ] 중복 의존성 목록 작성
- [ ] 버전 충돌 가능성 확인
- [ ] Next.js 관련 의존성 목록 작성

### 1.3 설정 파일 비교 분석
- [ ] TypeScript 설정 비교 (`tsconfig.json`)
- [ ] Tailwind CSS 설정 비교 (`tailwind.config.*`)
- [ ] PostCSS 설정 비교 (`postcss.config.*`)
- [ ] ESLint 설정 비교 (`eslint.config.*`, `.eslintrc.json`)

### 1.4 Phase 1 테스트
- [ ] 백업 폴더가 정상적으로 생성되었는지 확인
  ```bash
  ls -la client_nextjs_backup/
  ```
- [ ] Git 커밋이 정상적으로 생성되었는지 확인
  ```bash
  git log --oneline -1
  ```
- [ ] 의존성 분석 결과 문서화
- [ ] 설정 파일 비교 결과 문서화

## 📁 Phase 2: 파일 이동

### 2.1 Next.js 설정 파일 이동
- [ ] `client_nextjs/next.config.ts` → 루트로 이동
- [ ] `client_nextjs/next-env.d.ts` → 루트로 이동

### 2.2 소스 코드 이동
- [ ] `client_nextjs/src/` → 루트 `src/`로 이동
- [ ] 이동 후 폴더 구조 확인

### 2.3 정적 파일 이동
- [ ] `public/contents/` 폴더 생성
- [ ] `client_nextjs/public/contents/*` → `public/contents/`로 이동
- [ ] 이미지 파일 이동 확인

### 2.4 성능 및 테스트 파일 이동
- [ ] `client_nextjs/lighthouse-report.json` → 루트로 이동
- [ ] `client_nextjs/lighthouserc.json` → 루트로 이동
- [ ] `client_nextjs/test-performance.sh` → 루트로 이동

### 2.5 문서 파일 이동
- [ ] `client_nextjs/README.md` → `README_nextjs.md`로 복사
- [ ] 기존 README와 통합 계획 수립

### 2.6 Phase 2 테스트
- [ ] Next.js 설정 파일이 루트에 정상적으로 이동되었는지 확인
  ```bash
  ls -la next.config.ts next-env.d.ts
  ```
- [ ] src 폴더가 루트에 정상적으로 이동되었는지 확인
  ```bash
  ls -la src/
  ```
- [ ] public/contents 폴더가 정상적으로 생성되었는지 확인
  ```bash
  ls -la public/contents/
  ```
- [ ] 성능 관련 파일들이 루트에 정상적으로 이동되었는지 확인
  ```bash
  ls -la lighthouse-report.json lighthouserc.json test-performance.sh
  ```
- [ ] 문서 파일이 정상적으로 복사되었는지 확인
  ```bash
  ls -la README_nextjs.md
  ```

## ⚙️ Phase 3: 설정 통합

### 3.1 package.json 통합
- [ ] 루트 `package.json`에 Next.js 의존성 추가
- [ ] 중복 의존성 제거 및 버전 통일
- [ ] Next.js 관련 스크립트 추가
  - `dev:nextjs`
  - `build:nextjs`
  - `start:nextjs`
  - `lint`
- [ ] 의존성 설치 테스트

### 3.2 TypeScript 설정 통합
- [ ] 루트 `tsconfig.json`을 Next.js 프로젝트에 맞게 수정
- [ ] 경로 매핑 업데이트 (`@/*` → `./src/*`)
- [ ] Next.js 타입 지원 추가
- [ ] TypeScript 컴파일 테스트

### 3.3 Tailwind CSS 설정 통합
- [ ] 루트 `tailwind.config.ts`를 Next.js 프로젝트에 맞게 수정
- [ ] content 경로 업데이트 (`./src/**/*.{js,ts,jsx,tsx,mdx}`)
- [ ] 플러그인 및 테마 설정 통합
- [ ] Tailwind CSS 빌드 테스트

### 3.4 PostCSS 설정 통합
- [ ] 루트 `postcss.config.js`를 Next.js 프로젝트에 맞게 수정
- [ ] 플러그인 설정 통합
- [ ] PostCSS 빌드 테스트

### 3.5 ESLint 설정 통합
- [ ] 루트 ESLint 설정을 Next.js 프로젝트에 맞게 수정
- [ ] Next.js ESLint 규칙 추가
- [ ] ESLint 검사 테스트

### 3.6 Phase 3 테스트
- [ ] package.json 통합 후 의존성 설치 테스트
  ```bash
  npm install
  ```
- [ ] TypeScript 설정 통합 후 컴파일 테스트
  ```bash
  npx tsc --noEmit
  ```
- [ ] Tailwind CSS 설정 통합 후 빌드 테스트
  ```bash
  npx tailwindcss --input src/app/globals.css --output test.css
  ```
- [ ] PostCSS 설정 통합 후 빌드 테스트
  ```bash
  npx postcss src/app/globals.css --output test.css
  ```
- [ ] ESLint 설정 통합 후 검사 테스트
  ```bash
  npx eslint src/ --ext .ts,.tsx
  ```

## 🔗 Phase 4: 경로 및 참조 수정

### 4.1 소스 코드 경로 수정
- [ ] 모든 import 경로 업데이트
  ```bash
  find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/|./src/|g'
  ```
- [ ] 절대 경로 참조 수정 확인
- [ ] TypeScript 경로 해석 테스트

### 4.2 정적 파일 경로 수정
- [ ] `src/components/markdown-image.tsx` 경로 확인
- [ ] 이미지 경로가 `/contents/`로 올바르게 참조되는지 확인
- [ ] 정적 파일 서빙 테스트

### 4.3 콘텐츠 파일 경로 수정
- [ ] `src/lib/blog-server.ts` 경로 확인
- [ ] 마크다운 파일이 루트 `contents/` 폴더에서 올바르게 읽히는지 확인
- [ ] 콘텐츠 로딩 테스트

### 4.4 Phase 4 테스트
- [ ] import 경로 수정 후 TypeScript 컴파일 테스트
  ```bash
  npx tsc --noEmit
  ```
- [ ] 절대 경로 참조가 올바르게 해석되는지 확인
  ```bash
  npx tsc --noEmit --traceResolution
  ```
- [ ] 정적 파일 경로가 올바르게 참조되는지 확인
  ```bash
  grep -r "/contents/" src/components/markdown-image.tsx
  ```
- [ ] 콘텐츠 파일 경로가 올바르게 설정되는지 확인
  ```bash
  grep -r "contents" src/lib/blog-server.ts
  ```

## 🏗️ Phase 5: 빌드 및 배포 설정

### 5.1 Next.js 빌드 설정
- [ ] `next.config.ts` 수정
- [ ] 정적 파일 서빙 설정 추가
- [ ] 이미지 최적화 설정 확인
- [ ] Next.js 빌드 테스트

### 5.2 Express 서버와 Next.js 통합
- [ ] `server/index.ts` 수정
- [ ] Next.js 핸들러 추가
- [ ] Express 라우트와 Next.js 라우트 통합
- [ ] 통합 서버 실행 테스트

### 5.3 Replit 배포 설정
- [ ] `replit.toml` 수정
- [ ] 환경 변수 설정 확인
- [ ] Replit에서 배포 테스트

### 5.4 Phase 5 테스트
- [ ] Next.js 빌드 설정 후 빌드 테스트
  ```bash
  npm run build:nextjs
  ```
- [ ] Express 서버와 Next.js 통합 후 서버 실행 테스트
  ```bash
  npm run dev
  ```
- [ ] 정적 파일 서빙이 올바르게 동작하는지 확인
  ```bash
  curl -I http://localhost:3000/contents/test-image.png
  ```
- [ ] Replit 배포 설정 후 로컬 테스트
  ```bash
  npm run start
  ```

## 📦 Phase 6: 의존성 관리

### 6.1 중복 의존성 제거
- [ ] `client_nextjs/node_modules/` 삭제
- [ ] `client_nextjs/package-lock.json` 삭제
- [ ] 루트에서 의존성 재설치
- [ ] 의존성 충돌 해결

### 6.2 패키지 버전 충돌 해결
- [ ] React 버전 통일 (19.1.0)
- [ ] React DOM 버전 통일 (19.1.0)
- [ ] TypeScript 버전 통일 (5.6.3)
- [ ] 기타 충돌 패키지 해결

### 6.3 Phase 6 테스트
- [ ] 중복 의존성 제거 후 의존성 설치 테스트
  ```bash
  npm install
  ```
- [ ] 패키지 버전 충돌 해결 후 빌드 테스트
  ```bash
  npm run build
  ```
- [ ] 의존성 트리 확인
  ```bash
  npm ls --depth=0
  ```
- [ ] 중복 패키지 확인
  ```bash
  npm ls react react-dom typescript
  ```

## 🧪 Phase 7: 테스트 및 검증

### 7.1 기능 테스트
- [ ] 개발 서버 실행 테스트
  ```bash
  npm run dev
  ```
- [ ] Next.js 개발 서버 실행 테스트
  ```bash
  npm run dev:nextjs
  ```
- [ ] 빌드 테스트
  ```bash
  npm run build
  ```
- [ ] 모든 페이지 접근 테스트
- [ ] 블로그 포스트 로딩 테스트
- [ ] 이미지 표시 테스트

### 7.2 성능 테스트
- [ ] Lighthouse 성능 테스트
  ```bash
  npm run test-performance
  ```
- [ ] 번들 크기 확인
  ```bash
  npm run build && npx @next/bundle-analyzer
  ```
- [ ] 페이지 로딩 속도 측정

### 7.3 개발 환경 테스트
- [ ] TypeScript 컴파일 확인
  ```bash
  npm run check
  ```
- [ ] ESLint 검사
  ```bash
  npm run lint
  ```
- [ ] IDE에서 경로 해석 확인
- [ ] 핫 리로드 동작 확인

### 7.4 Phase 7 테스트
- [ ] 기능 테스트 결과 문서화
- [ ] 성능 테스트 결과 문서화
- [ ] 개발 환경 테스트 결과 문서화
- [ ] 발견된 문제점 목록 작성
- [ ] 문제점 해결 후 재테스트

## 🧹 Phase 8: 정리 작업

### 8.1 중복 파일 제거
- [ ] `client_nextjs/.next/` 삭제
- [ ] `client_nextjs/public/` 삭제 (이미 이동됨)
- [ ] `client_nextjs/src/` 삭제 (이미 이동됨)
- [ ] 이동된 설정 파일들 삭제
- [ ] 빈 폴더 정리

### 8.2 불필요한 폴더 정리
- [ ] 빈 폴더 찾기 및 삭제
  ```bash
  find . -type d -empty -delete
  ```
- [ ] 임시 파일 정리

### 8.3 문서 업데이트
- [ ] README.md 통합 및 업데이트
- [ ] 개발 가이드 문서 작성
- [ ] 배포 가이드 문서 작성
- [ ] 마이그레이션 완료 문서 작성

### 8.4 Phase 8 테스트
- [ ] 중복 파일 제거 후 프로젝트 구조 확인
  ```bash
  tree -L 3 -I 'node_modules|.git|.next'
  ```
- [ ] 빈 폴더 정리 후 폴더 구조 확인
  ```bash
  find . -type d -empty
  ```
- [ ] 문서 업데이트 후 가독성 확인
- [ ] 최종 프로젝트 구조 검증
  ```bash
  ls -la
  ```

## ✅ 최종 검증 체크리스트

### 기능적 검증
- [ ] Next.js 애플리케이션이 루트에서 정상 실행
- [ ] Express 서버와 Next.js가 통합되어 동작
- [ ] 모든 페이지와 기능이 정상 동작
- [ ] 정적 파일이 정상적으로 서빙됨
- [ ] 마크다운 콘텐츠가 정상적으로 로드됨
- [ ] 이미지 파일이 정상적으로 표시됨
- [ ] 블로그 포스트 목록이 정상적으로 표시됨
- [ ] 블로그 포스트 상세 페이지가 정상적으로 표시됨

### 성능 검증
- [ ] 빌드 시간이 기존과 동일하거나 개선됨
- [ ] Lighthouse 성능 점수가 유지되거나 개선됨
- [ ] 번들 크기가 최적화됨
- [ ] 페이지 로딩 속도가 유지됨
- [ ] 이미지 로딩 성능이 유지됨

### 개발 경험 검증
- [ ] 개발 서버가 정상적으로 실행됨
- [ ] 핫 리로드가 정상 동작함
- [ ] TypeScript 오류가 없음
- [ ] ESLint 경고가 최소화됨
- [ ] IDE에서 경로 해석이 정상 동작함
- [ ] 자동완성이 정상 동작함

### 배포 검증
- [ ] Replit에서 정상 배포됨
- [ ] 프로덕션 빌드가 정상 동작함
- [ ] 환경 변수가 올바르게 설정됨
- [ ] 정적 파일이 올바르게 서빙됨

## 🚨 롤백 계획

### 문제 발생시 롤백 절차
- [ ] 백업된 `client_nextjs_backup` 폴더 복원
- [ ] 루트에서 이동된 파일들 제거
- [ ] 원래 설정 파일들 복원
- [ ] 의존성 재설치
- [ ] 기능 테스트 수행

### 롤백 명령어
```bash
# 롤백 실행
rm -rf client_nextjs
mv client_nextjs_backup client_nextjs
git reset --hard HEAD~1
npm install
```

## 📝 작업 노트

### 주의사항
- 각 Phase 완료 후 반드시 테스트 수행
- 문제 발생시 즉시 롤백 준비
- Git 커밋을 자주 수행하여 진행 상황 저장
- 의존성 충돌 시 신중하게 해결

### 예상 소요 시간
- Phase 1: 30분 (준비 작업 + 테스트)
- Phase 2: 15분 (파일 이동 + 테스트)
- Phase 3: 45분 (설정 통합 + 테스트)
- Phase 4: 30분 (경로 수정 + 테스트)
- Phase 5: 60분 (빌드 설정 + 테스트)
- Phase 6: 30분 (의존성 관리 + 테스트)
- Phase 7: 60분 (테스트 및 검증)
- Phase 8: 30분 (정리 작업 + 테스트)
- **총 예상 시간: 5시간 30분**

### 우선순위
1. **높음**: Phase 1-3 (기본 구조 설정)
2. **중간**: Phase 4-6 (통합 및 최적화)
3. **낮음**: Phase 7-8 (테스트 및 정리) 