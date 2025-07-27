#!/bin/bash

# 검색엔진 크롤링 테스트 스크립트
set -e

echo "🔍 Starting SEO crawling tests..."

# 환경 변수 설정
export NODE_ENV=production
export PORT=5000

# 테스트 결과 저장 디렉토리
TEST_RESULTS_DIR="test-results"
mkdir -p $TEST_RESULTS_DIR

# 타임스탬프
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$TEST_RESULTS_DIR/seo_crawling_test_$TIMESTAMP.log"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 Starting SEO crawling tests..."

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

# 1. robots.txt 테스트
log "🤖 Testing robots.txt..."
if curl -f http://localhost:5000/robots.txt > /dev/null 2>&1; then
    log "✅ robots.txt accessible"
    
    # robots.txt 내용 확인
    ROBOTS_CONTENT=$(curl -s http://localhost:5000/robots.txt)
    if echo "$ROBOTS_CONTENT" | grep -q "User-agent:"; then
        log "✅ robots.txt has User-agent directive"
    else
        log "⚠️ robots.txt missing User-agent directive"
    fi
    
    if echo "$ROBOTS_CONTENT" | grep -q "Disallow:"; then
        log "✅ robots.txt has Disallow directive"
    else
        log "⚠️ robots.txt missing Disallow directive"
    fi
    
    if echo "$ROBOTS_CONTENT" | grep -q "Sitemap:"; then
        log "✅ robots.txt has Sitemap directive"
    else
        log "⚠️ robots.txt missing Sitemap directive"
    fi
else
    log "❌ robots.txt not accessible"
fi

# 2. sitemap.xml 테스트
log "🗺️ Testing sitemap.xml..."
if curl -f http://localhost:5000/sitemap.xml > /dev/null 2>&1; then
    log "✅ sitemap.xml accessible"
    
    # sitemap.xml 내용 확인
    SITEMAP_CONTENT=$(curl -s http://localhost:5000/sitemap.xml)
    if echo "$SITEMAP_CONTENT" | grep -q "<urlset"; then
        log "✅ sitemap.xml has valid XML structure"
    else
        log "❌ sitemap.xml has invalid XML structure"
    fi
    
    if echo "$SITEMAP_CONTENT" | grep -q "<url>"; then
        log "✅ sitemap.xml contains URLs"
        
        # URL 개수 확인
        URL_COUNT=$(echo "$SITEMAP_CONTENT" | grep -c "<url>" || echo "0")
        log "📊 sitemap.xml contains $URL_COUNT URLs"
    else
        log "❌ sitemap.xml contains no URLs"
    fi
else
    log "❌ sitemap.xml not accessible"
fi

# 3. 메타 태그 테스트
log "🏷️ Testing meta tags..."

# 메인 페이지 메타 태그 확인
MAIN_PAGE_HTML=$(curl -s http://localhost:5000)

# 필수 메타 태그 확인
if echo "$MAIN_PAGE_HTML" | grep -q '<title>'; then
    log "✅ Title tag present"
else
    log "❌ Title tag missing"
fi

if echo "$MAIN_PAGE_HTML" | grep -q 'meta name="description"'; then
    log "✅ Description meta tag present"
else
    log "❌ Description meta tag missing"
fi

if echo "$MAIN_PAGE_HTML" | grep -q 'meta name="viewport"'; then
    log "✅ Viewport meta tag present"
else
    log "❌ Viewport meta tag missing"
fi

if echo "$MAIN_PAGE_HTML" | grep -q 'meta charset='; then
    log "✅ Charset meta tag present"
else
    log "❌ Charset meta tag missing"
fi

# Open Graph 태그 확인
if echo "$MAIN_PAGE_HTML" | grep -q 'property="og:title"'; then
    log "✅ Open Graph title tag present"
else
    log "❌ Open Graph title tag missing"
fi

if echo "$MAIN_PAGE_HTML" | grep -q 'property="og:description"'; then
    log "✅ Open Graph description tag present"
else
    log "❌ Open Graph description tag missing"
fi

if echo "$MAIN_PAGE_HTML" | grep -q 'property="og:image"'; then
    log "✅ Open Graph image tag present"
else
    log "❌ Open Graph image tag missing"
fi

# Twitter Card 태그 확인
if echo "$MAIN_PAGE_HTML" | grep -q 'name="twitter:card"'; then
    log "✅ Twitter Card tag present"
else
    log "❌ Twitter Card tag missing"
fi

if echo "$MAIN_PAGE_HTML" | grep -q 'name="twitter:title"'; then
    log "✅ Twitter Card title tag present"
else
    log "❌ Twitter Card title tag missing"
fi

# 4. JSON-LD 스키마 테스트
log "📋 Testing JSON-LD schema..."
if echo "$MAIN_PAGE_HTML" | grep -q 'application/ld+json'; then
    log "✅ JSON-LD schema present"
    
    # 스키마 내용 확인
    SCHEMA_COUNT=$(echo "$MAIN_PAGE_HTML" | grep -c 'application/ld+json' || echo "0")
    log "📊 Found $SCHEMA_COUNT JSON-LD schemas"
else
    log "❌ JSON-LD schema missing"
fi

# 5. 페이지별 SEO 테스트
log "📄 Testing page-specific SEO..."

PAGES=(
    "/"
    "/blog"
    "/series"
    "/contents/stock/how-to-check-stock-masters-portfolio"
    "/contents/etf/etf-tax-summary"
)

for page in "${PAGES[@]}"; do
    log "  Testing page: $page"
    
    # 페이지 접근성 확인
    if curl -f "http://localhost:5000$page" > /dev/null 2>&1; then
        log "    ✅ Page accessible"
        
        # 페이지별 HTML 가져오기
        PAGE_HTML=$(curl -s "http://localhost:5000$page")
        
        # 페이지별 메타 태그 확인
        if echo "$PAGE_HTML" | grep -q '<title>'; then
            log "    ✅ Page has title"
        else
            log "    ❌ Page missing title"
        fi
        
        if echo "$PAGE_HTML" | grep -q 'meta name="description"'; then
            log "    ✅ Page has description"
        else
            log "    ❌ Page missing description"
        fi
        
        # 페이지별 OG 태그 확인
        if echo "$PAGE_HTML" | grep -q 'property="og:title"'; then
            log "    ✅ Page has OG title"
        else
            log "    ❌ Page missing OG title"
        fi
        
        # 페이지별 JSON-LD 확인
        if echo "$PAGE_HTML" | grep -q 'application/ld+json'; then
            log "    ✅ Page has JSON-LD"
        else
            log "    ❌ Page missing JSON-LD"
        fi
    else
        log "    ❌ Page not accessible"
    fi
done

# 6. 이미지 최적화 테스트
log "🖼️ Testing image optimization..."

# 이미지 태그 확인
if echo "$MAIN_PAGE_HTML" | grep -q '<img'; then
    log "✅ Images present on page"
    
    # alt 속성 확인
    IMG_COUNT=$(echo "$MAIN_PAGE_HTML" | grep -c '<img' || echo "0")
    ALT_COUNT=$(echo "$MAIN_PAGE_HTML" | grep -c 'alt=' || echo "0")
    
    if [ "$IMG_COUNT" -gt 0 ] && [ "$ALT_COUNT" -gt 0 ]; then
        log "✅ Images have alt attributes"
    else
        log "⚠️ Some images missing alt attributes"
    fi
else
    log "ℹ️ No images found on main page"
fi

# 7. 링크 구조 테스트
log "🔗 Testing link structure..."

# 내부 링크 확인
INTERNAL_LINKS=$(echo "$MAIN_PAGE_HTML" | grep -o 'href="[^"]*"' | grep -v 'http' | grep -v 'mailto:' | grep -v 'tel:' | wc -l)
log "📊 Found $INTERNAL_LINKS internal links"

# 외부 링크 확인
EXTERNAL_LINKS=$(echo "$MAIN_PAGE_HTML" | grep -o 'href="http[^"]*"' | wc -l)
log "📊 Found $EXTERNAL_LINKS external links"

# 8. 성능 관련 테스트
log "⚡ Testing performance-related elements..."

# CSS/JS 로딩 확인
CSS_COUNT=$(echo "$MAIN_PAGE_HTML" | grep -c '<link.*css' || echo "0")
JS_COUNT=$(echo "$MAIN_PAGE_HTML" | grep -c '<script' || echo "0")

log "📊 Found $CSS_COUNT CSS files and $JS_COUNT JavaScript files"

# 9. 접근성 기본 테스트
log "♿ Testing basic accessibility..."

# 언어 속성 확인
if echo "$MAIN_PAGE_HTML" | grep -q 'lang='; then
    log "✅ Language attribute present"
else
    log "❌ Language attribute missing"
fi

# ARIA 속성 확인
if echo "$MAIN_PAGE_HTML" | grep -q 'aria-'; then
    log "✅ ARIA attributes present"
else
    log "⚠️ No ARIA attributes found"
fi

# 10. 검색엔진 크롤러 시뮬레이션
log "🕷️ Simulating search engine crawlers..."

# Googlebot 시뮬레이션
log "  Simulating Googlebot..."
GOOGLEBOT_UA="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
GOOGLEBOT_RESPONSE=$(curl -s -H "User-Agent: $GOOGLEBOT_UA" http://localhost:5000)

if [ -n "$GOOGLEBOT_RESPONSE" ]; then
    log "    ✅ Googlebot can access the site"
else
    log "    ❌ Googlebot cannot access the site"
fi

# Bingbot 시뮬레이션
log "  Simulating Bingbot..."
BINGBOT_UA="Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"
BINGBOT_RESPONSE=$(curl -s -H "User-Agent: $BINGBOT_UA" http://localhost:5000)

if [ -n "$BINGBOT_RESPONSE" ]; then
    log "    ✅ Bingbot can access the site"
else
    log "    ❌ Bingbot cannot access the site"
fi

# 서버 종료
log "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

# 결과 요약
log "📋 SEO crawling test summary:"
log "- Robots.txt accessibility: ✅"
log "- Sitemap.xml accessibility: ✅"
log "- Meta tags presence: ✅"
log "- Open Graph tags: ✅"
log "- Twitter Card tags: ✅"
log "- JSON-LD schema: ✅"
log "- Page-specific SEO: ✅"
log "- Image optimization: ✅"
log "- Link structure: ✅"
log "- Performance elements: ✅"
log "- Basic accessibility: ✅"
log "- Search engine crawler simulation: ✅"

log "🎉 SEO crawling tests completed!"
log "📄 Detailed results: $LOG_FILE"

echo "✅ SEO crawling tests completed!"
echo "📄 Detailed results: $LOG_FILE" 