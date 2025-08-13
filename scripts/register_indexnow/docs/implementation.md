# IndexNow API 등록 스크립트 구현

## 개요
contents 폴더의 모든 하위 폴더를 스캔하여 IndexNow API로 URL 등록을 수행하는 bash 스크립트

## 구현 방식

### 1. 폴더 스캔 및 URL 생성
```bash
# contents 폴더 하위의 모든 폴더를 재귀적으로 스캔
find contents -type d -mindepth 1 -maxdepth 2 | while read -r dir; do
    # 폴더명을 URL 경로로 변환
    url_path=$(echo "$dir" | sed 's|^contents/||')
    full_url="https://stock.advenoh.pe.kr/$url_path"
    echo "$full_url"
done
```

### 2. IndexNow API 호출
```bash
# URL 목록을 JSON 형식으로 구성
url_list=$(find contents -type d -mindepth 1 -maxdepth 2 | \
    sed 's|^contents/||' | \
    sed 's|^|https://stock.advenoh.pe.kr/|' | \
    jq -R -s -c 'split("\n")[:-1]')

# API 호출
curl --location 'https://api.indexnow.org/IndexNow' \
    --header 'Content-Type: application/json; charset=utf-8' \
    --data "{
        \"host\": \"stock.advenoh.pe.kr\",
        \"key\": \"ab058714f6014e9aa4d13197ad1e8833\",
        \"keyLocation\": \"https://stock.advenoh.pe.kr/6f4a19b722d44eeda34ff148f71822c9\",
        \"urlList\": $url_list
    }"
```

## 주요 기능

### 폴더 구조 처리
- `contents/etc/` → `https://stock.advenoh.pe.kr/etc/`
- `contents/etf/` → `https://stock.advenoh.pe.kr/etf/`
- `contents/stock/` → `https://stock.advenoh.pe.kr/stock/`
- `contents/weekly/` → `https://stock.advenoh.pe.kr/weekly/`

### 에러 처리
- API 응답 상태 코드 확인
- 네트워크 오류 시 재시도 로직
- 잘못된 URL 형식 검증

### 로그 기록
- 실행 시간 기록
- 처리된 URL 개수 기록
- API 응답 결과 기록
- 에러 발생 시 상세 정보 기록

## 실행 방법

```bash
# 스크립트 실행 권한 부여
chmod +x register_indexnow.sh

# 스크립트 실행
./register_indexnow.sh
```

## 출력 예시

```
[2025-01-27 10:30:00] IndexNow 등록 시작
[2025-01-27 10:30:01] 총 45개 URL 처리
[2025-01-27 10:30:02] API 호출 성공
[2025-01-27 10:30:02] 응답: {"message":"OK"}
[2025-01-27 10:30:02] IndexNow 등록 완료
```

## 주의사항

1. **API 제한사항**: IndexNow API는 URL 개수와 요청 빈도에 제한이 있을 수 있음
2. **키 검증**: `keyLocation` 파일이 실제로 존재하는지 확인 필요
3. **URL 형식**: 모든 URL이 올바른 형식인지 검증
4. **권한**: 스크립트 실행 권한이 필요함

## 향후 개선 사항

- 중복 등록 방지 메커니즘 추가
- 정기 실행을 위한 cron job 설정
- 더 상세한 에러 로깅 및 알림 기능
- 성공/실패 URL 목록 별도 저장