#!/bin/bash

# FindHub Admin App Deployment Script
# This script builds and deploys the admin application

set -e

echo "🚀 Starting FindHub Admin App deployment..."

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

# Build admin app
echo "🏗️  Building admin application..."
turbo build --filter=@findhub/admin

echo "✅ Admin app build completed successfully!"

# Optional: Deploy to Vercel (uncomment if using Vercel)
# echo "🌐 Deploying to Vercel..."
# cd apps/admin
# vercel --prod
# cd ../..

echo "🎉 Admin app deployment completed!"