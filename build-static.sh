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

# Copy API files directly to dist/ as well (some deployment systems use dist/ as root)
echo "Copying API data to dist/ root for deployment compatibility..."
cp -r client/public/api/ dist/api/

# Also copy all files to dist/ for deployment compatibility
echo "Copying files to dist/ for deployment..."
cp -r dist/public/* dist/

echo "Static build completed!"
echo "Frontend files are in dist/public/ and dist/"