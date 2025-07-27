#!/bin/bash

# 성능 테스트 자동화 스크립트
set -e

echo "🚀 Starting performance tests..."

# 환경 변수 설정
export NODE_ENV=production
export PORT=5000

# 필요한 도구 설치 확인
echo "📦 Checking required tools..."

# Lighthouse CI 설치 확인
if ! command -v lhci &> /dev/null; then
    echo "Installing Lighthouse CI..."
    npm install -g @lhci/cli
fi

# 번들 분석 도구 설치 확인
if [ ! -d "node_modules/.bin/next-bundle-analyzer" ]; then
    echo "Installing bundle analyzer..."
    npm install --save-dev @next/bundle-analyzer
fi

# Next.js 애플리케이션 빌드
echo "🔨 Building Next.js application..."
npm run build:nextjs

# 개발 서버 시작 (백그라운드)
echo "🌐 Starting development server..."
cd dist
npm run start &
SERVER_PID=$!
cd ..

# 서버 시작 대기
echo "⏳ Waiting for server to start..."
sleep 10

# 서버 상태 확인
if ! curl -f http://localhost:5000 > /dev/null 2>&1; then
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Server is running on http://localhost:5000"

# 성능 테스트 실행
echo "📊 Running Lighthouse CI tests..."
lhci autorun --config=./lighthouserc.json

# 번들 크기 분석
echo "📦 Analyzing bundle size..."
cd client_nextjs
ANALYZE=true npm run build
cd ..

# 성능 메트릭 수집
echo "📈 Collecting performance metrics..."
curl -s http://localhost:5000 > /dev/null
curl -s http://localhost:5000/blog > /dev/null
curl -s http://localhost:5000/series > /dev/null

# 서버 종료
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

# 결과 요약
echo "📋 Performance test summary:"
echo "- Lighthouse CI results: lhci_reports/"
echo "- Bundle analysis: client_nextjs/.next/analyze/"
echo "- Performance metrics logged above"

echo "✅ Performance tests completed!" 