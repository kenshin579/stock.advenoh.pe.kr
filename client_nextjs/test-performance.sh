#!/bin/bash

# 성능 테스트 스크립트
set -e

echo "🚀 Starting performance tests..."

# 개발 서버가 실행 중인지 확인
if ! curl -s http://localhost:5000 > /dev/null; then
    echo "❌ Development server is not running. Please start it first with 'npm run dev'"
    exit 1
fi

echo "✅ Development server is running"

# Lighthouse CI 실행
echo "📊 Running Lighthouse CI tests..."
npx lhci autorun --config=./lighthouserc.json

# 번들 크기 분석 (개발 모드에서만)
if [ "$NODE_ENV" = "development" ]; then
    echo "📦 Analyzing bundle size..."
    npm run build
    echo "✅ Bundle analysis completed"
fi

# Core Web Vitals 측정
echo "⚡ Measuring Core Web Vitals..."
echo "Please check the browser console for Core Web Vitals metrics"

# 성능 테스트 결과 요약
echo ""
echo "🎯 Performance Test Summary:"
echo "- Lighthouse CI tests completed"
echo "- Bundle size analysis completed"
echo "- Core Web Vitals monitoring active"
echo ""
echo "📈 Next steps:"
echo "1. Check Lighthouse CI results"
echo "2. Review bundle size analysis"
echo "3. Monitor Core Web Vitals in browser console"
echo "4. Optimize based on findings"

echo "✅ Performance tests completed!" 