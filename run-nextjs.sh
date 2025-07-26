#!/bin/bash

echo "🚀 Switching to Next.js application..."
echo "📁 Changing to client_nextjs directory"

cd client_nextjs

echo "🔧 Checking Next.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🏃‍♂️ Starting Next.js development server..."
npm run dev