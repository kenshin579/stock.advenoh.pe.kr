#!/bin/bash

# Static deployment build script
# This builds only the frontend for static deployment

echo "Generating static blog data..."
npx tsx server/scripts/generateStaticData.ts

# Copy API data to client's public directory so Vite includes it in the build
echo "Copying API data to client public directory..."
mkdir -p client/public/api
cp -r public/api/* client/public/api/

echo "Building frontend for static deployment..."
npx vite build

# Also copy files to dist/ for deployment compatibility
echo "Copying files to dist/ for deployment..."
cp -r dist/public/* dist/

echo "Static build completed!"
echo "Frontend files are in dist/public/ and dist/"