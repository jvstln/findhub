#!/bin/bash

# FindHub Web App Deployment Script
# This script builds and deploys the public web application

set -e

echo "🚀 Starting FindHub Web App deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install --frozen-lockfile

# Type check
echo "🔍 Running type checks..."
bun run check-types

# Lint and format
echo "✨ Running linter and formatter..."
bun run check

# Build web app
echo "🏗️  Building web application..."
turbo build --filter=web

echo "✅ Web app build completed successfully!"

# Optional: Deploy to Vercel (uncomment if using Vercel)
# echo "🌐 Deploying to Vercel..."
# cd apps/web
# vercel --prod
# cd ../..

echo "🎉 Web app deployment completed!"