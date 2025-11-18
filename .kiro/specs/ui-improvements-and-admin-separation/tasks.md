# Implementation Plan

- [x] 1. Implement conditional header search button visibility

  - Update `apps/web/src/components/header.tsx` to detect current route using `usePathname` hook
  - Add conditional rendering logic to hide search button when on `/search` route
  - Ensure mobile menu also respects the same visibility logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Enhance search filter responsive layouts

  - [x] 2.1 Update desktop filter input styling

    - Modify `apps/web/src/features/search/components/search-filters.tsx` to ensure all Select and Input components use `w-full` className
    - Verify SelectTrigger components have full width styling
    - Test on desktop viewport (1024px+) to confirm full-width rendering
    - _Requirements: 2.1, 2.3_

  - [x] 2.2 Implement mobile filter wrapping and spacing

    - Ensure filter inputs wrap properly on mobile viewports (< 768px)
    - Verify consistent spacing between wrapped elements using Tailwind spacing utilities
    - Test minimum viewport width (320px) for accessibility
    - Validate touch target sizes meet 44px minimum requirement
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 3. Implement contextual empty state messaging

  - [x] 3.1 Create empty state message logic

    - Add helper function in `apps/web/src/features/search/components/search-results.tsx` to determine appropriate message based on loading state, filter state, and data availability
    - Implement logic: "No items in database" when loading and no data, "Type to search for items" when not loading and no filters, "No matches found" when filters active but no results
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Integrate empty state logic with SearchResults component

    - Pass `hasActiveFilters` prop from search page to SearchResults component
    - Update empty state rendering to use new message logic
    - Ensure immediate updates when filter or loading state changes
    - _Requirements: 3.4, 3.5_

- [x] 4. Implement dynamic category management system

  - [x] 4.1 Create database migration for initial categories

    - Write Drizzle migration to seed `item_category` table with initial categories from static `COMMON_CATEGORIES` array
    - Include categories: Electronics, Clothing, Accessories, Books, Keys, Cards, Bags, Other
    - Test migration on development database
    - _Requirements: 4.2, 4.5_

  - [x] 4.2 Implement backend category API endpoints
    - Create `apps/server/src/routes/category.route.ts` with GET /api/categories (public) and POST/PATCH/DELETE /api/categories (protected) endpoints
    - Implement `apps/server/src/services/category.service.ts` with CRUD methods for categories
    - Add validation schemas in `packages/shared/src/schemas/category.schema.ts` using Zod
    - Register category routes in `apps/server/src/index.ts`

    - _Requirements: 4.1, 4.4_

  - [x] 4.3 Create frontend category API client and hooks
    - Implement `apps/web/src/features/categories/api/get-categories.ts` to fetch categories from backend

    - Create `apps/web/src/features/categories/hooks/use-categories.ts` using React Query with 5-minute stale time
    - Add TypeScript types in `packages/shared/src/types/category.type.ts`
    - _Requirements: 4.1, 4.3_

  - [x] 4.4 Update frontend components to use dynamic categories

    - Update `apps/web/src/app/search/page.tsx` to remove `COMMON_CATEGORIES` constant and use `useCategories()` hook
    - Update `apps/web/src/features/items/components/item-form.tsx` to fetch categories dynamically
    - Update `apps/web/src/features/items/components/item-card.tsx` and `item-detail.tsx` to display category names instead of IDs
    - Ensure proper error handling and loading states for category fetching
    - _Requirements: 4.3, 4.5_

  - [x] 4.5 Implement referential integrity validation

    - Add validation in item service to ensure categoryId references exist in item_category table
    - Update item creation and update endpoints to validate category references
    - Add appropriate error messages for invalid category references
    - _Requirements: 4.6_

