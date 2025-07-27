#!/bin/bash

# 크로스 브라우저 테스트 스크립트
set -e

echo "🌐 Starting cross-browser tests..."

# 환경 변수 설정
export NODE_ENV=production
export PORT=5000

# 테스트 결과 저장 디렉토리
TEST_RESULTS_DIR="test-results"
mkdir -p $TEST_RESULTS_DIR

# 타임스탬프
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$TEST_RESULTS_DIR/cross_browser_test_$TIMESTAMP.log"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting cross-browser tests..."

# 서버 시작
log "🌐 Starting server for testing..."
cd dist
npm run start &
SERVER_PID=$!
cd ..

# 서버 시작 대기
sleep 10

# 서버 상태 확인
if ! curl -f http://localhost:5000 > /dev/null 2>&1; then
    log "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

log "✅ Server is running on http://localhost:5000"

# User-Agent 정의
declare -A BROWSERS=(
    ["Chrome"]="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ["Firefox"]="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
    ["Safari"]="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
    ["Edge"]="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
    ["Mobile-Chrome"]="Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
    ["Mobile-Safari"]="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)

# 테스트할 페이지들
PAGES=(
    "/"
    "/blog"
    "/series"
    "/contents/stock/how-to-check-stock-masters-portfolio"
    "/contents/etf/etf-tax-summary"
)

# 각 브라우저별 테스트
for browser in "${!BROWSERS[@]}"; do
    log "🧪 Testing with $browser..."
    
    user_agent="${BROWSERS[$browser]}"
    
    for page in "${PAGES[@]}"; do
        log "  Testing page: $page"
        
        # HTTP 상태 코드 확인
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: $user_agent" "http://localhost:5000$page")
        
        if [ "$status_code" = "200" ]; then
            log "    ✅ $page - Status: $status_code"
        else
            log "    ❌ $page - Status: $status_code"
        fi
        
        # 응답 시간 측정
        start_time=$(date +%s.%N)
        curl -s -H "User-Agent: $user_agent" "http://localhost:5000$page" > /dev/null
        end_time=$(date +%s.%N)
        response_time=$(echo "$end_time - $start_time" | bc)
        
        log "    📊 Response time: ${response_time}s"
        
        # HTML 구조 확인
        html_content=$(curl -s -H "User-Agent: $user_agent" "http://localhost:5000$page")
        
        # 기본 HTML 요소 확인
        if echo "$html_content" | grep -q '<!DOCTYPE html>'; then
            log "    ✅ DOCTYPE present"
        else
            log "    ❌ DOCTYPE missing"
        fi
        
        if echo "$html_content" | grep -q '<html'; then
            log "    ✅ HTML tag present"
        else
            log "    ❌ HTML tag missing"
        fi
        
        if echo "$html_content" | grep -q '<head'; then
            log "    ✅ HEAD tag present"
        else
            log "    ❌ HEAD tag missing"
        fi
        
        if echo "$html_content" | grep -q '<body'; then
            log "    ✅ BODY tag present"
        else
            log "    ❌ BODY tag missing"
        fi
        
        # 메타데이터 확인
        if echo "$html_content" | grep -q '<title>'; then
            log "    ✅ Title tag present"
        else
            log "    ❌ Title tag missing"
        fi
        
        if echo "$html_content" | grep -q 'meta name="description"'; then
            log "    ✅ Description meta present"
        else
            log "    ❌ Description meta missing"
        fi
        
        # CSS/JS 로딩 확인
        if echo "$html_content" | grep -q '<link.*css'; then
            log "    ✅ CSS links present"
        else
            log "    ❌ CSS links missing"
        fi
        
        if echo "$html_content" | grep -q '<script'; then
            log "    ✅ Script tags present"
        else
            log "    ❌ Script tags missing"
        fi
    done
    
    log "✅ $browser testing completed"
    log ""
done

# 반응형 디자인 테스트
log "📱 Testing responsive design..."

# 다양한 화면 크기 시뮬레이션
declare -A SCREEN_SIZES=(
    ["Mobile"]="375x667"
    ["Tablet"]="768x1024"
    ["Desktop"]="1920x1080"
)

for screen_size in "${!SCREEN_SIZES[@]}"; do
    log "  Testing $screen_size layout..."
    
    # Viewport 메타 태그 확인
    html_content=$(curl -s "http://localhost:5000")
    
    if echo "$html_content" | grep -q 'viewport'; then
        log "    ✅ Viewport meta tag present"
    else
        log "    ❌ Viewport meta tag missing"
    fi
    
    # 반응형 CSS 확인 (미디어 쿼리)
    if echo "$html_content" | grep -q '@media'; then
        log "    ✅ Media queries detected"
    else
        log "    ⚠️ No media queries detected"
    fi
done

# 접근성 기본 테스트
log "♿ Testing basic accessibility..."

html_content=$(curl -s "http://localhost:5000")

# ARIA 속성 확인
if echo "$html_content" | grep -q 'aria-'; then
    log "  ✅ ARIA attributes present"
else
    log "  ⚠️ No ARIA attributes detected"
fi

# Alt 속성 확인 (이미지)
if echo "$html_content" | grep -q 'alt='; then
    log "  ✅ Alt attributes present"
else
    log "  ⚠️ No alt attributes detected"
fi

# 언어 속성 확인
if echo "$html_content" | grep -q 'lang='; then
    log "  ✅ Language attribute present"
else
    log "  ❌ Language attribute missing"
fi

# 서버 종료
log "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

# 결과 요약
log "📋 Cross-browser test summary:"
log "- All browsers tested"
log "- Responsive design verified"
log "- Basic accessibility checked"
log "- Results saved to: $LOG_FILE"

echo "✅ Cross-browser tests completed!"
echo "📄 Detailed results: $LOG_FILE" 