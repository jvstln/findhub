# Project Structure

## Monorepo Layout

```
findhub/
├── apps/                    # Application workspaces
│   ├── web/                # Frontend Next.js app (port 3001)
│   └── server/             # Backend Hono API (port 3000)
├── packages/               # Shared packages
│   ├── auth/              # Authentication configuration
│   ├── db/                # Database schemas and client
│   └── shared/            # Shared types and validation
├── e2e/                   # Playwright E2E tests
└── [config files]         # Root-level configuration
```

## Apps

### apps/web (Frontend)
- Next.js application with App Router
- Port: 3001
- Contains: UI components, pages, client-side logic
- Uses: shadcn/ui components, TailwindCSS, React Query

### apps/server (Backend)
- Hono API server
- Port: 3000
- Contains: API routes, business logic, file handling
- Uses: Hono routing, Zod validation

## Packages

### @findhub/db
Database layer with subpath exports:
- `.` - Database instance (server-side only)
- `./types` - Inferred TypeScript types (build-time only)
- `./schemas` - Drizzle table schemas (server-side only)

**Important:** Frontend uses `@findhub/db/types` as type-only imports to avoid bundling heavy database dependencies.

### @findhub/shared
Shared application logic with subpath exports:
- `./types` - Application-specific types
- `./schemas` - Zod validation schemas (runtime)

**Dependencies:** `@findhub/db` is a devDependency (types only, not bundled).

### @findhub/auth
Authentication configuration using Better-Auth.

## Type Architecture Pattern

**Type Flow:**
```
Database Schema (Drizzle)
    ↓
@findhub/db/types (inferred types)
    ↓ (devDependency - build time only)
@findhub/shared/types (application types)
    ↓
Available to frontend & backend (no runtime cost)
```

**Import Guidelines:**
- Frontend: Use `type` imports from `@findhub/db/types` (no runtime cost)
- Backend: Can import database instance from `@findhub/db`
- Both: Use validation schemas from `@findhub/shared/schemas` (runtime)

## Naming Conventions

- **Schema files:** `*.schema.ts` (Zod validation)
- **Type files:** `*.type.ts` (TypeScript types)
- **Database types:** Singular PascalCase (e.g., `LostItem`)
- **Application types:** Descriptive PascalCase (e.g., `SearchFilters`)

## Configuration Files

- **Root level:** Turborepo, Biome, Playwright, TypeScript configs
- **App level:** Next.js config (web), tsdown config (server)
- **Package level:** Individual package.json with workspace dependencies

## Workspace Dependencies

Use `workspace:*` protocol for internal package references in package.json files.

## E2E Tests

Located in `/e2e` directory with Playwright configuration at root level. Tests cover admin flows, public flows, file uploads, offline functionality, and status workflows.
