# FindHub Deployment Guide

This guide covers deploying the FindHub lost and found system with separate web, admin, and server applications.

## Architecture Overview

FindHub consists of three independently deployable applications:

1. **Public Web App** (`apps/web`) - Next.js application for public users
2. **Admin Application** (`apps/admin`) - Next.js application for administrators  
3. **API Server** (`apps/server`) - Hono backend API

## Production URL Structure

- **Public Web:** `https://findhub.example.com`
- **Admin Panel:** `https://admin.findhub.example.com`
- **API Server:** `https://api.findhub.example.com`

## Environment Variables

### Shared Environment Variables

All applications require these base environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="https://your-domain.com"

# API Configuration
NEXT_PUBLIC_API_URL="https://api.findhub.example.com"
```

### Web App Environment Variables (`apps/web`)

```bash
# Base variables (see Shared section above)
BETTER_AUTH_URL="https://findhub.example.com"

# PWA Configuration (optional)
NEXT_PUBLIC_PWA_ENABLED="true"
```

### Admin App Environment Variables (`apps/admin`)

```bash
# Base variables (see Shared section above)  
BETTER_AUTH_URL="https://admin.findhub.example.com"

# Admin-specific configuration
NEXT_PUBLIC_ADMIN_MODE="true"
```

### Server Environment Variables (`apps/server`)

```bash
# Base variables (see Shared section above)
PORT="3000"

# CORS Configuration
CORS_ORIGIN="https://findhub.example.com,https://admin.findhub.example.com"

# File Upload (if using Supabase)
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## Build Commands

### Development
```bash
# Start all applications
bun run dev

# Start individual applications
bun run dev:web      # Web app on port 3001
bun run dev:admin    # Admin app on port 3002  
bun run dev:server   # Server on port 3000
```

### Production Build
```bash
# Build all applications
bun run build

# Build individual applications
turbo build --filter=web
turbo build --filter=@findhub/admin
turbo build --filter=server
```

## Deployment Methods

### Method 1: Vercel (Recommended for Next.js apps)

#### Web App Deployment
1. Connect your repository to Vercel
2. Set build command: `cd ../.. && turbo build --filter=web`
3. Set output directory: `apps/web/.next`
4. Configure environment variables in Vercel dashboard

#### Admin App Deployment  
1. Create separate Vercel project for admin app
2. Set build command: `cd ../.. && turbo build --filter=@findhub/admin`
3. Set output directory: `apps/admin/.next`
4. Configure admin-specific environment variables

### Method 2: Docker Deployment

#### Web App Dockerfile (`apps/web/Dockerfile`)
```dockerfile
FROM node:20-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN bun run build --filter=web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/web/server.js"]
```

#### Admin App Dockerfile (`apps/admin/Dockerfile`)
```dockerfile
FROM node:20-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/*/package.json ./packages/*/
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN bun run build --filter=@findhub/admin

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/admin/server.js"]
```

#### Server Dockerfile (`apps/server/Dockerfile`)
```dockerfile
FROM oven/bun:1.2.19-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/
RUN bun install --frozen-lockfile

FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN bun run build --filter=server

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
```

### Method 3: Traditional VPS/Server

#### Using PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Build applications
bun run build

# Start applications with PM2
pm2 start ecosystem.config.js
```

#### PM2 Configuration (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [
    {
      name: 'findhub-web',
      cwd: './apps/web',
      script: 'bun',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'findhub-admin', 
      cwd: './apps/admin',
      script: 'bun',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'findhub-server',
      cwd: './apps/server', 
      script: 'bun',
      args: 'run dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

## CI/CD Pipeline

### GitHub Actions Configuration (`.github/workflows/deploy.yml`)

```yaml
name: Deploy FindHub Applications

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.2.19
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Type check
        run: bun run check-types
      
      - name: Lint and format
        run: bun run check
      
      - name: Build all apps
        run: bun run build
      
      - name: Run E2E tests
        run: bun run test:e2e

  deploy-web:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.2.19
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Build web app
        run: turbo build --filter=web
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_WEB_PROJECT_ID }}
          working-directory: ./apps/web

  deploy-admin:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.2.19
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Build admin app
        run: turbo build --filter=@findhub/admin
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_ADMIN_MODE: "true"
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_ADMIN_PROJECT_ID }}
          working-directory: ./apps/admin

  deploy-server:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.2.19
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Build server
        run: turbo build --filter=server
      
      - name: Deploy server
        # Add your server deployment step here
        # This could be Docker push, SSH deploy, etc.
        run: echo "Deploy server to your hosting provider"
```

## Database Migration

### Production Database Setup
```bash
# Run migrations on production database
bun run db:migrate

# Verify database schema
bun run db:studio
```

### Environment-specific Migrations
```bash
# Development
DATABASE_URL="postgresql://localhost:5432/findhub_dev" bun run db:migrate

# Staging  
DATABASE_URL="postgresql://staging-host:5432/findhub_staging" bun run db:migrate

# Production
DATABASE_URL="postgresql://prod-host:5432/findhub_prod" bun run db:migrate
```

## Monitoring and Health Checks

### Health Check Endpoints

Add these endpoints to your server for monitoring:

```typescript
// apps/server/src/routes/health.ts
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});

app.get('/health/db', async (c) => {
  try {
    // Test database connection
    await db.select().from(items).limit(1);
    return c.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return c.json({ status: 'error', database: 'disconnected' }, 500);
  }
});
```

### Application Monitoring

Monitor these metrics in production:

- **Response times:** API endpoint performance
- **Error rates:** 4xx/5xx HTTP responses  
- **Database connections:** Connection pool usage
- **Memory usage:** Application memory consumption
- **Uptime:** Application availability

## Security Considerations

### HTTPS Configuration
- Use HTTPS for all production deployments
- Configure proper SSL certificates
- Set up HSTS headers

### CORS Configuration
```typescript
// apps/server/src/index.ts
app.use('*', cors({
  origin: [
    'https://findhub.example.com',
    'https://admin.findhub.example.com'
  ],
  credentials: true
}));
```

### Environment Security
- Never commit `.env` files to version control
- Use secure secret management (AWS Secrets Manager, etc.)
- Rotate secrets regularly
- Use different secrets for each environment

## Troubleshooting

### Common Issues

1. **Build failures:** Check Node.js/Bun version compatibility
2. **Database connection:** Verify DATABASE_URL and network access
3. **Authentication issues:** Check BETTER_AUTH_SECRET and URL configuration
4. **CORS errors:** Verify CORS_ORIGIN includes your frontend domains

### Logs and Debugging

```bash
# View application logs with PM2
pm2 logs findhub-web
pm2 logs findhub-admin  
pm2 logs findhub-server

# Monitor application status
pm2 status
pm2 monit
```

## Rollback Strategy

### Quick Rollback
```bash
# Rollback to previous deployment
pm2 reload ecosystem.config.js

# Or with Vercel
vercel --prod --rollback
```

### Database Rollback
```bash
# Rollback database migration (if needed)
bun run db:rollback
```

## Performance Optimization

### Next.js Optimization
- Enable static generation where possible
- Use Next.js Image optimization
- Configure proper caching headers
- Enable compression

### Server Optimization  
- Use connection pooling for database
- Implement proper caching strategies
- Configure rate limiting
- Monitor and optimize slow queries

1. **Public Web App** (