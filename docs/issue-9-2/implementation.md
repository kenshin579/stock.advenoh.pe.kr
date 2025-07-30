# Implementation: client_nextjs 폴더 파일들을 루트로 이동

## 구현 개요
PRD에 정의된 요구사항을 바탕으로 `client_nextjs` 폴더의 파일들을 루트로 이동하는 실제 구현 계획입니다.

## Phase 1: 준비 작업

### 1.1 현재 상태 백업
```bash
# 현재 상태 백업
cp -r client_nextjs client_nextjs_backup
git add .
git commit -m "Backup before client_nextjs migration"
```

### 1.2 의존성 분석
- 루트 `package.json`과 `client_nextjs/package.json` 비교
- 중복 의존성 식별 및 버전 충돌 확인
- Next.js 관련 의존성 목록 작성

### 1.3 설정 파일 비교 분석
- TypeScript 설정 비교 (`tsconfig.json`)
- Tailwind CSS 설정 비교 (`tailwind.config.*`)
- PostCSS 설정 비교 (`postcss.config.*`)
- ESLint 설정 비교 (`eslint.config.*`, `.eslintrc.json`)

## Phase 2: 파일 이동

### 2.1 Next.js 설정 파일 이동
```bash
# Next.js 설정 파일 이동
mv client_nextjs/next.config.ts ./
mv client_nextjs/next-env.d.ts ./
```

### 2.2 소스 코드 이동
```bash
# src 폴더 이동
mv client_nextjs/src ./
```

### 2.3 정적 파일 이동
```bash
# public/contents 폴더 이동 (이미지 파일들)
mkdir -p public/contents
mv client_nextjs/public/contents/* public/contents/
```

### 2.4 성능 및 테스트 파일 이동
```bash
# 성능 관련 파일 이동
mv client_nextjs/lighthouse-report.json ./
mv client_nextjs/lighthouserc.json ./
mv client_nextjs/test-performance.sh ./
```

### 2.5 문서 파일 이동
```bash
# README 통합
cp client_nextjs/README.md README_nextjs.md
# 기존 README와 통합 작업 필요
```

## Phase 3: 설정 통합

### 3.1 package.json 통합
```json
{
  "name": "stock-advenoh-pe-kr",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "dev:nextjs": "next dev",
    "build": "npm run build:nextjs",
    "build:nextjs": "next build",
    "start": "NODE_ENV=production node dist/index.js",
    "start:nextjs": "next start -p $PORT",
    "check": "tsc",
    "lint": "next lint",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    // 기존 서버 의존성 + Next.js 의존성 통합
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.39.1",
    "express": "^4.21.2",
    "next": "15.4.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    // ... 기타 의존성
  }
}
```

### 3.2 TypeScript 설정 통합
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    "server/**/*.ts",
    "shared/**/*.ts",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### 3.3 Tailwind CSS 설정 통합
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 기존 테마 설정 유지
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // 기존 색상 설정 유지
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ... 기타 색상
      },
      // 추가 차트 및 사이드바 색상
      chart: {
        "1": "var(--chart-1)",
        "2": "var(--chart-2)",
        "3": "var(--chart-3)",
        "4": "var(--chart-4)",
        "5": "var(--chart-5)",
      },
      sidebar: {
        DEFAULT: "var(--sidebar-background)",
        foreground: "var(--sidebar-foreground)",
        // ... 사이드바 색상
      }
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
```

### 3.4 PostCSS 설정 통합
```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

### 3.5 ESLint 설정 통합
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // 커스텀 규칙
    },
  },
];

export default eslintConfig;
```

## Phase 4: 경로 및 참조 수정

### 4.1 소스 코드 경로 수정
```bash
# 모든 import 경로 업데이트
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@/|./src/|g'
```

### 4.2 정적 파일 경로 수정
```typescript
// src/components/markdown-image.tsx 수정
// 이미지 경로는 /contents/로 유지 (public/contents/에 있으므로)
imageSrc = `/contents/${categoryDir}/${slug}/${src}`;
```

### 4.3 콘텐츠 파일 경로 수정
```typescript
// src/lib/blog-server.ts 수정
const postsDirectory = path.join(process.cwd(), 'contents');
// 루트의 contents 폴더를 그대로 사용
```

## Phase 5: 빌드 및 배포 설정

### 5.1 Next.js 빌드 설정
```typescript
// next.config.ts 수정
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 기존 설정 유지
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['stock.advenoh.pe.kr'],
    formats: ['image/webp', 'image/avif'],
  },
  // 경로 설정 추가
  experimental: {
    // 기존 설정 유지
  },
  // 정적 파일 서빙 설정
  async rewrites() {
    return [
      {
        source: '/contents/:path*',
        destination: '/contents/:path*',
      },
    ];
  },
};

