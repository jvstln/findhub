# Technology Stack

## Build System

- **Monorepo:** Turborepo for task orchestration and caching
- **Package Manager:** Bun (v1.2.19)
- **Runtime:** Bun for server-side execution
- **Bundler:** tsdown for package builds, Next.js built-in for web app

## Core Technologies

### Frontend (apps/web)
- **Framework:** Next.js 16.0.0 with React 19.2.0
- **Styling:** TailwindCSS v4 with shadcn/ui components
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form with Zod validation
- **Animations:** Motion (Framer Motion)
- **PWA:** @ducanh2912/next-pwa
- **Theming:** next-themes
- **Notifications:** Sonner

### Backend (apps/server)
- **Framework:** Hono v4
- **Validation:** Zod with @hono/zod-validator
- **Runtime:** Bun with hot reload

### Shared Packages
- **Database:** Drizzle ORM with PostgreSQL
- **Authentication:** Better-Auth v1.3.28
- **Validation:** Zod v4.1.11
- **TypeScript:** v5.8.2

## Code Quality

- **Linter/Formatter:** Biome (replaces ESLint + Prettier)
- **Testing:** Playwright for E2E tests
- **Type Checking:** TypeScript strict mode

## Common Commands

### Development
```bash
bun run dev              # Start all apps (web + server)
bun run dev:web          # Start frontend only (port 3001)
bun run dev:server       # Start backend only (port 3000)
```

### Database
```bash
bun run db:push          # Push schema changes to database
bun run db:studio        # Open Drizzle Studio UI
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
```

### Build & Quality
```bash
bun run build            # Build all apps
bun run check            # Run Biome linting and formatting
bun run check-types      # Type check all packages
```

### Testing
```bash
bun run test:e2e         # Run Playwright tests
bun run test:e2e:ui      # Run tests with Playwright UI
bun run test:e2e:headed  # Run tests in headed mode
```

### PWA
```bash
cd apps/web && bun run generate-pwa-assets  # Generate PWA icons/splash screens
```

## Configuration Files

- **biome.json:** Linting and formatting rules (tabs, double quotes, sorted classes)
- **turbo.json:** Monorepo task pipeline configuration
- **playwright.config.ts:** E2E test configuration
- **components.json:** shadcn/ui configuration (web app)
- **drizzle.config.ts:** Database configuration (packages/db)
