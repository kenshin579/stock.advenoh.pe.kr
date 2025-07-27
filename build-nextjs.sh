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