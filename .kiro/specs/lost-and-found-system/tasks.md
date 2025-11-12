# Implementation Plan

## Database & Schema

- [x] 1. Create lost items database schema

  - Create `packages/db/src/schema/items.ts` with `lostItem` and `itemStatusHistory` tables
  - Add proper indexes for status, category, dateFound, and createdAt columns
  - Export schema from `packages/db/src/index.ts`
  - _Requirements: 1.2, 2.2, 3.1, 4.1, 5.4_

- [x] 2. Generate and run database migrations

  - Run `bun run db:generate` to create migration files
  - Run `bun run db:migrate` to apply schema changes
  - Verify tables created in database using `bun run db:studio`
  - _Requirements: 1.2, 4.2, 4.3_

## Shared Types & Validation

- [x] 3. Create shared types and validation schemas

  - Create `packages/db/src/types/items.ts` with TypeScript types (ItemStatus, ItemCategory, LostItem, SearchFilters, etc.)
  - Create `packages/db/src/validation/items.ts` with Zod schemas (createItemSchema, updateItemSchema, searchFiltersSchema)
  - Export types and schemas from `packages/db/src/index.ts`
  - _Requirements: 1.4, 2.2, 2.3, 12.1, 13.5_

## Backend API Implementation

- [x] 4. Set up file upload infrastructure

  - Create `apps/server/public/uploads/items/` directory structure
  - Create `apps/server/src/lib/upload.ts` with file validation and storage utilities
  - Configure Hono to serve static files from public directory
  - _Requirements: 1.3, 1.6_

- [x] 5. Implement items service layer

  - Create `apps/server/src/services/items.service.ts` with business logic for CRUD operations
  - Implement search/filter logic with pagination
  - Implement status update logic with history tracking
  - _Requirements: 1.2, 2.2, 2.3, 4.1, 4.2, 5.2, 5.4_

- [x] 6. Create authentication middleware

  - Create `apps/server/src/middleware/auth.middleware.ts` to validate Better Auth sessions
  - Extract user information from session for protected routes
  - _Requirements: 6.2, 6.4_

- [x] 7. Implement public items API routes

  - Create `apps/server/src/routes/items.ts` with GET /api/items (search with filters)
  - Add GET /api/items/:id (item details)
  - Validate query parameters using Zod schemas
  - _Requirements: 2.1, 2.2, 2.4, 3.1, 3.2_

- [x] 8. Implement protected items API routes

  - Add POST /api/items (create with file upload)
  - Add PATCH /api/items/:id (update item and status)
  - Add DELETE /api/items/:id (soft delete)
  - Add GET /api/items/:id/history (status history)
  - Apply auth middleware to all protected routes
  - _Requirements: 1.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.4_

- [x] 9. Implement error handling middleware

  - Create `apps/server/src/middleware/error.middleware.ts` for global error handling
  - Handle Zod validation errors with proper formatting using zod-validation-error
  - Return consistent error response format
  - _Requirements: 12.3, 12.4, 12.5, 12.6_

## Frontend - Shared Infrastructure

- [x] 10. Set up API client and React Query

  - Install axios and use it as the main fetcher library
  - Create `apps/web/src/lib/api-client.ts` with base fetch wrapper
  - Create `apps/web/src/lib/query-client.ts` with TanStack Query configuration
  - Add QueryClientProvider to `apps/web/src/components/providers.tsx`
  - _Requirements: 13.3_

- [x] 11. Add required UI components

  - Install missing shadcn/ui components and replace already exisiting ones with the latest components (shadcn was updated recently): dialog, table, badge, select, textarea, toast, spinner/loader
  - Create `apps/web/src/components/ui/` components as needed
  - Replace tanstack form package and codes with react hook form
  - _Requirements: 11.1, 11.3, 13.4_

- [x] 12. Create offline indicator component

  - Create `apps/web/src/components/offline-indicator.tsx` to show online/offline status
  - Add to root layout
  - _Requirements: 8.4_

## Frontend - Items Feature (Feature-Sliced)

- [x] 13. Create items feature structure and types

  - Create `apps/web/src/features/items/types/item.ts` with frontend types.
  - Create `apps/web/src/features/items/lib/validation.ts` with form schemas
  - _Requirements: 1.1, 2.1, 13.1_

- [x] 14. Implement items API client functions

  - Create `apps/web/src/features/items/api/get-items.ts` (search with filters)
  - Create `apps/web/src/features/items/api/get-item.ts` (single item)
  - Create `apps/web/src/features/items/api/create-item.ts` (with FormData)
  - Create `apps/web/src/features/items/api/update-item.ts`
  - Create `apps/web/src/features/items/api/delete-item.ts`
  - Create `apps/web/src/features/items/api/get-item-history.ts`
  - _Requirements: 1.2, 2.2, 3.1, 4.1, 5.1, 5.2_

- [x] 15. Create items React Query hooks

  - Create `apps/web/src/features/items/hooks/use-items.ts` for search queries
  - Create `apps/web/src/features/items/hooks/use-item.ts` for single item query
  - Create `apps/web/src/features/items/hooks/use-item-mutations.ts` for create/update/delete
  - _Requirements: 2.2, 4.1, 5.2, 13.3_

- [x] 16. Build item display components

  - Create `apps/web/src/features/items/components/item-card.tsx` for grid view
  - Create `apps/web/src/features/items/components/item-grid.tsx` for responsive grid
  - Create `apps/web/src/features/items/components/status-badge.tsx` for status display
  - Create `apps/web/src/features/items/components/item-detail.tsx` for full item view
  - _Requirements: 2.5, 3.1, 3.3, 9.1, 9.2, 9.3, 9.5_

