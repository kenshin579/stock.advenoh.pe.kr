#!/bin/bash

# Phase 6: 문서화 및 유지보수 완료 검증 스크립트
# TASK-036 ~ TASK-041 완료 확인

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 Phase 6: 문서화 및 유지보수 완료 검증 시작"
echo "=================================================="

# 1. Next.js 마이그레이션 가이드 확인 (TASK-036)
log "📚 Testing Next.js migration guide (TASK-036)..."

if [ -f "docs/issue-9/migration-guide.md" ]; then
    success "Next.js 마이그레이션 가이드 파일 존재"
    
    # 가이드 내용 확인
    if grep -q "마이그레이션 단계" "docs/issue-9/migration-guide.md"; then
        success "마이그레이션 단계 섹션 확인"
    else
        warning "마이그레이션 단계 섹션이 없습니다"
    fi
    
    if grep -q "문제 해결 가이드" "docs/issue-9/migration-guide.md"; then
        success "문제 해결 가이드 섹션 확인"
    else
        warning "문제 해결 가이드 섹션이 없습니다"
    fi
else
    error "Next.js 마이그레이션 가이드 파일이 없습니다"
fi

# 2. 배포 프로세스 문서화 확인 (TASK-037)
log "🚀 Testing deployment process documentation (TASK-037)..."

if [ -f "docs/issue-9/deployment-guide.md" ]; then
    success "배포 프로세스 문서화 파일 존재"
    
    # 배포 가이드 내용 확인
    if grep -q "배포 단계별 가이드" "docs/issue-9/deployment-guide.md"; then
        success "배포 단계별 가이드 섹션 확인"
    else
        warning "배포 단계별 가이드 섹션이 없습니다"
    fi
    
    if grep -q "문제 해결 가이드" "docs/issue-9/deployment-guide.md"; then
        success "배포 문제 해결 가이드 섹션 확인"
    else
        warning "배포 문제 해결 가이드 섹션이 없습니다"
    fi
else
    error "배포 프로세스 문서화 파일이 없습니다"
fi

# 3. 개발 환경 설정 가이드 확인 (TASK-038)
log "⚙️ Testing development environment setup guide (TASK-038)..."

if [ -f "docs/issue-9/development-setup.md" ]; then
    success "개발 환경 설정 가이드 파일 존재"
    
    # 개발 가이드 내용 확인
    if grep -q "초기 설정" "docs/issue-9/development-setup.md"; then
        success "초기 설정 섹션 확인"
    else
        warning "초기 설정 섹션이 없습니다"
    fi
    
    if grep -q "디버깅 가이드" "docs/issue-9/development-setup.md"; then
        success "디버깅 가이드 섹션 확인"
    else
        warning "디버깅 가이드 섹션이 없습니다"
    fi
else
    error "개발 환경 설정 가이드 파일이 없습니다"
fi

# 4. 사용하지 않는 코드 제거 확인 (TASK-039)
log "🧹 Testing unused code removal (TASK-039)..."

# Vite 관련 파일 제거 확인
if [ ! -f "vite.config.ts" ]; then
    success "vite.config.ts 파일 제거됨"
else
    error "vite.config.ts 파일이 아직 존재합니다"
fi

if [ ! -f "server/vite.ts" ]; then
    success "server/vite.ts 파일 제거됨"
else
    error "server/vite.ts 파일이 아직 존재합니다"
fi

if [ ! -f "build-static.sh" ]; then
    success "build-static.sh 파일 제거됨"
else
    error "build-static.sh 파일이 아직 존재합니다"
fi

# package.json에서 Vite 의존성 제거 확인
if ! grep -q "vite" "package.json"; then
    success "package.json에서 Vite 의존성 제거됨"
else
    warning "package.json에 Vite 관련 의존성이 남아있을 수 있습니다"
fi

if ! grep -q "wouter" "package.json"; then
    success "package.json에서 Wouter 의존성 제거됨"
else
    warning "package.json에 Wouter 의존성이 남아있을 수 있습니다"
fi

# 5. Next.js 최적화 리팩토링 확인 (TASK-040)
log "⚡ Testing Next.js optimization refactoring (TASK-040)..."

if [ -f "docs/issue-9/refactoring-guide.md" ]; then
    success "Next.js 최적화 리팩토링 가이드 파일 존재"
    
    # 리팩토링 가이드 내용 확인
    if grep -q "컴포넌트 구조 최적화" "docs/issue-9/refactoring-guide.md"; then
        success "컴포넌트 구조 최적화 섹션 확인"
    else
        warning "컴포넌트 구조 최적화 섹션이 없습니다"
    fi
    
    if grep -q "성능 최적화 리팩토링" "docs/issue-9/refactoring-guide.md"; then
        success "성능 최적화 리팩토링 섹션 확인"
    else
        warning "성능 최적화 리팩토링 섹션이 없습니다"
    fi
else
    error "Next.js 최적화 리팩토링 가이드 파일이 없습니다"
fi

# 6. 주석 및 문서화 개선 확인 (TASK-041)
log "📝 Testing comment and documentation improvement (TASK-041)..."

