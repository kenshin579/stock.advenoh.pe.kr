# SSR 전환 작업 - 구현 가이드 (Implementation Guide)

## 개요
이 문서는 Vite + React + Wouter에서 Next.js 15 + App Router로의 SSR 전환 작업에 대한 구체적인 구현 방법을 제공합니다.

## Phase 1: 배포 설정 완료

### 1.1 배포 타입 결정 및 설정

#### 현재 문제점 분석
```bash
# 현재 설정 파일들의 불일치 확인
cat replit.toml
cat .replit
```

**현재 상태:**
- `replit.toml`: `deploymentTarget = "autoscale"`
- `.replit`: `deploymentTarget = "cloudrun"`
- `next.config.ts`: `output: 'export'` (static export)

#### Next.js SSR 배포 설정

**1. replit.toml 업데이트**
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
```

**2. .replit 파일 통합**
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

**3. next.config.ts SSR 설정**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR을 위한 설정 (static export 제거)
  // output: 'export', // 주석 처리 또는 조건부 설정
  
  trailingSlash: true,
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

### 1.2 빌드 스크립트 업데이트

#### 새로운 빌드 스크립트 생성

**build-nextjs.sh**
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
cp -r client_nextjs/.next dist/
cp -r client_nextjs/public dist/
cp client_nextjs/package.json dist/
cp client_nextjs/next.config.ts dist/

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

#### package.json 스크립트 업데이트

**루트 package.json에 추가**
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

**client_nextjs/package.json 업데이트**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint"
  }
}
```

## Phase 2: 성능 최적화

### 2.1 Lighthouse 점수 개선

#### Core Web Vitals 최적화

**1. 이미지 최적화**
```typescript
// client_nextjs/src/components/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        onLoad={() => setIsLoading(false)}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
      />
    </div>
  );
}
```

**2. 폰트 최적화**
```typescript
// client_nextjs/src/app/layout.tsx
import { Inter, Noto_Sans_KR } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

**3. 번들 크기 최적화**
```typescript
// client_nextjs/next.config.ts에 추가
const nextConfig: NextConfig = {
  // ... 기존 설정
  
  // 번들 분석
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // 트리 쉐이킹 최적화
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };
    
    return config;
  },
  
  // 실험적 기능
  experimental: {
    ...config.experimental,
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'react-icons',
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};
```

### 2.2 캐싱 전략 구현

**1. 정적 자산 캐싱**
```typescript
// client_nextjs/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 정적 자산 캐싱
  if (request.nextUrl.pathname.startsWith('/contents/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // API 응답 캐싱
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/contents/:path*',
    '/api/:path*',
  ],
};
```

**2. ISR (Incremental Static Regeneration) 구현**
```typescript
// client_nextjs/src/app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export const revalidate = 3600; // 1시간마다 재생성

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }

  return (
    <article>
      {/* 블로그 포스트 내용 */}
    </article>
  );
}
```

## Phase 3: 기능 완성

### 3.1 API 라우트 검증

**1. 에러 핸들링 개선**
```typescript
// client_nextjs/src/app/api/blog-posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const posts = await getBlogPosts({ category, search });
    
    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

**2. 성능 모니터링**
```typescript
// client_nextjs/src/lib/performance.ts
export function measureApiPerformance(apiName: string) {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    console.log(`API ${apiName} took ${duration.toFixed(2)}ms`);
    
    // 성능 메트릭 수집 (선택사항)
    if (duration > 1000) {
      console.warn(`Slow API call detected: ${apiName}`);
    }
  };
}
```

### 3.2 컴포넌트 호환성 검증

**1. 클라이언트/서버 컴포넌트 분리**
```typescript
// client_nextjs/src/components/ClientOnly.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
```

**2. 하이드레이션 이슈 해결**
```typescript
// client_nextjs/src/hooks/useHydration.ts
'use client';

import { useEffect, useState } from 'react';

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
```

## Phase 4: 품질 보증

### 4.1 테스트 환경 구축

**1. 성능 테스트 스크립트**
```bash
#!/bin/bash
# test-performance.sh

echo "🚀 Running performance tests..."

# Lighthouse CI 설치 (필요시)
# npm install -g @lhci/cli

# 성능 테스트 실행
lhci autorun --config=./lighthouserc.json

# 번들 크기 분석
npm run build:analyze

echo "✅ Performance tests completed!"
```

**2. Lighthouse CI 설정**
```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:5000",
        "http://localhost:5000/blog",
        "http://localhost:5000/series"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 4.2 모니터링 설정

**1. 에러 추적**
```typescript
// client_nextjs/src/lib/error-tracking.ts
export function trackError(error: Error, context?: Record<string, any>) {
  console.error('Error tracked:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  });
  
  // 실제 에러 추적 서비스로 전송 (선택사항)
  // Sentry.captureException(error, { extra: context });
}
```

**2. 성능 모니터링**
```typescript
// client_nextjs/src/lib/performance-monitoring.ts
export function trackPageView(pageName: string) {
  if (typeof window !== 'undefined') {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      pageName,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    };
    
    console.log('Performance metrics:', metrics);
  }
}
```

## 배포 체크리스트

### 배포 전 확인사항
- [ ] Next.js 빌드 성공
- [ ] 모든 API 라우트 정상 동작
- [ ] 이미지 최적화 적용
- [ ] SEO 메타데이터 설정 완료
- [ ] 성능 테스트 통과
- [ ] 에러 핸들링 구현
- [ ] 캐싱 전략 적용
- [ ] 모니터링 설정 완료

### 배포 후 확인사항
- [ ] 사이트 접근 가능
- [ ] 모든 페이지 정상 로드
- [ ] 이미지 및 정적 자산 로드
- [ ] API 응답 정상
- [ ] SEO 메타데이터 확인
- [ ] 성능 지표 측정
- [ ] 에러 로그 확인

## 트러블슈팅 가이드

### 일반적인 문제 해결

**1. 빌드 실패**
```bash
# 캐시 클리어
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

**2. 하이드레이션 에러**
- 클라이언트 컴포넌트에 'use client' 지시어 추가
- 서버와 클라이언트 간 상태 불일치 확인

**3. 이미지 최적화 문제**
- next.config.ts에서 이미지 도메인 설정 확인
- 이미지 파일 경로 및 형식 확인

**4. API 라우트 문제**
- API 라우트 파일명 및 경로 확인
- 에러 핸들링 구현 확인
- CORS 설정 확인

이 구현 가이드는 단계별로 진행하면서 각 단계가 완료될 때마다 테스트하고 검증하는 것을 권장합니다. 