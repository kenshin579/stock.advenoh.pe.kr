#!/bin/bash

# IndexNow API 등록 스크립트
# contents 폴더의 모든 하위 폴더를 스캔하여 IndexNow API로 URL 등록

# 설정
HOST="stock.advenoh.pe.kr"
KEY="6f4a19b722d44eeda34ff148f71822c9"
KEY_LOCATION="https://stock.advenoh.pe.kr/6f4a19b722d44eeda34ff148f71822c9"
API_URL="https://api.indexnow.org/IndexNow"
CONTENTS_DIR="contents"
MAX_RETRIES=3
RETRY_DELAY=5

# 기본값
DRY_RUN=false
ACTION="register"  # register 또는 check

# 도움말 함수
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --register       블로그 페이지를 IndexNow API에 등록 (기본값)"
    echo "  --check          등록된 페이지들이 인덱싱되었는지 확인"
    echo "  -d, --dry-run    실제 API 호출 없이 URL 목록만 출력"
    echo "  -h, --help       이 도움말 메시지 출력"
    echo ""
    echo "Examples:"
    echo "  $0               블로그 페이지 등록 (기본 동작)"
    echo "  $0 --register    블로그 페이지 등록"
    echo "  $0 --check       등록된 페이지 인덱싱 상태 확인"
    echo "  $0 --register --dry-run    등록할 URL 목록만 확인"
    echo "  $0 --check --dry-run       확인할 URL 목록만 확인"
}

# 명령행 인수 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        --register)
            ACTION="register"
            shift
            ;;
        --check)
            ACTION="check"
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "알 수 없는 옵션: $1"
            show_help
            exit 1
            ;;
    esac
done

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 에러 로그 함수
error_log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# API 호출 함수
call_indexnow_api() {
    local url_list="$1"
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "API 호출 시도 $((retry_count + 1))/$MAX_RETRIES"
        
        # dry-run 모드일 때는 curl 명령어를 echo로 출력
        if [ "$DRY_RUN" = true ]; then
            echo "curl --silent --show-error --location --request POST \"$API_URL\" \\"
            echo "    --header 'Content-Type: application/json; charset=utf-8' \\"
            echo "    --data '{"
            echo "        \"host\": \"$HOST\","
            echo "        \"key\": \"$KEY\","
            echo "        \"keyLocation\": \"$KEY_LOCATION\","
            echo "        \"urlList\": $url_list"
            echo "    }' \\"
            echo "    --write-out \"HTTPSTATUS:%{http_code}\""
            return 0
        fi
        
        # API 호출
        response=$(curl --silent --show-error --location --request POST "$API_URL" \
            --header 'Content-Type: application/json; charset=utf-8' \
            --data "{
                \"host\": \"$HOST\",
                \"key\": \"$KEY\",
                \"keyLocation\": \"$KEY_LOCATION\",
                \"urlList\": $url_list
            }" \
            --write-out "HTTPSTATUS:%{http_code}")
        
        # HTTP 상태 코드 추출
        http_code=$(echo "$response" | tail -n1 | sed -e 's/.*HTTPSTATUS://')
        response_body=$(echo "$response" | sed '$d')
        
        if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
            log "API 호출 성공 (HTTP $http_code)"
            log "응답: $response_body"
            return 0
        else
            error_log "API 호출 실패 (HTTP $http_code): $response_body"
            retry_count=$((retry_count + 1))
            
            if [ $retry_count -lt $MAX_RETRIES ]; then
                log "$RETRY_DELAY초 후 재시도..."
                sleep $RETRY_DELAY
            fi
        fi
    done
    
    error_log "최대 재시도 횟수 초과"
    return 1
}

# 페이지 인덱싱 상태 확인 함수
check_registered_pages() {
    local temp_urls="$1"
    local success_count=0
    local total_count=0
    
    log "등록된 페이지들의 인덱싱 상태 확인 중..."
    
    while read -r url; do
        if [ -z "$url" ]; then
            continue
        fi
        
        total_count=$((total_count + 1))
        log "확인 중: $url"
        
        # dry-run 모드일 때는 curl 명령어를 echo로 출력
        if [ "$DRY_RUN" = true ]; then
            echo "curl --silent --location --request GET \"https://www.bing.com/indexnow?url=$url&key=$KEY\" \\"
            echo "    --write-out \"HTTPSTATUS:%{http_code}\""
            continue
        fi
        
        # Bing IndexNow 확인 API 호출
        response=$(curl --silent --location --request GET "https://www.bing.com/indexnow?url=$url&key=$KEY" \
            --write-out "HTTPSTATUS:%{http_code}")
        
        # HTTP 상태 코드 추출
        http_code=$(echo "$response" | tail -n1 | sed -e 's/.*HTTPSTATUS://')
        response_body=$(echo "$response" | sed '$d')
        
        if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
            log "✓ 인덱싱 확인됨: $url (HTTP $http_code)"
            success_count=$((success_count + 1))
        else
            log "✗ 인덱싱 미확인: $url (HTTP $http_code)"
            if [ -n "$response_body" ]; then
                log "응답: $response_body"
            fi
        fi
        
        # API 호출 간격 조절 (과도한 요청 방지)
        sleep 1
    done < "$temp_urls"
    
    if [ "$DRY_RUN" = true ]; then
        log "DRY-RUN 완료: 총 $total_count개 URL의 curl 명령어 출력"
    else
        log "인덱싱 상태 확인 완료: $success_count/$total_count 페이지가 인덱싱됨"
    fi
    
    return 0
}

