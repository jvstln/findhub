# Design Document

## Overview

This design document outlines the technical approach for implementing UI improvements and architectural changes to the FindHub lost and found system. The improvements focus on five key areas:

1. Conditional header search button visibility based on current route
2. Responsive filter input layouts for desktop and mobile
3. Contextual empty state messaging based on data and filter state
4. Dynamic category management with database-backed CRUD operations
5. Separation of admin functionality into a dedicated application

The design maintains backward compatibility while improving user experience and code maintainability.

## Architecture

### High-Level Changes

```
Current Structure:
findhub/
├── apps/
│   ├── web/          # Public + Admin mixed
│   └── server/       # API backend
└── packages/         # Shared code

New Structure:
findhub/
├── apps/
│   ├── web/          # Public interface only
│   ├── admin/        # Admin interface (NEW)
│   └── server/       # API backend (enhanced)
└── packages/         # Shared code
```

### Component Architecture

**1. Header Component Enhancement**
- Add route detection logic using Next.js `usePathname` hook
- Conditionally render search button based on current path
- Maintain existing responsive behavior for mobile/desktop

**2. Filter Component Redesign**
- Implement and improve CSS Grid/Flexbox for responsive layouts
- Full-width inputs on desktop (within card container)
- Wrapping inputs on mobile with proper spacing
- Maintain accessibility with proper touch targets (44px minimum)

**3. Search Results Empty State**
- Add state detection logic for loading, filters, and data
- Implement conditional message rendering based on state combination
- Preserve existing skeleton loading states

**4. Category Management System**
- Backend: CRUD API endpoints for categories
- Frontend: Category fetching from API instead of static arrays
- Database: Already exists (`item_category` table)
- Migration: Seed initial categories from existing static data

**5. Admin Application Separation**
- New Next.js application in `apps/admin`
- Shared authentication, database types, and validation schemas
- Independent deployment capability
- Port 3002 for development

## Components and Interfaces

### 1. Header Component Updates

**File:** `apps/web/src/components/header.tsx`

**Changes:**
```typescript
// Add route detection
const pathname = usePathname();
const isSearchPage = pathname === '/search';

// Conditional rendering
{!isSearchPage && (
  <Button variant="ghost" size="sm" asChild>
    <Link href="/search">
      <Search className="size-4" />
      Search
    </Link>
  </Button>
)}
```

**Rationale:** Simple conditional rendering based on pathname provides clean UX without navigation redundancy.

### 2. Search Filters Responsive Layout

**File:** `apps/web/src/features/search/components/search-filters.tsx`

**Current Issues:**
- Inputs don't take full width on desktop
- No wrapping behavior on mobile
- Inconsistent spacing

**Design Solution:**
```typescript
// Update CardContent styling
<CardContent className="space-y-4">
  {/* Each filter group */}
  <div className="space-y-2">
    <Label>Category</Label>
    <Select className="w-full">
      {/* Select content */}
    </Select>
  </div>
</CardContent>
```

**CSS Approach:**
- Use `w-full` utility on all input elements
- Maintain `space-y-4` for vertical spacing
- SelectTrigger and Input components already support full width
- Mobile wrapping handled by parent grid layout in search page

**Responsive Behavior:**
- Desktop: Sidebar layout (already implemented via `lg:col-span-1`)
- Mobile: Full width, stacked vertically
- Touch targets: Minimum 44px height (already met by shadcn/ui components)

### 3. Empty State Message Logic

**File:** `apps/web/src/features/search/components/search-results.tsx`

**State Detection Logic:**
```typescript
interface EmptyStateProps {
  isLoading: boolean;
  hasActiveFilters: boolean;
  total: number;
}

function getEmptyStateMessage({ isLoading, hasActiveFilters, total }: EmptyStateProps): string {
  if (isLoading) {
    return "Loading results...";
  }
  
  if (total === 0 && !hasActiveFilters) {
    return "No items in database";
  }
  
  if (total === 0 && hasActiveFilters) {
    return "No items match your filters. Try adjusting your search criteria.";
  }
  
  return "Type to search for items";
}
```

**Integration:**
- Pass `hasActiveFilters` from `use-search` hook to SearchResults
- Update empty state rendering to use new logic
- Maintain existing styling and layout

### 4. Category Management System

#### Database Schema

**Already Exists:** `packages/db/src/schema/items.ts`
```typescript
export const itemCategory = pgTable("item_category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
});
```

**Migration Required:** Seed initial categories

#### Backend API Design

**New File:** `apps/server/src/routes/category.route.ts`

**Endpoints:**
```typescript
GET    /api/categories           # List all categories
GET    /api/categories/:id       # Get single category
POST   /api/categories           # Create category (protected)
PATCH  /api/categories/:id       # Update category (protected)
DELETE /api/categories/:id       # Delete category (protected)
```

**Service Layer:**
**New File:** `apps/server/src/services/category.service.ts`

