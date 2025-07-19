#!/bin/bash

# Static deployment build script
# This builds only the frontend for static deployment

echo "Generating static blog data..."
npx tsx server/scripts/generateStaticData.ts

echo "Building frontend for static deployment..."
npx vite build

# Copy API data to build output
echo "Copying API data to build output..."
cp -r public/api/ dist/public/
cp -r public/api/ dist/

# Also copy files to dist/ for deployment compatibility
echo "Copying files to dist/ for deployment..."
cp -r dist/public/* dist/

echo "Static build completed!"
echo "Frontend files are in dist/public/ and dist/"