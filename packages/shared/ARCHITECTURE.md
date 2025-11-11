# Type Architecture

## Overview

This document explains how types are organized and shared across the FindHub monorepo using subpath exports to avoid bundling heavy backend dependencies in the frontend.

## Problem Solved

Previously, importing `@findhub/db` as a dependency would pull in Drizzle ORM, PostgreSQL drivers, and other heavy backend dependencies into the frontend bundle. Now, `@findhub/db` is a **devDependency** in `@findhub/shared`, meaning:

✅ Types are available at build time (TypeScript compilation)  
✅ No runtime dependencies are bundled  
✅ Frontend stays lightweight  
✅ Backend can use full database functionality

## Package Structure

### @findhub/db

**Subpath Exports:**

```json
{
  ".": "./src/index.ts", // db instance (server only)
  "./types": "./src/type.ts", // Inferred types (build-time only)
  "./schemas": "./src/schema/items.ts" // Drizzle schemas (server only)
}
```

**Usage:**

```typescript
// Server-side: Database instance
import { db } from "@findhub/db";

// Build-time: Types only (no runtime import)
import type { LostItem, ItemStatus } from "@findhub/db/types";

// Server-side: Drizzle schemas for queries
import { lostItem } from "@findhub/db/schemas";
```

### @findhub/shared

**Subpath Exports:**

```json
{
  "./types": "./src/types/item.type.ts", // Application types
  "./schemas": "./src/schemas/item.schema.ts" // Zod validation schemas
}
```

**Dependencies:**

- `zod` - Runtime dependency (lightweight)
- `@findhub/db` - **devDependency** (types only, not bundled)

**Usage:**

```typescript
// Application types (uses ItemStatus from @findhub/db/types at build time)
import type {
  ItemCategory,
  SearchFilters,
  PaginatedResponse,
} from "@findhub/shared/types";

// Validation schemas (runtime)
import { createItemSchema, searchFiltersSchema } from "@findhub/shared/schemas";
```

## Type Flow

```
Database Schema (Source of Truth)
    ↓
packages/db/src/schema/items.ts
    ↓
Type Inference (Drizzle)
    ↓
packages/db/src/type.ts
    ↓ (devDependency - build time only)
packages/shared/src/types/item.type.ts
    ↓
Available to frontend & backend (no runtime cost)
```

## Usage Examples

### Frontend (apps/web)

```typescript
// Types only - no runtime import, no bundle bloat
import type { LostItem, ItemStatus } from "@findhub/db/types";
import type { ItemCategory, SearchFilters } from "@findhub/shared/types";

// Runtime validation
import { createItemSchema } from "@findhub/shared/schemas";

// Use types
const filters: SearchFilters = {
  category: "electronics",
  status: "unclaimed",
};

// Validate data
const result = createItemSchema.safeParse(formData);
```

### Backend (apps/server)

```typescript
// Database instance and queries
import { db } from "@findhub/db";
import { lostItem } from "@findhub/db/schemas";

// Types
import type { LostItem } from "@findhub/db/types";
import type { SearchFilters } from "@findhub/shared/types";

// Validation
import { searchFiltersSchema } from "@findhub/shared/schemas";

// Use database
const items = await db.select().from(lostItem).where(...);
```

## Benefits

✅ **Lightweight Frontend** - No database dependencies in browser bundle  
✅ **Type Safety** - Full TypeScript support across frontend and backend  
✅ **Single Source of Truth** - Database schema defines entity structure  
✅ **Subpath Exports** - Import only what you need  
✅ **Build-time Types** - Types available during compilation, not at runtime

## Type Categories

### Database Entity Types (from @findhub/db/types)

- Inferred directly from Drizzle schema
- Represent database table rows
- **Build-time only** (devDependency)
- Examples: `LostItem`, `StatusHistoryEntry`, `ItemStatus`

### Application Types (from @findhub/shared/types)

- Application-specific enums and interfaces
- May reference database types at build time
- Examples: `ItemCategory`, `SearchFilters`, `PaginatedResponse`

### Validation Schemas (from @findhub/shared/schemas)

- Zod schemas for runtime validation
- **Runtime dependency** (lightweight)
- Examples: `createItemSchema`, `searchFiltersSchema`

### Database Schemas (from @findhub/db/schemas)

- Drizzle table definitions
- **Server-side only**
- Examples: `lostItem`, `itemStatusHistory`

## Naming Conventions

- **Schema files:** `*.schema.ts` (e.g., `item.schema.ts`)
- **Type files:** `*.type.ts` (e.g., `item.type.ts`)
- **Database types:** Singular, PascalCase (e.g., `LostItem`)
- **Application types:** Descriptive, PascalCase (e.g., `SearchFilters`)

## Import Paths Summary

| What               | Import From               | Used In            | Runtime Cost         |
| ------------------ | ------------------------- | ------------------ | -------------------- |
| Database instance  | `@findhub/db`             | Server only        | Heavy (Drizzle + pg) |
| Database types     | `@findhub/db/types`       | Frontend + Backend | None (type-only)     |
| Database schemas   | `@findhub/db/schemas`     | Server only        | Heavy (Drizzle)      |
| App types          | `@findhub/shared/types`   | Frontend + Backend | None (type-only)     |
| Validation schemas | `@findhub/shared/schemas` | Frontend + Backend | Light (Zod only)     |
