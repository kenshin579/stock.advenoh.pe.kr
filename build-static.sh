#!/bin/bash

# Static deployment build script
# This builds only the frontend for static deployment

echo "Building frontend for static deployment..."
npx vite build

echo "Static build completed!"
echo "Frontend files are in dist/public/"