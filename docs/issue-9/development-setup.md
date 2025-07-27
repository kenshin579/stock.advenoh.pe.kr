# 개발 환경 설정 가이드

## 개요

이 문서는 Next.js 15 + App Router 기반 블로그 애플리케이션의 로컬 개발 환경을 설정하는 방법을 상세히 설명합니다. 개발자들이 프로젝트를 빠르게 시작할 수 있도록 필요한 모든 단계를 다룹니다.

## 시스템 요구사항

### 필수 소프트웨어
- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상 또는 **yarn**: 1.22.0 이상
- **Git**: 2.30.0 이상
- **VS Code**: 1.80.0 이상 (권장)

### 권장 사양
- **OS**: macOS 12+, Windows 10+, Ubuntu 20.04+
- **RAM**: 8GB 이상
- **저장공간**: 10GB 이상
- **CPU**: 4코어 이상

## 초기 설정

### 1. 저장소 클론
```bash
# 저장소 클론
git clone https://github.com/your-username/stock.advenoh.pe.kr-replit.git
cd stock.advenoh.pe.kr-replit

# 브랜치 확인
git branch -a
git checkout main
```

### 2. Node.js 설치 확인
```bash
# Node.js 버전 확인
node --version
# v18.0.0 이상이어야 함

# npm 버전 확인
npm --version
# v9.0.0 이상이어야 함
```

### 3. 프로젝트 의존성 설치
```bash
# 루트 디렉토리 의존성 설치
npm install

# Next.js 클라이언트 의존성 설치
cd client_nextjs
npm install
cd ..

# 서버 의존성 설치 (필요시)
cd server
npm install
cd ..
```

## 개발 환경 구성

### 1. 환경 변수 설정

#### .env.local 파일 생성
```bash
# 루트 디렉토리에 .env.local 파일 생성
touch .env.local
```

#### 환경 변수 내용
```env
# 개발 환경 설정
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 데이터베이스 설정 (필요시)
DATABASE_URL=your_database_url_here

# API 키 설정 (필요시)
NEXT_PUBLIC_API_KEY=your_api_key_here

# Next.js 설정
NEXT_TELEMETRY_DISABLED=1
```

### 2. VS Code 설정

#### 확장 프로그램 설치
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

#### 작업 영역 설정
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 3. 개발 서버 실행

#### 개발 모드 실행
```bash
# Next.js 개발 서버 실행
cd client_nextjs
npm run dev

# 또는 루트에서 실행
npm run dev:nextjs
```

#### 서버 접근 확인
- **URL**: http://localhost:3000
- **상태**: 개발 모드 (핫 리로드 활성화)
- **포트**: 3000

## 개발 워크플로우

### 1. 코드 작성 가이드라인

#### 파일 구조 규칙
```
src/
├── app/                    # App Router 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── globals.css        # 전역 스타일
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                  # 유틸리티 함수
├── hooks/                # 커스텀 훅
└── types/                # TypeScript 타입 정의
```

#### 컴포넌트 작성 규칙
```typescript
// src/components/example-component.tsx
'use client'; // 클라이언트 컴포넌트인 경우에만

import { useState } from 'react';
import type { ComponentProps } from 'react';

interface ExampleComponentProps {
  title: string;
  description?: string;
}

export default function ExampleComponent({
  title,
  description,
}: ExampleComponentProps) {
  const [state, setState] = useState(false);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}
```

### 2. Git 워크플로우

#### 브랜치 전략
```bash
# 기능 개발 브랜치 생성
git checkout -b feature/new-feature

# 개발 완료 후 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 메인 브랜치로 병합
git checkout main
git merge feature/new-feature

# 브랜치 삭제
git branch -d feature/new-feature
```

#### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경
```

### 3. 코드 품질 관리

#### ESLint 설정
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

#### Prettier 설정
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 디버깅 가이드

### 1. 브라우저 디버깅

#### React Developer Tools
```bash
# Chrome 확장 프로그램 설치
# React Developer Tools
# Redux DevTools (Redux 사용시)
```

#### 콘솔 디버깅
```typescript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// 성능 측정
console.time('operation');
// ... 작업 수행
console.timeEnd('operation');
```

### 2. VS Code 디버깅

#### 디버그 설정
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

### 3. API 디버깅

#### API 라우트 테스트
```bash
# API 엔드포인트 테스트
curl http://localhost:3000/api/blog-posts

# POST 요청 테스트
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

#### API 응답 모니터링
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  const duration = Date.now() - start;
  
  // API 요청 로깅
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`API ${request.method} ${request.nextUrl.pathname} - ${duration}ms`);
  }
  
  return response;
}
```

## 성능 최적화

### 1. 개발 환경 성능

#### 번들 분석
```bash
# 번들 크기 분석
npm run build:analyze

# 또는 수동 분석
npx @next/bundle-analyzer
```

#### 메모리 사용량 모니터링
```bash
# Node.js 메모리 사용량 확인
node --inspect npm run dev

# 또는 프로세스 모니터링
ps aux | grep node
```

### 2. 핫 리로드 최적화

#### 파일 감시 설정
```typescript
// next.config.ts
const nextConfig = {
  // ... 기존 설정
  
  // 개발 환경 최적화
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 개발 환경에서 번들 크기 최적화
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
        },
      };
    }
    
    return config;
  },
};
```

## 테스트 환경

### 1. 단위 테스트 설정

#### Jest 설정
```json
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

#### 테스트 실행
```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test -- --testPathPattern=component-name

# 커버리지 확인
npm test -- --coverage
```

### 2. E2E 테스트 설정

#### Playwright 설정
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 문제 해결

### 1. 일반적인 문제

#### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:3000

# 프로세스 종료
kill -9 $(lsof -ti:3000)

# 다른 포트 사용
PORT=3001 npm run dev
```

#### 메모리 부족
```bash
# Node.js 메모리 제한 증가
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

#### 캐시 문제
```bash
# Next.js 캐시 클리어
rm -rf .next
rm -rf node_modules/.cache

# 의존성 재설치
npm install
```

### 2. 빌드 오류

#### TypeScript 오류
```bash
# 타입 체크
npm run type-check

# 타입 오류 자동 수정 (가능한 경우)
npx tsc --noEmit
```

#### ESLint 오류
```bash
# ESLint 검사
npm run lint

# ESLint 오류 자동 수정
npm run lint:fix
```

### 3. 런타임 오류

#### 하이드레이션 오류
```typescript
// 클라이언트 컴포넌트에 'use client' 추가
'use client';

import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <div>Client-only content</div>;
}
```

#### API 라우트 오류
```typescript
// API 라우트 에러 핸들링
export async function GET(request: NextRequest) {
  try {
    // API 로직
    return NextResponse.json({ data: 'success' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## 개발 도구

### 1. 유용한 VS Code 확장

#### 필수 확장
- **ES7+ React/Redux/React-Native snippets**: React 코드 스니펫
- **Tailwind CSS IntelliSense**: Tailwind CSS 자동완성
- **GitLens**: Git 히스토리 및 변경사항 추적
- **Error Lens**: 인라인 에러 표시

#### 권장 확장
- **Thunder Client**: API 테스트 도구
- **Code Spell Checker**: 맞춤법 검사
- **Bracket Pair Colorizer**: 괄호 색상 구분
- **Auto Rename Tag**: HTML 태그 자동 이름 변경

### 2. 터미널 도구

#### 유용한 명령어
```bash
# 프로세스 모니터링
htop

# 파일 변경 감시
fswatch -o . | xargs -n1 -I {} npm run build

# 포트 스캔
nmap localhost

# 네트워크 연결 확인
netstat -tulpn | grep :3000
```

## 결론

이 개발 환경 설정 가이드를 따라하면 Next.js 15 + App Router 기반 블로그 애플리케이션을 효율적으로 개발할 수 있습니다. 각 단계를 체계적으로 수행하고, 문제가 발생하면 문제 해결 섹션을 참조하세요.

### 추가 리소스
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs) 