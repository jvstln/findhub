#!/bin/bash

# FindHub Complete Deployment Script
# This script deploys all applications (web, admin, server)

set -e

echo "🚀 Starting complete FindHub deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install --frozen-lockfile

# Type check all packages
echo "🔍 Running type checks..."
bun run check-types

# Lint and format
echo "✨ Running linter and formatter..."
bun run check

# Run E2E tests
echo "🧪 Running E2E tests..."
bun run test:e2e

# Build all applications
echo "🏗️  Building all applications..."
bun run build

# Run database migrations
echo "🗄️  Running database migrations..."
bun run db:migrate

echo "✅ All applications built successfully!"

# Deploy individual applications
echo "🌐 Deploying applications..."

# Deploy server first (API dependency)
echo "📡 Deploying server..."
./scripts/deploy-server.sh

# Deploy web and admin in parallel
echo "🌍 Deploying web and admin applications..."
./scripts/deploy-web.sh &
./scripts/deploy-admin.sh &

# Wait for both deployments to complete
wait

echo "🎉 Complete deployment finished successfully!"
echo ""
echo "Applications should be available at:"
echo "  🌐 Web App: https://findhub.example.com"
echo "  ⚙️  Admin App: https://admin.findhub.example.com"
echo "  📡 API Server: https://api.findhub.example.com"