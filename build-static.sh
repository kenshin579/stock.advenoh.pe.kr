#!/bin/bash

# Static deployment build script
# This builds only the frontend for static deployment

echo "Building frontend for static deployment..."
npx vite build

# Also copy files to dist/ for deployment compatibility
echo "Copying files to dist/ for deployment..."
cp -r dist/public/* dist/

echo "Static build completed!"
echo "Frontend files are in dist/public/ and dist/"