- [x] 5. Setup admin application structure

  - [x] 5.1 Create admin app directory and configuration

    - Create `apps/admin` directory with Next.js structure
    - Copy and adapt `package.json`, `next.config.ts`, `tailwind.config.ts`, and `tsconfig.json` from web app
    - Configure development port to 3002 in package.json scripts
    - Add admin app to Turborepo configuration in root `turbo.json`
    - Update root `package.json` with `dev:admin` script
    - _Requirements: 5.1, 5.5, 5.6_

  - [x] 5.2 Setup admin app layout and routing structure

    - Create `apps/admin/src/app/layout.tsx` with admin-specific layout
    - Create `apps/admin/src/app/page.tsx` as dashboard redirect
    - Setup directory structure for dashboard, items, categories, login, and signup routes
    - Configure shared packages as dependencies (@findhub/auth, @findhub/db, @findhub/shared)
    - _Requirements: 5.1, 5.4_

  - [x] 5.3 Implement admin authentication and middleware

    - Create `apps/admin/src/middleware.ts` for authentication protection
    - Configure Better-Auth client for admin app
    - Implement login page at `apps/admin/src/app/login/page.tsx`
    - Implement signup page at `apps/admin/src/app/signup/page.tsx`
    - Test authentication flow and session management
    - _Requirements: 5.3, 5.7_

- [x] 6. Migrate admin features to admin app

  - [x] 6.1 Move dashboard functionality

    - Copy dashboard page from `apps/web/src/app/admin/dashboard/page.tsx` to `apps/admin/src/app/dashboard/page.tsx`
    - Copy dashboard components and update imports to use shared packages
    - Test dashboard statistics and data fetching
    - _Requirements: 5.2, 5.7_

  - [x] 6.2 Move item management features

    - Copy items routes from `apps/web/src/app/admin/items/*` to `apps/admin/src/app/items/*`
    - Copy item management components (item list, create form, edit form, detail view)
    - Update all imports to reference shared packages
    - Test item CRUD operations from admin app

    - _Requirements: 5.2, 5.3, 5.7_

  - [x] 6.3 Implement category management UI in admin app

    - Create `apps/admin/src/app/categories/page.tsx` for category list and management
    - Create category create/edit forms

    - Implement category CRUD operations using category API
    - Add proper authorization checks for category management
    - _Requirements: 5.2, 5.7_

  - [x] 6.4 Remove admin code from web app

    - Delete `apps/web/src/app/admin` directory and all admin routes
    - Remove admin-specific components from web app
    - Update web app middleware to remove admin route protection
    - Clean up unused imports and dependencies
    - _Requirements: 5.2, 5.8_

- [x] 7. Update E2E tests for admin separation

  - [x] 7.1 Update Playwright configuration for admin app

    - Add admin app base URL (http://localhost:3002) to `playwright.config.ts`
    - Configure separate test projects for web and admin apps
    - Update test setup to start both web and admin dev servers
    - _Requirements: 5.7_

  - [x] 7.2 Migrate admin E2E tests

    - Update `e2e/admin-flow.spec.ts` to target admin app URL
    - Update `e2e/status-workflow.spec.ts` to use admin app
    - Verify all admin authentication flows work with new app
    - Test item management workflows end-to-end
    - _Requirements: 5.7_

  - [x] 7.3 Update public E2E tests

    - Verify `e2e/public-flow.spec.ts` still works with web app
    - Update `e2e/file-upload.spec.ts` if needed
    - Ensure search and filter tests pass with dynamic categories
    - Test new empty state messages in search tests
    - _Requirements: 5.7_

- [-] 8. Documentation and deployment preparation

  - [x] 8.1 Update project documentation

    - Update README.md with admin app setup instructions
    - Document new category API endpoints
    - Add admin app development and deployment guide
    - Update architecture diagrams to show admin separation
    - _Requirements: 5.1, 5.8_

  - [x] 8.2 Create deployment configuration

    - Document environment variables for admin app
    - Create deployment scripts for independent admin app deployment
    - Update CI/CD configuration to build and deploy admin app separately
    - Document production URL structure (admin.findhub.example.com)
    - _Requirements: 5.8_

  - [x] 8.3 Perform final integration testing

    - Test all features across web, admin, and server apps
    - Verify authentication works across both frontend apps
    - Test category management end-to-end
    - Validate responsive layouts on multiple devices
    - Verify empty state messages in various scenarios
    - _Requirements: 1.1-1.4, 2.1-2.5, 3.1-3.5, 4.1-4.6, 5.1-5.8_
