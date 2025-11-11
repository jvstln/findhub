---
inclusion: always
---

# Project Structure

## Monorepo Layout

```
findhub/
├── apps/
│   ├── web/         # Next.js frontend application
│   └── server/      # Hono backend API
├── packages/
│   ├── auth/        # Shared authentication logic
│   └── db/          # Database schema and queries
```

## Apps

### apps/web (Frontend)

- **Port**: 3001
- **Framework**: Next.js 16 with App Router
- **Entry**: Standard Next.js structure
- **Dependencies**: Can import from `@findhub/auth`

### apps/server (Backend)

- **Port**: 3000
- **Framework**: Hono
- **Entry**: `src/index.ts`
- **Dependencies**: Can import from `@findhub/auth` and `@findhub/db`

## Packages

### @findhub/auth

- Shared authentication configuration using Better-Auth
- Exports from `src/index.ts` and individual files via `src/*.ts`
- Depends on `@findhub/db`

### @findhub/db

- Database schema and Drizzle ORM configuration
- PostgreSQL connection and queries
- Exports from `src/index.ts` and individual files via `src/*.ts`
- Contains Drizzle Kit configuration for migrations

## Workspace Dependencies

- Packages use `workspace:*` protocol to reference each other
- Shared dependencies (better-auth, zod, typescript, etc.) use catalog versions
- Each package has its own `package.json` with specific dependencies

## Configuration Files

- `biome.json` - Linting and formatting rules (tabs, double quotes)
- `turbo.json` - Turborepo task pipeline configuration
- `tsconfig.base.json` - Shared TypeScript configuration
- `bunfig.toml` - Bun runtime configuration
- Individual `tsconfig.json` files extend the base config

## Build Outputs

- `dist/` - Compiled TypeScript output
- `.turbo/` - Turborepo cache
- `.next/` - Next.js build output
- All build artifacts are gitignored

## Environment Files

- `apps/server/.env` - Server environment variables (database connection, etc.)
- Environment files are included in Turbo task inputs