```typescript
export class CategoryService {
  async getAllCategories(): Promise<ItemCategory[]>
  async getCategoryById(id: number): Promise<ItemCategory | null>
  async createCategory(input: CreateCategoryInput): Promise<ItemCategory>
  async updateCategory(id: number, input: UpdateCategoryInput): Promise<ItemCategory | null>
  async deleteCategory(id: number): Promise<boolean>
}
```

**Validation Schemas:**
**New File:** `packages/shared/src/schemas/category.schema.ts`

```typescript
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
```

#### Frontend Integration

**API Client:**
**New File:** `apps/web/src/features/categories/api/get-categories.ts`

```typescript
export async function getCategories(): Promise<ItemCategory[]> {
  const response = await fetch(`${API_URL}/categories`);
  // ... error handling
  return data;
}
```

**React Query Hook:**
**New File:** `apps/web/src/features/categories/hooks/use-categories.ts`

```typescript
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Component Updates:**
- `apps/web/src/app/search/page.tsx`: Remove `COMMON_CATEGORIES` constant, use `useCategories()` hook
- `apps/web/src/features/search/components/search-filters.tsx`: Accept categories from props (already implemented)
- `apps/web/src/features/items/components/item-form.tsx`: Fetch categories dynamically

**Migration Strategy:**
1. Create database migration to seed initial categories
2. Implement backend API endpoints
3. Update frontend to fetch from API
4. Remove static category constants
5. Test with existing data

### 5. Admin Application Separation

#### New Application Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Admin layout with auth
│   │   ├── page.tsx             # Dashboard (redirect)
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard page
│   │   ├── items/
│   │   │   ├── page.tsx         # Items list
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Create item
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Item detail
│   │   │       └── edit/
│   │   │           └── page.tsx # Edit item
│   │   ├── categories/
│   │   │   ├── page.tsx         # Categories management
│   │   │   └── new/
│   │   │       └── page.tsx     # Create category
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   └── signup/
│   │       └── page.tsx         # Signup page
│   ├── components/              # Admin-specific components
│   ├── features/                # Admin features
│   ├── lib/                     # Admin utilities
│   └── middleware.ts            # Auth middleware
├── public/                      # Admin static assets
├── next.config.ts               # Next.js config (port 3002)
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

#### Shared Dependencies

**From `@findhub/auth`:**
- Authentication client
- Session management
- Auth middleware

**From `@findhub/db`:**
- Type imports only (`@findhub/db/types`)
- No direct database access

**From `@findhub/shared`:**
- Validation schemas
- Type definitions
- Utility functions

#### Configuration Files

**`apps/admin/package.json`:**
```json
{
  "name": "@findhub/admin",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start --port 3002"
  },
  "dependencies": {
    "next": "16.0.0",
    "react": "19.2.0",
    "@findhub/auth": "workspace:*",
    "@findhub/shared": "workspace:*",
    "@tanstack/react-query": "^5.62.11"
  },
  "devDependencies": {
    "@findhub/db": "workspace:*",
    "typescript": "^5.8.2"
  }
}
```

**`apps/admin/next.config.ts`:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@findhub/auth", "@findhub/shared"],
  // ... other config
};

export default nextConfig;
```

**`turbo.json` Updates:**
```json
{
  "tasks": {
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    }
  }
}
```

