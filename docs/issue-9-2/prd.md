# PRD: client_nextjs 폴더 파일들을 루트로 이동

## 개요
현재 `client_nextjs` 서브폴더에 있는 Next.js 프로젝트 파일들을 루트 디렉토리로 이동하여 프로젝트 구조를 단순화하고 관리 효율성을 향상시킵니다.

## 목표
- Next.js 애플리케이션을 루트에서 실행할 수 있도록 설정
- 프로젝트 구조 단순화
- 빌드 및 배포 프로세스 통합
- 개발 환경 일원화

## 현재 상황 분석

### client_nextjs 폴더 구조
```
client_nextjs/
├── .next/                    # Next.js 빌드 결과물
├── node_modules/             # 의존성 (루트에도 존재)
├── public/                   # 정적 파일
│   └── contents/            # 콘텐츠 파일들
├── src/                     # 소스 코드
├── package.json             # Next.js 의존성
├── package-lock.json        # 의존성 잠금 파일
├── next.config.ts           # Next.js 설정
├── next-env.d.ts           # Next.js 타입 정의
├── tsconfig.json           # TypeScript 설정
├── tailwind.config.js      # Tailwind CSS 설정
├── postcss.config.mjs      # PostCSS 설정
├── eslint.config.mjs       # ESLint 설정
├── .eslintrc.json          # ESLint 설정
├── .gitignore              # Git 무시 파일
├── lighthouse-report.json  # 성능 리포트
├── lighthouserc.json       # Lighthouse 설정
├── test-performance.sh     # 성능 테스트 스크립트
└── README.md               # 프로젝트 문서
```

### 루트 폴더 구조
```
/
├── server/                  # Express 서버
├── shared/                  # 공유 스키마
├── contents/                # 마크다운 콘텐츠 (블로그 포스트 소스)
├── public/                  # 정적 파일 (이미지 등)
├── package.json             # 서버 + 클라이언트 통합 의존성
├── tsconfig.json           # 서버 TypeScript 설정
├── tailwind.config.ts      # 서버 Tailwind 설정
├── postcss.config.js       # 서버 PostCSS 설정
├── drizzle.config.ts       # 데이터베이스 설정
└── .gitignore              # Git 무시 파일
```

## 요구사항

### 1. 파일 이동 작업

#### 1.1 Next.js 설정 파일 이동
- [ ] `client_nextjs/next.config.ts` → 루트로 이동
- [ ] `client_nextjs/next-env.d.ts` → 루트로 이동
- [ ] `client_nextjs/tsconfig.json` → 루트로 이동 (기존 파일과 통합 또는 대체)
- [ ] `client_nextjs/tailwind.config.js` → 루트로 이동 (기존 파일과 통합 또는 대체)
- [ ] `client_nextjs/postcss.config.mjs` → 루트로 이동 (기존 파일과 통합 또는 대체)

#### 1.2 ESLint 설정 이동
- [ ] `client_nextjs/eslint.config.mjs` → 루트로 이동
- [ ] `client_nextjs/.eslintrc.json` → 루트로 이동

#### 1.3 성능 및 테스트 파일 이동
- [ ] `client_nextjs/lighthouse-report.json` → 루트로 이동
- [ ] `client_nextjs/lighthouserc.json` → 루트로 이동
- [ ] `client_nextjs/test-performance.sh` → 루트로 이동

#### 1.4 문서 파일 이동
- [ ] `client_nextjs/README.md` → 루트로 이동 (기존 파일과 통합)

#### 1.5 정적 파일 이동
- [ ] `client_nextjs/public/contents/` → 루트 `public/contents/`로 이동 (이미지 파일들)
- [ ] 루트 `contents/` 폴더는 마크다운 소스 파일이므로 그대로 유지
- [ ] 이미지 경로 참조 코드 수정 (`/contents/` 경로 유지)

### 2. 설정 파일 통합 및 수정

#### 2.1 package.json 통합
- [ ] `client_nextjs/package.json`의 의존성을 루트 `package.json`에 통합
- [ ] Next.js 관련 스크립트를 루트 `package.json`에 추가
- [ ] 중복 의존성 제거 및 버전 통일
- [ ] `client_nextjs/node_modules/` 삭제
- [ ] 루트 `node_modules/`에서 모든 의존성 관리

#### 2.2 TypeScript 설정 통합
- [ ] 루트 `tsconfig.json`을 Next.js 프로젝트에 맞게 수정
- [ ] 경로 매핑 업데이트 (`@/*` → `./src/*`)
- [ ] Next.js 타입 지원 추가

#### 2.3 Tailwind CSS 설정 통합
- [ ] 루트 `tailwind.config.ts`를 Next.js 프로젝트에 맞게 수정
- [ ] content 경로 업데이트 (`./src/**/*.{js,ts,jsx,tsx,mdx}`)
- [ ] 플러그인 및 테마 설정 통합

#### 2.4 PostCSS 설정 통합
- [ ] 루트 `postcss.config.js`를 Next.js 프로젝트에 맞게 수정
- [ ] 플러그인 설정 통합

#### 2.5 ESLint 설정 통합
- [ ] 루트 ESLint 설정을 Next.js 프로젝트에 맞게 수정
- [ ] Next.js ESLint 규칙 추가

### 3. 경로 및 참조 수정

#### 3.1 소스 코드 경로 수정
- [ ] `client_nextjs/src/` → 루트 `src/`로 이동
- [ ] 모든 import 경로 업데이트
- [ ] 절대 경로 참조 수정

