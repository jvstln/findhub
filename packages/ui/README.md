## @findhub/ui

Shared React components, hooks, and frontend utilities consumed by both the
public (`apps/web`) and admin (`apps/admin`) applications. The package exposes a
single source of truth for shadcn primitives, layout shells, TanStack Query
helpers, Axios clients, and responsive hooks.

### Usage

```tsx
// UI primitives (button, input, dropdowns, etc.)
import { Button, Input } from "@findhub/ui/components";

// Layout shells
import { LayoutWrapper } from "@findhub/ui/components/layout/public";
import { AdminLayout, PageHeader } from "@findhub/ui/components/layout/admin";

// Hooks & utilities
import { useIsMobile, useOnlineStatus } from "@findhub/ui/hooks";
import { getQueryClient } from "@findhub/ui/lib/query-client";
import { getErrorMessage } from "@findhub/ui/lib/api-client";
```

### Development

```bash
bun install
# Build the package (tsdown -> dist + d.ts)
bun run build --filter=@findhub/ui
```

### Structure

- `src/components/ui` – shadcn-based primitives, skeletons, sheets, sidebar, etc.
- `src/components/layout` – public (marketing) and admin layout wrappers
- `src/hooks` – shared React hooks (responsive + online status)
- `src/lib` – API client, query client factory, `cn` helper, auth client

### Notes

- Components are written as client components (`"use client"`) so they can be
  consumed directly from either Next.js application.
- Import from `@findhub/ui/components/layout/public` or
  `@findhub/ui/components/layout/admin` to avoid cross-app route typing issues.
- Treat `@findhub/ui` as the only source of styling primitives—local app files
  simply re-export for backwards compatibility.