**Root `package.json` Scripts:**
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=@findhub/web",
    "dev:admin": "turbo run dev --filter=@findhub/admin",
    "dev:server": "turbo run dev --filter=@findhub/server"
  }
}
```

#### Migration Strategy

**Phase 1: Setup Admin App**
1. Create `apps/admin` directory structure
2. Copy configuration files from `apps/web`
3. Update port to 3002
4. Add to Turborepo configuration

**Phase 2: Move Admin Code**
1. Copy admin routes from `apps/web/src/app/admin/*`
2. Copy admin-specific components and features
3. Update imports to use shared packages
4. Remove admin code from web app

**Phase 3: Update Authentication**
1. Configure Better-Auth for admin app
2. Update middleware for admin routes
3. Test authentication flow

**Phase 4: Testing & Cleanup**
1. Test all admin functionality
2. Update E2E tests to target admin app
3. Remove unused admin code from web app
4. Update documentation

#### Deployment Considerations

**Development:**
- Web: `http://localhost:3001`
- Admin: `http://localhost:3002`
- Server: `http://localhost:3000`

**Production:**
- Web: `https://findhub.example.com`
- Admin: `https://admin.findhub.example.com`
- Server: `https://api.findhub.example.com`

**Environment Variables:**
Both apps share:
- `NEXT_PUBLIC_API_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

## Data Models

### ItemCategory (New API Model)

```typescript
// packages/shared/src/types/category.type.ts
export interface ItemCategory {
  id: number;
  name: string;
  description: string | null;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}
```

### SearchFilters (Enhanced)

```typescript
// No changes to type definition
// Usage updated to fetch categories dynamically
export interface SearchFilters {
  keyword?: string;
  category?: string;  // Still accepts category ID or name
  location?: string;
  status?: ItemStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}
```

## Error Handling

### Category API Errors

**Backend:**
```typescript
// 404: Category not found
// 400: Validation error
// 409: Duplicate category name
// 500: Database error
```

**Frontend:**
```typescript
// Fallback to empty array on fetch failure
// Show error toast for CRUD operations
// Retry logic with exponential backoff
```

### Admin App Errors

**Authentication:**
- Redirect to login on 401
- Show error message on auth failure
- Session timeout handling

**API Errors:**
- Network errors: Show retry option
- Validation errors: Display field-level errors
- Server errors: Show generic error message

## Testing Strategy

### Unit Tests

**Category Service:**
- Test CRUD operations
- Test validation
- Test error handling

**Frontend Hooks:**
- Test `useCategories` hook
- Test cache behavior
- Test error states

### Integration Tests

**Category API:**
- Test full CRUD flow
- Test referential integrity with items
- Test concurrent operations

**Search Filters:**
- Test category filtering with dynamic data
- Test empty state messages
- Test responsive layouts

### E2E Tests

**Admin Separation:**
- Update existing admin E2E tests to target new admin app
- Test authentication flow
- Test item management workflow
- Test category management

**Public Interface:**
- Test search functionality
- Test filter interactions
- Test empty states
- Test responsive behavior

### Visual Regression Tests

**Filter Layouts:**
- Desktop full-width inputs
- Mobile wrapping behavior
- Touch target sizes

**Empty States:**
- Different message variations
- Loading states
- Error states

## Performance Considerations

### Category Caching

**Strategy:**
- Cache categories in React Query with 5-minute stale time
- Invalidate cache on CRUD operations
- Prefetch on app initialization

**Benefits:**
- Reduced API calls
- Faster filter rendering
- Better offline support

### Admin App Bundle Size

**Optimization:**
- Code splitting by route
- Lazy load admin components
- Share common chunks with web app
- Tree-shake unused dependencies

**Target Metrics:**
- Initial bundle: < 200KB gzipped
- Route chunks: < 50KB each
- Shared chunks: Maximize reuse

### Search Performance

**No Impact Expected:**
- Category filtering already uses indexed column
- Dynamic category fetch cached
- Empty state logic is synchronous

## Security Considerations

### Category Management

**Authorization:**
- Only authenticated admin users can create/update/delete categories
- Public users can only read categories
- Validate user permissions on backend

**Validation:**
- Sanitize category names
- Prevent SQL injection (using Drizzle ORM)
- Limit category name length (100 chars)

### Admin App Security

**Authentication:**
- Require authentication for all admin routes
- Use Better-Auth session management
- Implement CSRF protection

**API Security:**
- Same CORS configuration as web app
- Validate all inputs
- Rate limiting on sensitive endpoints

**Deployment:**
- Separate subdomain for admin app
- Additional firewall rules for admin routes
- Audit logging for admin actions

## Migration Plan

### Phase 1: UI Improvements (Week 1)

**Tasks:**
1. Update header component with conditional search button
2. Enhance filter component responsive layouts
3. Implement contextual empty state messages
4. Test on multiple devices and browsers

**Deliverables:**
- Updated components
- Visual regression tests
- Documentation updates

### Phase 2: Category Management (Week 2)

**Tasks:**
1. Create database migration for initial categories
2. Implement backend API endpoints
3. Create frontend API client and hooks
4. Update all components to use dynamic categories
5. Remove static category constants

**Deliverables:**
- Category API endpoints
- Frontend integration
- Migration scripts
- API documentation

### Phase 3: Admin Separation (Week 3-4)

**Tasks:**
1. Setup admin app structure
2. Move admin routes and components
3. Configure authentication
4. Update E2E tests
5. Test deployment process

**Deliverables:**
- Functional admin app
- Updated E2E tests
- Deployment documentation
- Migration guide

### Phase 4: Testing & Refinement (Week 5)

**Tasks:**
1. Comprehensive testing of all features
2. Performance optimization
3. Security audit
4. Documentation updates
5. User acceptance testing

**Deliverables:**
- Test reports
- Performance metrics
- Security audit results
- Final documentation

## Rollback Strategy

### UI Improvements
- Simple component revert via Git
- No database changes
- No API changes

### Category Management
- Keep static constants as fallback
- Feature flag for dynamic categories
- Database rollback script available

### Admin Separation
- Keep admin routes in web app until fully tested
- Gradual migration with feature flags
- Parallel deployment during transition

## Success Metrics

### UI Improvements
- Mobile usability score > 90
- Touch target compliance: 100%
- User feedback: Positive on empty state clarity

### Category Management
- API response time: < 100ms
- Cache hit rate: > 80%
- Zero data migration issues

### Admin Separation
- Independent deployment success: 100%
- Admin app bundle size: < 200KB
- Zero authentication issues
- E2E test pass rate: 100%