if [ -f "docs/issue-9/documentation-guide.md" ]; then
    success "주석 및 문서화 개선 가이드 파일 존재"
    
    # 문서화 가이드 내용 확인
    if grep -q "JSDoc 주석 표준" "docs/issue-9/documentation-guide.md"; then
        success "JSDoc 주석 표준 섹션 확인"
    else
        warning "JSDoc 주석 표준 섹션이 없습니다"
    fi
    
    if grep -q "API 문서화" "docs/issue-9/documentation-guide.md"; then
        success "API 문서화 섹션 확인"
    else
        warning "API 문서화 섹션이 없습니다"
    fi
else
    error "주석 및 문서화 개선 가이드 파일이 없습니다"
fi

# 7. README 파일 업데이트 확인
log "📖 Testing README file update..."

if [ -f "README.md" ]; then
    success "README.md 파일 존재"
    
    # README 내용 확인
    if grep -q "Next.js" "README.md"; then
        success "README에 Next.js 관련 내용 포함"
    else
        warning "README에 Next.js 관련 내용이 부족할 수 있습니다"
    fi
    
    if grep -q "설치 및 실행" "README.md"; then
        success "README에 설치 및 실행 가이드 포함"
    else
        warning "README에 설치 및 실행 가이드가 부족할 수 있습니다"
    fi
else
    error "README.md 파일이 없습니다"
fi

# 8. 코드 품질 확인
log "🔍 Testing code quality..."

# TypeScript 컴파일 확인
if npm run check > /dev/null 2>&1; then
    success "TypeScript 컴파일 성공"
else
    error "TypeScript 컴파일 오류가 있습니다"
fi

# ESLint 검사 확인
if cd client_nextjs && npm run lint > /dev/null 2>&1; then
    success "ESLint 검사 통과"
    cd ..
else
    warning "ESLint 경고가 있을 수 있습니다"
    cd ..
fi

# 9. 빌드 성공 확인
log "🔨 Testing build process..."

if npm run build:nextjs > /dev/null 2>&1; then
    success "Next.js 빌드 성공"
else
    error "Next.js 빌드 실패"
fi

echo ""
echo "=================================================="
echo "📊 Phase 6 완료 검증 결과 요약"
echo "=================================================="

# 완료된 작업 카운트
completed_tasks=0
total_tasks=6

# 각 작업별 완료 상태 확인
tasks=(
    "TASK-036: Next.js 마이그레이션 가이드 작성"
    "TASK-037: 배포 프로세스 문서화"
    "TASK-038: 개발 환경 설정 가이드"
    "TASK-039: 사용하지 않는 코드 제거"
    "TASK-040: Next.js 최적화 리팩토링"
    "TASK-041: 주석 및 문서화 개선"
)

for task in "${tasks[@]}"; do
    if [[ $task == *"TASK-036"* ]] && [ -f "docs/issue-9/migration-guide.md" ]; then
        echo "✅ $task"
        ((completed_tasks++))
    elif [[ $task == *"TASK-037"* ]] && [ -f "docs/issue-9/deployment-guide.md" ]; then
        echo "✅ $task"
        ((completed_tasks++))
    elif [[ $task == *"TASK-038"* ]] && [ -f "docs/issue-9/development-setup.md" ]; then
        echo "✅ $task"
        ((completed_tasks++))
    elif [[ $task == *"TASK-039"* ]] && [ ! -f "vite.config.ts" ] && [ ! -f "server/vite.ts" ]; then
        echo "✅ $task"
        ((completed_tasks++))
    elif [[ $task == *"TASK-040"* ]] && [ -f "docs/issue-9/refactoring-guide.md" ]; then
        echo "✅ $task"
        ((completed_tasks++))
    elif [[ $task == *"TASK-041"* ]] && [ -f "docs/issue-9/documentation-guide.md" ]; then
        echo "✅ $task"
        ((completed_tasks++))
    else
        echo "❌ $task"
    fi
done

echo ""
echo "📈 Phase 6 진행률: $completed_tasks/$total_tasks (${completed_tasks}00/$total_tasks}%)"

if [ $completed_tasks -eq $total_tasks ]; then
    echo ""
    success "🎉 Phase 6: 문서화 및 유지보수가 성공적으로 완료되었습니다!"
    echo ""
    echo "다음 단계: Phase 7 - 최종 검증 및 배포"
else
    echo ""
    warning "⚠️ Phase 6가 완전히 완료되지 않았습니다. 누락된 작업을 확인해주세요."
fi

echo ""
echo "=================================================="
echo "🔗 관련 문서"
echo "=================================================="
echo "📚 마이그레이션 가이드: docs/issue-9/migration-guide.md"
echo "🚀 배포 가이드: docs/issue-9/deployment-guide.md"
echo "⚙️ 개발 환경 가이드: docs/issue-9/development-setup.md"
echo "⚡ 리팩토링 가이드: docs/issue-9/refactoring-guide.md"
echo "📝 문서화 가이드: docs/issue-9/documentation-guide.md"
echo "==================================================" 