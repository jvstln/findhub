# @findhub/shared

Shared types, validation schemas, and utility functions for the FindHub application.

## Purpose

This package contains framework-agnostic code that can be used across the entire application:

- TypeScript types and interfaces (enums, filters, response types)
- Zod validation schemas for runtime validation
- Pure utility functions (future)

**Important:** This package uses `@findhub/db` as a **devDependency** to access database types at build time without bundling heavy database dependencies in the frontend.

## Installation

This package is already part of the monorepo workspace. To use it in your app:

```json
{
  "dependencies": {
    "@findhub/shared": "workspace:*"
  }
}
```

## Subpath Exports

### Types (`@findhub/shared/types`)

Application-level types that may reference database types at build time.

```typescript
import type {
  ItemCategory, // Application enum
  SearchFilters, // Query filters
  PaginatedResponse, // API response wrapper
} from "@findhub/shared/types";
```

### Schemas (`@findhub/shared/schemas`)

Zod validation schemas for runtime validation.

```typescript
import {
  createItemSchema, // Validate item creation
  updateItemSchema, // Validate item updates
  searchFiltersSchema, // Validate search params
  itemCategorySchema, // Validate category enum
} from "@findhub/shared/schemas";

// Use in your code
const result = createItemSchema.safeParse(data);
if (result.success) {
  // data is valid
}
```

## Usage with Database Types

Database entity types are imported from `@findhub/db/types`:

```typescript
// Database types (build-time only, no runtime cost)
import type { LostItem, ItemStatus } from "@findhub/db/types";

// Application types
import type { ItemCategory, SearchFilters } from "@findhub/shared/types";

// Validation schemas (runtime)
import { createItemSchema } from "@findhub/shared/schemas";
```

## Frontend Usage

```typescript
// In your React component
import type { LostItem } from "@findhub/db/types";
import type { SearchFilters } from "@findhub/shared/types";
import { searchFiltersSchema } from "@findhub/shared/schemas";

function ItemList() {
  const [items, setItems] = useState<LostItem[]>([]);

  const handleSearch = (filters: SearchFilters) => {
    const validated = searchFiltersSchema.parse(filters);
    // Make API call with validated filters
  };
}
```

## Backend Usage

```typescript
// In your API route
import { db } from "@findhub/db";
import { lostItem } from "@findhub/db/schemas";
import type { LostItem } from "@findhub/db/types";
import { createItemSchema } from "@findhub/shared/schemas";

app.post("/items", async (c) => {
  const body = await c.req.json();
  const validated = createItemSchema.parse(body);

  const newItem = await db.insert(lostItem).values(validated).returning();
  return c.json(newItem);
});
```

## Bundle Size

This package is designed to be lightweight:

- **Runtime dependencies:** Only `zod` (~15KB gzipped)
- **No database dependencies** in production bundle
- **Type-only imports** have zero runtime cost

## Dependencies

- `zod` - Runtime validation (production dependency)
- `@findhub/db` - Database types (devDependency, build-time only)

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed explanation of type architecture
- [@findhub/db](../db/README.md) - Database package documentation
