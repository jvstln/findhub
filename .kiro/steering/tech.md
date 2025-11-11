---
inclusion: always
---

# Technology Stack

## Runtime & Package Manager

- **Bun** (v1.2.19) - Runtime environment and package manager
- Use `bun` commands instead of `npm` or `yarn`

## Build System

- **Turborepo** - Monorepo build orchestration with caching
- **tsdown** - TypeScript compilation for packages
- **Biome** - Linting and formatting (replaces ESLint + Prettier)

## Frontend (apps/web)

- **Next.js 16** - React framework with App Router
- **React 19.2** - UI library
- **TailwindCSS 4** - Utility-first styling
- **shadcn/ui** via radix-ui - Component library
- **TanStack Query** - Server state management
- **TanStack Form** - Form handling
- **next-themes** - Theme management
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

## Backend (apps/server)

- **Hono** - Lightweight web framework
- **Better-Auth** - Authentication system
- **Drizzle ORM** - Database queries
- **PostgreSQL** - Database

## Shared Packages

- **@findhub/auth** - Authentication configuration and logic
- **@findhub/db** - Database schema and queries
- **Zod** - Runtime validation and type safety

## Code Quality

- **TypeScript 5.8** - Strict mode enabled
- **Biome** - Formatting (tabs, double quotes) and linting
- Strict TypeScript settings: `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`

## Common Commands

### Development

```bash
bun run dev              # Start all apps
bun run dev:web          # Start web app only (port 3001)
bun run dev:server       # Start server only (port 3000)
```

### Building

```bash
bun run build            # Build all apps
bun run check-types      # Type check all apps
```

### Database

```bash
bun run db:push          # Push schema to database
bun run db:studio        # Open Drizzle Studio
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
```

### Code Quality

```bash
bun run check            # Run Biome formatting and linting
```

### PWA Assets

```bash
cd apps/web && bun run generate-pwa-assets
```

## Module System

- ESM modules throughout (`"type": "module"`)
- `bundler` module resolution
- Workspace packages use `workspace:*` protocol
- Catalog dependencies for version consistency