# 메인 실행 함수
main() {
    if [ "$ACTION" = "register" ]; then
        if [ "$DRY_RUN" = true ]; then
            log "DRY-RUN 모드: 실제 API 호출 없이 등록할 URL 목록만 확인"
        else
            log "IndexNow 등록 시작"
        fi
    elif [ "$ACTION" = "check" ]; then
        if [ "$DRY_RUN" = true ]; then
            log "DRY-RUN 모드: 실제 API 호출 없이 확인할 URL 목록만 확인"
        else
            log "인덱싱 상태 확인 시작"
        fi
    fi
    
    # contents 폴더 존재 확인
    if [ ! -d "$CONTENTS_DIR" ]; then
        error_log "contents 폴더를 찾을 수 없습니다: $CONTENTS_DIR"
        exit 1
    fi
    
    # URL 목록 생성
    log "URL 목록 생성 중..."
    
    # 임시 파일에 URL 목록 저장
    temp_urls=$(mktemp)
    
    # contents 폴더 하위의 모든 폴더를 스캔하여 URL 생성
    find "$CONTENTS_DIR" -type d -mindepth 1 -maxdepth 2 | while read -r dir; do
        # contents/ 접두사 제거
        url_path=$(echo "$dir" | sed 's|^contents/||')
        
        # 메인 카테고리 폴더는 제외 (etc, etf, stock, weekly)
        if [[ "$url_path" =~ ^(etc|etf|stock|weekly)$ ]]; then
            continue
        fi
        
        # index.md 파일이 존재하는지 확인
        if [ -f "$dir/index.md" ]; then
            # 전체 URL 생성
            full_url="https://$HOST/$url_path"
            echo "$full_url" >> "$temp_urls"
        fi
    done
    
    # URL 개수 확인
    url_count=$(wc -l < "$temp_urls")
    log "총 $url_count개 URL 발견"
    
    if [ "$url_count" -eq 0 ]; then
        error_log "등록할 URL이 없습니다"
        rm -f "$temp_urls"
        exit 1
    fi
    
    # URL 목록 출력
    log "발견된 URL 목록:"
    cat "$temp_urls" | nl
    
    # ACTION에 따른 처리
    if [ "$ACTION" = "register" ]; then
        if [ "$DRY_RUN" = true ]; then
            log "DRY-RUN 모드: curl 명령어 출력 및 URL 목록 확인"
            # URL 목록을 JSON 배열로 변환 (dry-run에서도 필요)
            url_list_json=$(cat "$temp_urls" | jq -R -s -c 'split("\n")[:-1]')
            
            if [ $? -ne 0 ]; then
                error_log "URL 목록을 JSON으로 변환하는데 실패했습니다"
                rm -f "$temp_urls"
                exit 1
            fi
            
            # dry-run 모드에서도 API 호출 함수 호출 (실제 호출은 안함)
            log "curl 명령어 출력:"
            if call_indexnow_api "$url_list_json"; then
                log "DRY-RUN 완료: 실제 API 호출 없이 curl 명령어와 URL 목록 확인"
                rm -f "$temp_urls"
                exit 0
            else
                error_log "DRY-RUN 중 오류 발생"
                rm -f "$temp_urls"
                exit 1
            fi
        fi
        
        # URL 목록을 JSON 배열로 변환
        url_list_json=$(cat "$temp_urls" | jq -R -s -c 'split("\n")[:-1]')
        
        if [ $? -ne 0 ]; then
            error_log "URL 목록을 JSON으로 변환하는데 실패했습니다"
            rm -f "$temp_urls"
            exit 1
        fi
        
        # API 호출
        log "IndexNow API 호출 중..."
        if call_indexnow_api "$url_list_json"; then
            log "IndexNow 등록 완료"
            rm -f "$temp_urls"
            exit 0
        else
            error_log "IndexNow 등록 실패"
            rm -f "$temp_urls"
            exit 1
        fi
        
    elif [ "$ACTION" = "check" ]; then
        # 페이지 인덱싱 상태 확인
        if check_registered_pages "$temp_urls"; then
            rm -f "$temp_urls"
            exit 0
        else
            error_log "인덱싱 상태 확인 실패"
            rm -f "$temp_urls"
            exit 1
        fi
    fi
}

# 스크립트 실행
main "$@"