#### 3.2 정적 파일 경로 수정
- [ ] `public/` 폴더 통합
- [ ] 이미지 및 기타 정적 파일 경로 업데이트
- [ ] Next.js Image 컴포넌트 경로 수정

#### 3.3 콘텐츠 파일 경로 수정
- [ ] `contents/` 폴더 통합
- [ ] 마크다운 파일 참조 경로 업데이트
- [ ] 콘텐츠 로딩 로직 수정

### 4. 빌드 및 배포 설정

#### 4.1 Next.js 빌드 설정
- [ ] 루트에서 Next.js 빌드 가능하도록 설정
- [ ] Express 서버와 Next.js 통합
- [ ] 정적 파일 서빙 설정

#### 4.2 개발 환경 설정
- [ ] 개발 서버 실행 스크립트 수정
- [ ] 핫 리로드 설정
- [ ] 환경 변수 설정

#### 4.3 배포 설정
- [ ] Replit 배포 설정 업데이트
- [ ] 빌드 프로세스 통합
- [ ] 정적 파일 서빙 최적화

### 5. 의존성 관리

#### 5.1 중복 의존성 제거
- [ ] 패키지 버전 충돌 해결
- [ ] 통합된 의존성 관리 검증

#### 5.2 개발 의존성 통합
- [ ] TypeScript 설정 통합
- [ ] ESLint 설정 통합
- [ ] Prettier 설정 통합 (있는 경우)

### 6. 테스트 및 검증

#### 6.1 기능 테스트
- [ ] Next.js 애플리케이션 정상 동작 확인
- [ ] Express 서버와 Next.js 통합 동작 확인
- [ ] 정적 파일 서빙 확인
- [ ] 콘텐츠 로딩 확인

#### 6.2 성능 테스트
- [ ] Lighthouse 성능 테스트 실행
- [ ] 빌드 시간 측정
- [ ] 번들 크기 확인

#### 6.3 개발 환경 테스트
- [ ] 개발 서버 정상 실행 확인
- [ ] 핫 리로드 동작 확인
- [ ] TypeScript 컴파일 확인

## 제약사항

### 1. 기존 기능 유지
- Express 서버 기능이 손상되지 않아야 함
- 기존 API 엔드포인트가 정상 동작해야 함
- 데이터베이스 연결이 유지되어야 함

### 2. 호환성 유지
- Replit 환경에서 정상 동작해야 함
- 기존 배포 프로세스와 호환되어야 함
- 환경 변수 설정이 유지되어야 함

### 3. 성능 유지
- 빌드 시간이 크게 증가하지 않아야 함
- 런타임 성능이 저하되지 않아야 함
- 번들 크기가 최적화되어야 함

## 위험 요소

### 1. 경로 충돌
- 기존 파일과 새로 이동하는 파일 간의 충돌 가능성
- import 경로 변경으로 인한 오류 발생 가능성

### 2. 의존성 충돌
- 서버와 클라이언트 의존성 간의 버전 충돌
- TypeScript 설정 충돌

### 3. 빌드 실패
- 설정 파일 통합 과정에서 빌드 실패 가능성
- 환경별 설정 차이로 인한 문제

## 성공 기준

### 1. 기능적 기준
- [ ] Next.js 애플리케이션이 루트에서 정상 실행
- [ ] Express 서버와 Next.js가 통합되어 동작
- [ ] 모든 페이지와 기능이 정상 동작
- [ ] 정적 파일이 정상적으로 서빙됨

### 2. 성능 기준
- [ ] 빌드 시간이 기존과 동일하거나 개선됨
- [ ] Lighthouse 성능 점수가 유지되거나 개선됨
- [ ] 번들 크기가 최적화됨

### 3. 개발 경험 기준
- [ ] 개발 서버가 정상적으로 실행됨
- [ ] 핫 리로드가 정상 동작함
- [ ] TypeScript 오류가 없음
- [ ] ESLint 경고가 최소화됨

## 마이그레이션 계획

### Phase 1: 준비 작업
1. 현재 상태 백업
2. 의존성 분석 및 충돌 확인
3. 설정 파일 비교 분석

### Phase 2: 파일 이동
1. Next.js 설정 파일 이동
2. 소스 코드 이동
3. 정적 파일 이동

### Phase 3: 설정 통합
1. package.json 통합
2. TypeScript 설정 통합
3. Tailwind CSS 설정 통합

### Phase 4: 테스트 및 검증
1. 기능 테스트
2. 성능 테스트
3. 개발 환경 테스트

### Phase 5: 정리 작업
1. 중복 파일 제거
2. 불필요한 폴더 정리
3. 문서 업데이트

## 완료 후 예상 구조

```
/
├── src/                     # Next.js 소스 코드
│   ├── app/                # App Router
│   ├── components/         # React 컴포넌트
│   ├── hooks/             # 커스텀 훅
│   ├── lib/               # 유틸리티
│   └── types/             # TypeScript 타입
├── server/                 # Express 서버
├── shared/                 # 공유 스키마
├── public/                 # 정적 파일
│   ├── contents/          # 이미지 파일들 (블로그 포스트 이미지)
│   └── ...                # 기타 정적 파일
├── contents/               # 마크다운 콘텐츠 (블로그 포스트 소스)
├── package.json            # 통합된 의존성 (서버 + 클라이언트)
├── next.config.ts          # Next.js 설정
├── tsconfig.json          # TypeScript 설정
├── tailwind.config.ts     # Tailwind CSS 설정
├── postcss.config.js      # PostCSS 설정
├── eslint.config.mjs      # ESLint 설정
├── drizzle.config.ts      # 데이터베이스 설정
└── ...                    # 기타 설정 파일
``` 