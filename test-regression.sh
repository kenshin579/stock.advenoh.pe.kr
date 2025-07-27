#!/bin/bash

# 기능 회귀 테스트 스크립트
set -e

echo "🧪 Starting regression tests..."

# 환경 변수 설정
export NODE_ENV=production
export PORT=5000

# 테스트 결과 저장 디렉토리
TEST_RESULTS_DIR="test-results"
mkdir -p $TEST_RESULTS_DIR

# 타임스탬프
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$TEST_RESULTS_DIR/regression_test_$TIMESTAMP.log"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting regression tests..."

# 1. 빌드 테스트
log "🔨 Testing build process..."
if npm run build:nextjs; then
    log "✅ Build test passed"
else
    log "❌ Build test failed"
    exit 1
fi

# 2. 서버 시작 테스트
log "🌐 Testing server startup..."
cd dist
npm run start &
SERVER_PID=$!
cd ..

# 서버 시작 대기
sleep 10

# 서버 상태 확인
if curl -f http://localhost:5000 > /dev/null 2>&1; then
    log "✅ Server startup test passed"
else
    log "❌ Server startup test failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# 3. 페이지 접근성 테스트
log "📄 Testing page accessibility..."

PAGES=(
    "/"
    "/blog"
    "/series"
    "/contents/stock/how-to-check-stock-masters-portfolio"
    "/contents/etf/etf-tax-summary"
    "/contents/weekly/2025-apr-week1-weekly-stock-sector-trend"
)

for page in "${PAGES[@]}"; do
    log "Testing page: $page"
    if curl -f "http://localhost:5000$page" > /dev/null 2>&1; then
        log "✅ Page $page accessible"
    else
        log "❌ Page $page not accessible"
    fi
done

# 4. API 라우트 테스트
log "🔌 Testing API routes..."

APIS=(
    "/api/blog-posts"
    "/api/categories"
    "/api/sitemap.xml"
)

for api in "${APIS[@]}"; do
    log "Testing API: $api"
    if curl -f "http://localhost:5000$api" > /dev/null 2>&1; then
        log "✅ API $api working"
    else
        log "❌ API $api failed"
    fi
done

# 5. 이미지 로딩 테스트
log "🖼️ Testing image loading..."
IMAGE_PATHS=(
    "/contents/stock/how-to-check-stock-masters-portfolio/image_1752991596461.png"
    "/contents/etf/etf-tax-summary/etf-20240705205603587_1752762558547.png"
)

for image in "${IMAGE_PATHS[@]}"; do
    log "Testing image: $image"
    if curl -f "http://localhost:5000$image" > /dev/null 2>&1; then
        log "✅ Image $image loading"
    else
        log "❌ Image $image failed to load"
    fi
done

# 6. SEO 메타데이터 테스트
log "🔍 Testing SEO metadata..."

# 메인 페이지 메타데이터 확인
MAIN_PAGE_HTML=$(curl -s http://localhost:5000)
if echo "$MAIN_PAGE_HTML" | grep -q '<title>'; then
    log "✅ Main page has title tag"
else
    log "❌ Main page missing title tag"
fi

if echo "$MAIN_PAGE_HTML" | grep -q 'meta name="description"'; then
    log "✅ Main page has description meta"
else
    log "❌ Main page missing description meta"
fi

# 7. 성능 기본 테스트
log "⚡ Testing basic performance..."

# 페이지 로드 시간 측정
START_TIME=$(date +%s.%N)
curl -s http://localhost:5000 > /dev/null
END_TIME=$(date +%s.%N)
LOAD_TIME=$(echo "$END_TIME - $START_TIME" | bc)

log "📊 Main page load time: ${LOAD_TIME}s"

if (( $(echo "$LOAD_TIME < 3.0" | bc -l) )); then
    log "✅ Page load time acceptable (< 3s)"
else
    log "⚠️ Page load time slow (> 3s): ${LOAD_TIME}s"
fi

# 8. 반응형 디자인 테스트 (기본)
log "📱 Testing responsive design..."

# User-Agent 시뮬레이션
MOBILE_UA="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"

if curl -s -H "User-Agent: $MOBILE_UA" http://localhost:5000 > /dev/null 2>&1; then
    log "✅ Mobile user agent test passed"
else
    log "❌ Mobile user agent test failed"
fi

# 9. 에러 핸들링 테스트
log "🚨 Testing error handling..."

# 존재하지 않는 페이지 테스트
if curl -f http://localhost:5000/nonexistent-page 2>/dev/null; then
    log "❌ 404 page not working properly"
else
    log "✅ 404 error handling working"
fi

# 서버 종료
log "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

# 결과 요약
log "📋 Regression test summary:"
log "- All tests completed"
log "- Results saved to: $LOG_FILE"

echo "✅ Regression tests completed!"
echo "📄 Detailed results: $LOG_FILE" 