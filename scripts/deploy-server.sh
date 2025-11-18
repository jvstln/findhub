#!/bin/bash

# FindHub Server Deployment Script
# This script builds and deploys the API server

set -e

echo "🚀 Starting FindHub Server deployment..."

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

# Build server
echo "🏗️  Building server application..."
turbo build --filter=server

echo "✅ Server build completed successfully!"

# Run database migrations
echo "🗄️  Running database migrations..."
bun run db:migrate

echo "🎉 Server deployment completed!"