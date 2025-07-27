# 배포 프로세스 문서화

## 개요

이 문서는 Next.js 15 + App Router 기반 블로그 애플리케이션의 배포 프로세스를 상세히 설명합니다. Replit Cloud Run 환경에서 SSR 배포를 위한 전체 워크플로우를 다룹니다.

## 배포 아키텍처

### 배포 환경
- **플랫폼**: Replit
- **런타임**: Node.js 20
- **배포 타겟**: Cloud Run
- **웹 서버**: Next.js Standalone Server

### 시스템 요구사항
- **Node.js**: 18.0.0 이상
- **메모리**: 최소 512MB (권장 1GB)
- **CPU**: 1 vCPU
- **디스크**: 최소 1GB

## 배포 설정 파일

### 1. replit.toml
```toml
[deployment]
deploymentTarget = "cloudrun"
run = "npm run start"
build = ["npm", "run", "build:nextjs"]

[[ports]]
localPort = 5000
externalPort = 80

[env]
PORT = "5000"
NODE_ENV = "production"
NEXT_TELEMETRY_DISABLED = "1"
```

### 2. .replit
```toml
modules = ["nodejs-20", "web", "postgresql-16"]
run = "npm run dev"
hidden = [".config", ".git", "generated-icon.png", "node_modules", "dist", ".next"]

[nix]
channel = "stable-24_05"

[deployment]
deploymentTarget = "cloudrun"
build = ["npm", "run", "build:nextjs"]
run = ["sh", "-c", "npm run start:nextjs"]

[[ports]]
localPort = 5000
externalPort = 80

[env]
PORT = "5000"
NODE_ENV = "production"
```

