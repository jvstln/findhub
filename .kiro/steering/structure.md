---
inclusion: always
---

# Project Structure

## Monorepo Architecture

Turborepo monorepo with two apps and three shared packages:

```
findhub/
├── apps/
│   ├── web/         # Next.js frontend (port 3001)
│   └── server/      # Hono backend API (port 3000)
└── packages/
    ├── auth/        # Authentication logic (@findhub/auth)
    ├── db/          # Database schema and queries (@findhub/db)
    └── shared/      # Shared types and validation (@findhub/shared)
```

## Package Responsibilities

### @findhub/shared

**Purpose:** Framework-agnostic types and validation schemas

- TypeScript types (enums, interfaces, utility types)
- Zod validation schemas
- Re-exports database types from `@findhub/db` for convenience
- No database or framework dependencies (only Zod)
- Can be used in frontend, backend, or mobile apps
- All types, schema or utility functions that require no specific dependency should be included and exported from this package

**File naming conventions:**

- Types: `*.type.ts` (e.g., `item.type.ts`)
- Schemas: `*.schema.ts` (e.g., `item.schema.ts`)

### @findhub/db

**Purpose:** Database schema and type inference

- Drizzle ORM schema definitions
- Database connection and configuration
- Type inference using `$inferSelect` from schemas
- Exports inferred types (e.g., `LostItem`, `StatusHistoryEntry`)
- Single source of truth for database structure

### @findhub/auth

**Purpose:** Authentication configuration and logic

- Better-Auth setup and configuration
- Authentication utilities and helpers
- Depends on `@findhub/db` for user storage

## Dependency Rules

**Import restrictions:**

- `apps/web` → can import `@findhub/auth` and `@findhub/shared`
- `apps/server` → can import `@findhub/auth`, `@findhub/db`, and `@findhub/shared`
- `@findhub/auth` → depends on `@findhub/db`
- `@findhub/shared` → depends on `@findhub/db` (for type re-exports)
- `@findhub/db` → no internal dependencies

**Package references:**

- Use `workspace:*` protocol for internal packages
- Use catalog versions for shared dependencies (better-auth, zod, typescript)

## Type Architecture

**Database types (from @findhub/db):**

- Inferred from Drizzle schemas using `$inferSelect`
- Examples: `LostItem`, `StatusHistoryEntry`, `ItemStatus`
- Single source of truth - types match database structure

**Application types (from @findhub/shared):**

- Application-specific enums and interfaces
- Examples: `ItemCategory`, `SearchFilters`, `PaginatedResponse`
- Re-exports database types for convenience

**Usage pattern:**

```typescript
// Recommended: Import all types from shared
import type { LostItem, ItemStatus, SearchFilters } from "@findhub/shared";

// Alternative: Import database types directly
import type { LostItem } from "@findhub/db";
import type { SearchFilters } from "@findhub/shared";
```

## Package Exports

All packages (`@findhub/auth`, `@findhub/db`, `@findhub/shared`):

- Main export: `src/index.ts`
- Individual exports: `src/*.ts` (allows importing specific modules)
- Build output: `dist/` directory (gitignored)

## File Locations

**Entry points:**

- Frontend: Standard Next.js App Router structure in `apps/web/app/`
- Backend: `apps/server/src/index.ts`

**Configuration:**

- Root configs: `biome.json`, `turbo.json`, `tsconfig.base.json`, `bunfig.toml`
- Each workspace has its own `tsconfig.json` extending base config
- Database migrations: `packages/db/` contains Drizzle Kit config

**Environment:**

- Server env vars: `apps/server/.env` (included in Turbo task inputs)

**Build artifacts (gitignored):**

- `dist/` - TypeScript compilation output
- `.turbo/` - Turborepo cache
- `.next/` - Next.js build output