export default nextConfig;
```

### 5.2 Express 서버와 Next.js 통합
```typescript
// server/index.ts 수정
import { createServer } from 'http';
import express from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

export async function createApp() {
  const app = express();
  
  // 기존 Express 라우트 설정
  // ...
  
  // Next.js 핸들러 추가
  app.all('*', (req, res) => {
    return handle(req, res);
  });
  
  return app;
}
```

### 5.3 Replit 배포 설정
```toml
# replit.toml 수정
run = "npm run dev"
entrypoint = "server/index.ts"

[nix]
channel = "stable-23_11"

[env]
NODE_ENV = "development"

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
guessImports = true

[languages.javascript]
pattern = "**/*.{js,jsx,ts,tsx}"
syntax = "javascript"

[languages.javascript.languageServer]
start = [ "typescript-language-server", "--stdio" ]
```

## Phase 6: 의존성 관리

### 6.1 중복 의존성 제거
```bash
# client_nextjs node_modules 삭제
rm -rf client_nextjs/node_modules
rm -rf client_nextjs/package-lock.json

# 루트에서 의존성 재설치
npm install
```

### 6.2 패키지 버전 충돌 해결
```json
{
  "resolutions": {
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "typescript": "5.6.3"
  }
}
```

## Phase 7: 테스트 및 검증

### 7.1 기능 테스트
```bash
# 개발 서버 실행 테스트
npm run dev

# Next.js 개발 서버 실행 테스트
npm run dev:nextjs

# 빌드 테스트
npm run build
```

### 7.2 성능 테스트
```bash
# Lighthouse 성능 테스트
npm run test-performance

# 번들 크기 확인
npm run build && npx @next/bundle-analyzer
```

### 7.3 개발 환경 테스트
```bash
# TypeScript 컴파일 확인
npm run check

# ESLint 검사
npm run lint
```

## Phase 8: 정리 작업

### 8.1 중복 파일 제거
```bash
# client_nextjs 폴더 정리
rm -rf client_nextjs/.next
rm -rf client_nextjs/public
rm -rf client_nextjs/src
# 설정 파일들도 이미 이동했으므로 삭제
```

### 8.2 불필요한 폴더 정리
```bash
# 빈 폴더 정리
find . -type d -empty -delete
```

### 8.3 문서 업데이트
- README.md 통합 및 업데이트
- 개발 가이드 문서 작성
- 배포 가이드 문서 작성

## 완료 후 검증 체크리스트

### 기능적 검증
- [ ] Next.js 애플리케이션이 루트에서 정상 실행
- [ ] Express 서버와 Next.js가 통합되어 동작
- [ ] 모든 페이지와 기능이 정상 동작
- [ ] 정적 파일이 정상적으로 서빙됨
- [ ] 마크다운 콘텐츠가 정상적으로 로드됨
- [ ] 이미지 파일이 정상적으로 표시됨

### 성능 검증
- [ ] 빌드 시간이 기존과 동일하거나 개선됨
- [ ] Lighthouse 성능 점수가 유지되거나 개선됨
- [ ] 번들 크기가 최적화됨
- [ ] 페이지 로딩 속도가 유지됨

### 개발 경험 검증
- [ ] 개발 서버가 정상적으로 실행됨
- [ ] 핫 리로드가 정상 동작함
- [ ] TypeScript 오류가 없음
- [ ] ESLint 경고가 최소화됨
- [ ] IDE에서 경로 해석이 정상 동작함

## 롤백 계획

### 문제 발생시 롤백 절차
1. 백업된 `client_nextjs_backup` 폴더 복원
2. 루트에서 이동된 파일들 제거
3. 원래 설정 파일들 복원
4. 의존성 재설치
5. 기능 테스트 수행

### 롤백 명령어
```bash
# 롤백 실행
rm -rf client_nextjs
mv client_nextjs_backup client_nextjs
git reset --hard HEAD~1
npm install
``` 