- [ ] 17. Build item form component

  - Create `apps/web/src/features/items/components/item-form.tsx` using react-hook-form
  - Use shadcn components in appropriate implementations (eg field components in implementing forms)
  - Implement image upload with preview
  - Add client-side validation with Zod
  - Handle form submission with loading states
  - _Requirements: 1.1, 1.2, 1.4, 1.6, 5.1, 11.2, 12.2, 12.7, 13.4_

- [x] 18. Build admin item table component

  - Create `apps/web/src/features/items/components/item-table.tsx` with sortable columns
  - Add quick action buttons (edit, delete, status change)
  - Implement table/card view toggle
  - _Requirements: 7.1, 7.2, 7.4_

## Frontend - Search Feature

- [x] 19. Create search feature components

  - Create `apps/web/src/features/search/components/search-bar.tsx` with debounced input
  - Create `apps/web/src/features/search/components/search-filters.tsx` (category, date, location, status)
  - Create `apps/web/src/features/search/components/search-results.tsx` with pagination
  - Create `apps/web/src/features/search/hooks/use-search.ts` for search state management
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

## Frontend - Public Pages

- [x] 20. Build home page

  - Update `apps/web/src/app/page.tsx` with hero section and CTA
  - Add mission statement and featured recent items
  - Add navigation to search page
  - Add animations using framer-motion
  - Fine tune it and make it creative
  - _Requirements: 10.1, 11.6_

- [x] 21. Create about page

  - Create `apps/web/src/app/about/page.tsx` with service description
  - Add contact information and office location
  - Add office hours and claim process instructions
  - _Requirements: 10.2, 10.3, 10.4_

- [x] 22. Create search page

  - Create `apps/web/src/app/search/page.tsx` with search bar and filters
  - Display search results using item grid
  - Implement pagination
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 23. Create item detail page

  - Create `apps/web/src/app/items/[id]/page.tsx` for public item viewing
  - Display full-size images and complete details
  - Show claim instructions
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

## Frontend - Admin Pages

- [x] 24. Update admin dashboard page

  - Use shadcn sidebar component for the admin dashboard layout
  - Update `apps/web/src/app/dashboard/page.tsx` with item table/grid
  - Add summary statistics (total, unclaimed, claimed, returned)
  - Add filtering and sorting capabilities
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 25. Create new item page

  - Create `apps/web/src/app/dashboard/items/new/page.tsx` with item form
  - Handle form submission and redirect to dashboard
  - Show success/error notifications
  - _Requirements: 1.1, 1.2, 1.4, 11.1_

- [x] 26. Create edit item page

  - Create `apps/web/src/app/dashboard/items/[id]/edit/page.tsx` with pre-populated form
  - Handle update submission
  - Add status change functionality
  - Add delete confirmation dialog
  - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.5_

## Frontend - Layout & Navigation

- [x] 27. Update root layout and navigation

  - Update `apps/web/src/app/layout.tsx` with proper navigation
  - Create `apps/web/src/components/header.tsx` with public/admin navigation
  - Create footer
  - Add mobile-responsive navigation menu
  - _Requirements: 9.1, 9.2, 9.3, 10.5_

- [x] 28. Create protected admin layout

  - Create `apps/web/src/app/dashboard/layout.tsx` with auth guard
  - Add admin-specific navigation sidebar
  - Redirect unauthenticated users to login
  - _Requirements: 6.4_

## Progressive Web App (PWA)

- [x] 29. Install and configure PWA dependencies

  - Install `@ducanh2912/next-pwa` package
  - Configure `next.config.js` with PWA settings and service worker caching strategies
  - _Requirements: 8.1, 8.2_

- [x] 30. Create PWA manifest and icons

  - Update `apps/web/src/app/manifest.ts` with proper PWA configuration
  - Generate PWA icons using `bun run generate-pwa-assets`
  - Add meta tags for mobile optimization
  - _Requirements: 8.1, 9.4_

- [x] 31. Implement offline functionality

  - Configure service worker caching for API responses
  - Test offline search with cached data
  - Verify data synchronization on reconnection
  - _Requirements: 8.2, 8.3, 8.5_

## Polish & Quality

- [x] 32. Implement loading states and animations

  - Add loading skeletons for data fetching
  - Add toast notifications for all actions
  - Add hover states and transitions to interactive elements
  - Add framer-motion animations to key interactions
  - _Requirements: 11.1, 11.2, 11.4, 11.6_

- [x] 33. Implement comprehensive error handling

  - Add error boundaries for React components
  - Display user-friendly error messages
  - Add retry functionality for failed requests
  - Ensure form errors don't clear valid fields
  - _Requirements: 11.5, 12.2, 12.3, 12.4, 12.6_

- [x] 34. Responsive design verification

  - Test all pages on mobile (< 768px)
  - Test all pages on tablet (768px - 1024px)
  - Test all pages on desktop (> 1024px)
  - Verify touch targets are at least 44x44px on mobile
  - Ensure no horizontal scrolling on any device
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 35. Write unit tests for core functionality
  - Write tests for validation schemas
  - Write tests for API client functions
  - Write tests for custom hooks
  - Write tests for utility functions
  - _Requirements: 13.2_

## Final Integration & Testing

- [x] 36. End-to-end integration testing

  - Test complete public user flow (search → view → claim info)
  - Test complete admin flow (login → create → update → delete)
  - Test status change workflow with history tracking
  - Test file upload and image display
  - Test offline functionality
  - _Requirements: All requirements_

- [x] 37. Code quality and optimization

  - Run `bun run check` to verify Biome formatting and linting
  - Run `bun run check-types` to verify TypeScript compilation
  - Optimize images and bundle size
  - Review and refactor for code reusability
  - _Requirements: 13.1, 13.2, 13.8_
