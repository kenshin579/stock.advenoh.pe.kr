# 목적
내 블로그의 모든 페이지를 indexNow API를 통해서 등록한다. 

## 요구사항
- indexNow API로 사이트를 등록하려고 한다. 
  - 샘플로 `curl.sh` 파일에 동작하는 curl 명령어를 작성해두었다. 
- contents 폴더에 있는 모든 폴더에 맞게 urlList를 작성해주면 된다.
- IndexNow API 제한사항 준수 (URL 개수 제한, 요청 빈도 등)

## URL 생성 규칙
- 기본 패턴: `https://stock.advenoh.pe.kr/{폴더명}`
- 폴더명은 kebab-case로 변환 (이미 적용됨)
- 특수문자나 공백 처리 방법 명시

ex. 
1. contents/etc/asset-management-abbreviations -> https://stock.advenoh.pe.kr/etc/asset-management-abbreviations
2. /Users/user/WebstormProjects/stock.advenoh.pe.kr-replit/contents/weekly/2024-june-week2-korea-us-weekly-leading-sector-summary -> https://stock.advenoh.pe.kr/weekly/2024-june-week2-korea-us-weekly-leading-sector-summary

## 운영 요구사항
- 스크립트 실행: 수동으로 실행 (자동화 불필요)
- 중복 등록 방지: 현재 단계에서는 고려하지 않음
- 로그 기록 및 모니터링 방법

## 구현 세부사항
- 에러 처리 및 재시도 로직
- API 응답 검증 방법
- 실행 결과 보고서 생성

## 구현 지침
- 스크립트는 bash shell로 작성해줘

