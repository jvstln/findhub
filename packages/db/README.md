# @findhub/db

Database schema, queries, and type inference for the FindHub application.

## Purpose

This package contains:

- Drizzle ORM schema definitions
- Database connection and configuration
- Type-safe database queries
- Inferred TypeScript types from schemas

## Subpath Exports

### Main Export (`@findhub/db`)

Database instance for server-side use only.

```typescript
import { db } from "@findhub/db";

// Use with Drizzle queries
const items = await db.select().from(lostItem);
```

### Types (`@findhub/db/types`)

Inferred TypeScript types from database schemas. **Build-time only** - safe to import in frontend.

```typescript
import type {
  LostItem,
  StatusHistoryEntry,
  ItemStatus,
} from "@findhub/db/types";

// Use in your components/functions
const item: LostItem = {
  id: 1,
  name: "Lost Wallet",
  // ... other fields
};
```

### Schemas (`@findhub/db/schemas`)

Drizzle table definitions for server-side queries.

```typescript
import { lostItem, itemStatusHistory } from "@findhub/db/schemas";
import { db } from "@findhub/db";

// Use in queries
const items = await db.select().from(lostItem).where(...);
```

## Type Inference

This package uses Drizzle's built-in type inference to automatically generate TypeScript types from the database schema.

### Example

```typescript
// Schema definition (packages/db/src/schema/items.ts)
export const lostItem = pgTable("lost_item", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: itemStatusEnum("status").notNull().default("unclaimed"),
  // ... other fields
});

// Type inference (packages/db/src/type.ts)
export type LostItem = typeof lostItem.$inferSelect;
export type ItemStatus = (typeof itemStatusEnum.enumValues)[number];
```

## Usage

### Frontend (Type-only imports)

```typescript
// ✅ Safe - types only, no runtime import
import type { LostItem, ItemStatus } from "@findhub/db/types";

// ❌ Don't do this - imports database runtime
import { db } from "@findhub/db";
```

### Backend (Full access)

```typescript
// Database instance
import { db } from "@findhub/db";

// Schemas for queries
import { lostItem, itemStatusHistory } from "@findhub/db/schemas";

// Types
import type { LostItem } from "@findhub/db/types";

// Query database
const items = await db
  .select()
  .from(lostItem)
  .where(eq(lostItem.status, "unclaimed"));
```

## Benefits of Type Inference

1. **Single Source of Truth** - Schema is the only place you define structure
2. **Automatic Updates** - Types update when schema changes
3. **Type Safety** - Guaranteed match between database and TypeScript types
4. **No Duplication** - No need to manually maintain separate type definitions
5. **Frontend Safe** - Types can be imported without bundling database code

## Database Commands

```bash
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
```

## Dependencies

- `drizzle-orm` - ORM and query builder
- `pg` - PostgreSQL driver
- `dotenv` - Environment variables
- `zod` - Schema validation

## Environment Variables

Create `apps/server/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/findhub
```

## See Also

- [@findhub/shared](../shared/README.md) - Shared types and validation
- [Drizzle ORM Docs](https://orm.drizzle.team/) - Official documentation