### 3. next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: 'standalone', // Cloud Run 배포를 위한 설정
  
  images: {
    unoptimized: true,
    domains: ['stock.advenoh.pe.kr'],
    formats: ['image/webp', 'image/avif'],
  },
  
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // 캐싱 설정
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
    {
      source: '/contents/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};

export default nextConfig;
```

## 빌드 스크립트

### 1. build-nextjs.sh
```bash
#!/bin/bash

# Next.js SSR 배포용 빌드 스크립트
set -e

echo "🚀 Starting Next.js SSR build process..."

# 환경 변수 설정
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# 정적 데이터 생성
echo "📊 Generating static blog data..."
npx tsx server/scripts/generateStaticData.ts

# Next.js 빌드
echo "🔨 Building Next.js application..."
cd client_nextjs
npm run build
cd ..

# 배포용 파일 복사
echo "📁 Copying build files for deployment..."
mkdir -p dist
cp -r client_nextjs/.next/standalone/* dist/
cp -r client_nextjs/.next/static dist/.next/
cp -r client_nextjs/public dist/
cp client_nextjs/package.json dist/

# 정적 데이터 복사
echo "📄 Copying static data..."
mkdir -p dist/public/api
cp -r public/api/* dist/public/api/

# 서버 시작 스크립트 생성
cat > dist/start.sh << 'EOF'
#!/bin/bash
cd /app
npm install --production
npm run start
EOF
chmod +x dist/start.sh

echo "✅ Next.js SSR build completed!"
echo "📂 Build output: dist/"
```

### 2. package.json 스크립트
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "build:nextjs": "./build-nextjs.sh",
    "start": "NODE_ENV=production node dist/index.js",
    "start:nextjs": "cd dist && npm run start",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

## 배포 단계별 가이드

### 1단계: 사전 준비

#### 1.1 환경 변수 설정
```bash
# .env.local 파일 생성
NODE_ENV=production
PORT=5000
SITE_URL=https://stock.advenoh.pe.kr
NEXT_TELEMETRY_DISABLED=1
```

#### 1.2 의존성 설치
```bash
# 루트 디렉토리
npm install

# Next.js 클라이언트 디렉토리
cd client_nextjs
npm install
cd ..
```

#### 1.3 정적 데이터 생성
```bash
# 블로그 포스트 데이터 생성
npx tsx server/scripts/generateStaticData.ts
```

### 2단계: 빌드 프로세스

#### 2.1 개발 빌드 테스트
```bash
# 개발 환경에서 빌드 테스트
npm run build:nextjs

# 빌드 결과 확인
ls -la dist/
```

#### 2.2 빌드 검증
```bash
# TypeScript 타입 체크
npm run check

# ESLint 검사
cd client_nextjs
npm run lint
cd ..
```

### 3단계: 배포 실행

#### 3.1 Replit 배포
```bash
# Replit에서 배포 실행
# 1. Replit 대시보드에서 "Deploy" 버튼 클릭
# 2. 배포 로그 확인
# 3. 배포 완료 대기
```

#### 3.2 수동 배포 (필요시)
```bash
# 수동으로 배포 실행
replit deploy
```

### 4단계: 배포 후 검증

#### 4.1 기본 접근성 확인
```bash
# 사이트 접근 확인
curl -I https://stock.advenoh.pe.kr

# 응답 코드 확인 (200 OK)
```

#### 4.2 기능 테스트
```bash
# 홈페이지 접근
curl https://stock.advenoh.pe.kr

# 블로그 포스트 접근
curl https://stock.advenoh.pe.kr/blog/test-post

# API 엔드포인트 접근
curl https://stock.advenoh.pe.kr/api/blog-posts
```

#### 4.3 성능 테스트
```bash
# 페이지 로드 시간 측정
time curl -s https://stock.advenoh.pe.kr > /dev/null

# Lighthouse 테스트 (브라우저에서)
# https://pagespeed.web.dev/report?url=https://stock.advenoh.pe.kr
```

## 환경별 배포 설정

### 개발 환경
```bash
# 개발 서버 실행
npm run dev

# 포트: 3000
# 환경: development
# 디버깅: 활성화
```

### 스테이징 환경
```bash
# 스테이징 빌드
NODE_ENV=staging npm run build:nextjs

# 스테이징 서버 실행
NODE_ENV=staging npm run start:nextjs

# 포트: 5000
# 환경: staging
# 로깅: 상세
```

### 프로덕션 환경
```bash
# 프로덕션 빌드
NODE_ENV=production npm run build:nextjs

# 프로덕션 서버 실행
NODE_ENV=production npm run start:nextjs

# 포트: 5000
# 환경: production
# 로깅: 최소
```

## 모니터링 및 로깅

### 1. 로그 설정
```typescript
// src/lib/logger.ts
export function log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data,
    environment: process.env.NODE_ENV,
  };
  
  console.log(JSON.stringify(logEntry));
}
```

### 2. 성능 모니터링
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  const duration = Date.now() - start;
  
  // 성능 로깅
  if (duration > 1000) {
    console.log(`Slow request: ${request.url} took ${duration}ms`);
  }
  
  return response;
}
```

### 3. 헬스 체크
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  };
  
  return NextResponse.json(health);
}
```

## 롤백 절차

### 1. 롤백 트리거 조건
- 배포 후 5분 내 5xx 에러율 10% 이상
- 핵심 기능 접근 불가
- 성능 지표 급격한 하락

### 2. 롤백 실행
```bash
# 이전 버전으로 롤백
replit rollback

# 또는 수동 롤백
git checkout HEAD~1
npm run build:nextjs
replit deploy
```

### 3. 롤백 검증
```bash
# 롤백 후 기능 확인
curl -I https://stock.advenoh.pe.kr
curl https://stock.advenoh.pe.kr/api/health
```

## 문제 해결 가이드

### 1. 빌드 실패
**문제**: Next.js 빌드 중 오류 발생
**해결**:
```bash
# 캐시 클리어
rm -rf .next
rm -rf node_modules/.cache

# 의존성 재설치
npm install

# 빌드 재시도
npm run build:nextjs
```

### 2. 메모리 부족
**문제**: 빌드 중 메모리 부족 오류
**해결**:
```bash
# Node.js 메모리 제한 증가
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:nextjs
```

### 3. 포트 충돌
**문제**: 포트 5000이 이미 사용 중
**해결**:
```bash
# 다른 포트 사용
PORT=5001 npm run start:nextjs

# 또는 기존 프로세스 종료
lsof -ti:5000 | xargs kill -9
```

### 4. 환경 변수 누락
**문제**: 필수 환경 변수가 설정되지 않음
**해결**:
```bash
# 환경 변수 확인
echo $NODE_ENV
echo $PORT
echo $SITE_URL

# 환경 변수 설정
export NODE_ENV=production
export PORT=5000
export SITE_URL=https://stock.advenoh.pe.kr
```

## 배포 체크리스트

### 배포 전 확인사항
- [ ] 모든 테스트 통과
- [ ] TypeScript 컴파일 오류 없음
- [ ] ESLint 경고 해결
- [ ] 환경 변수 설정 완료
- [ ] 정적 데이터 최신 상태
- [ ] 이미지 자산 최적화 완료

### 배포 중 확인사항
- [ ] 빌드 프로세스 성공
- [ ] 파일 복사 완료
- [ ] 서버 시작 성공
- [ ] 포트 바인딩 확인
- [ ] 헬스 체크 통과

### 배포 후 확인사항
- [ ] 사이트 접근 가능
- [ ] 모든 페이지 정상 로드
- [ ] API 응답 정상
- [ ] 이미지 및 정적 자산 로드
- [ ] 성능 지표 확인
- [ ] 에러 로그 확인

## 성능 최적화 팁

### 1. 빌드 최적화
```bash
# 병렬 빌드 활성화
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:nextjs
```

### 2. 캐싱 전략
```typescript
// 정적 자산 캐싱
headers: async () => [
  {
    source: '/contents/(.*)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
]
```

### 3. 이미지 최적화
```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
  quality={85}
/>
```

## 결론

이 배포 가이드를 통해 Next.js 15 + App Router 기반 블로그 애플리케이션을 Replit Cloud Run 환경에서 안정적으로 배포할 수 있습니다. 각 단계를 체계적으로 수행하고 모니터링을 통해 성공적인 배포를 보장하세요. 