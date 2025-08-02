#!/bin/bash

# Production deployment script
# This script ensures the application is built and started correctly for production deployment

set -e

echo "🚀 Starting production deployment process..."

# Set production environment
export NODE_ENV=production
export PORT=5000

# Build the application
echo "🔨 Building application for production..."
npm run build:prod

echo "✅ Build completed successfully!"

# Start the production server
echo "🚀 Starting production server..."
npm run start:prod