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

- [x] 4. Configure Supabase project and storage bucket

  - Create or use existing Supabase project
  - Create storage bucket named "lost-items" in Supabase dashboard
  - Configure bucket as public for read access
  - Set file size limit to 5MB in bucket settings
  - Configure allowed MIME types (image/jpeg, image/png, image/webp)
  - Set up RLS policies if needed for additional security
  - Get Supabase URL and service role key for backend
  - Get Supabase URL and anon key for frontend (if using direct upload)
  - _Requirements: 13.1, 13.7_

- [x] 5. Set up Supabase Storage infrastructure

  - Install `@supabase/supabase-js` package in server app
  - Create `apps/server/src/lib/supabase.ts` with Supabase client initialization using service role key
  - Create `apps/server/src/services/upload.service.ts` with uploadItemImage and deleteItemImage functions
  - Implement UUID-based filename generation for uploads
  - Implement file type and size validation
  - Add Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY) to `apps/server/.env`
  - Test upload and delete operations
  - _Requirements: 1.4, 1.5, 13.2, 13.3, 13.9_

- [x] 6. Implement items service layer

  - Create `apps/server/src/services/items.service.ts` with business logic for CRUD operations
  - Implement search/filter logic with pagination
  - Implement status update logic with history tracking
  - Integrate Supabase Storage upload/delete in create/update/delete operations
  - Handle Supabase Storage errors and cleanup on failures
  - _Requirements: 1.2, 2.2, 2.3, 4.1, 4.2, 5.2, 5.3, 5.4, 13.5, 13.6_

- [x] 7. Create authentication middleware

  - Create `apps/server/src/middleware/auth.middleware.ts` to validate Better Auth sessions
  - Extract user information from session for protected routes
  - _Requirements: 6.2, 6.4_

- [x] 8. Implement public items API routes

  - Create `apps/server/src/routes/items.ts` with GET /api/items (search with filters)
  - Add GET /api/items/:id (item details)
  - Validate query parameters using Zod schemas
  - _Requirements: 2.1, 2.2, 2.4, 3.1, 3.2_

- [x] 9. Implement protected items API routes

  - Add POST /api/items (create with file upload to Supabase Storage)
  - Add PATCH /api/items/:id (update item and status, handle image replacement in Supabase)
  - Add DELETE /api/items/:id (soft delete with Supabase Storage cleanup)
  - Add GET /api/items/:id/history (status history)
  - Apply auth middleware to all protected routes
  - Handle Supabase Storage errors gracefully
  - _Requirements: 1.2, 1.4, 1.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 6.4, 13.6_

- [x] 10. Implement error handling middleware

  - Create `apps/server/src/middleware/error.middleware.ts` for global error handling
  - Handle Zod validation errors with proper formatting using zod-validation-error
  - Return consistent error response format
  - _Requirements: 12.3, 12.4, 12.5, 12.6_

## Frontend - Shared Infrastructure

- [x] 11. Set up API client and React Query

  - Install axios and use it as the main fetcher library
  - Create `apps/web/src/lib/api-client.ts` with base fetch wrapper
  - Create `apps/web/src/lib/query-client.ts` with TanStack Query configuration
  - Add QueryClientProvider to `apps/web/src/components/providers.tsx`
  - _Requirements: 13.3_

- [x] 12. Add required UI components

  - Install missing shadcn/ui components and replace already exisiting ones with the latest components (shadcn was updated recently): dialog, table, badge, select, textarea, toast, spinner/loader
  - Create `apps/web/src/components/ui/` components as needed
  - Replace tanstack form package and codes with react hook form
  - _Requirements: 11.1, 11.3, 13.4_

- [x] 13. Create offline indicator component

  - Create `apps/web/src/components/offline-indicator.tsx` to show online/offline status
  - Add to root layout
  - _Requirements: 8.4_

## Frontend - Items Feature (Feature-Sliced)

- [x] 14. Create items feature structure and types

  - Create `apps/web/src/features/items/types/item.ts` with frontend types.
  - Create `apps/web/src/features/items/lib/validation.ts` with form schemas
  - _Requirements: 1.1, 2.1, 13.1_

- [x] 15. Implement items API client functions

  - Create `apps/web/src/features/items/api/get-items.ts` (search with filters)
  - Create `apps/web/src/features/items/api/get-item.ts` (single item)
  - Create `apps/web/src/features/items/api/create-item.ts` (with FormData for Supabase upload)
  - Create `apps/web/src/features/items/api/update-item.ts`
  - Create `apps/web/src/features/items/api/delete-item.ts`
  - Create `apps/web/src/features/items/api/get-item-history.ts`
  - _Requirements: 1.2, 2.2, 3.1, 4.1, 5.1, 5.2_

- [x] 16. Create items React Query hooks

  - Create `apps/web/src/features/items/hooks/use-items.ts` for search queries
  - Create `apps/web/src/features/items/hooks/use-item.ts` for single item query
  - Create `apps/web/src/features/items/hooks/use-item-mutations.ts` for create/update/delete
  - _Requirements: 2.2, 4.1, 5.2, 13.3_

- [x] 17. Build item display components

  - Create `apps/web/src/features/items/components/item-card.tsx` for grid view
  - Create `apps/web/src/features/items/components/item-grid.tsx` for responsive grid
  - Create `apps/web/src/features/items/components/status-badge.tsx` for status display
  - Create `apps/web/src/features/items/components/item-detail.tsx` for full item view (display Supabase Storage URLs)
  - _Requirements: 2.5, 3.1, 3.3, 9.1, 9.2, 9.3, 9.5, 13.4_

- [x] 18. Build item form component

  - Create `apps/web/src/features/items/components/item-form.tsx` using react-hook-form
  - Use shadcn components in appropriate implementations (eg field components in implementing forms)
  - Implement image upload with preview (files will be uploaded to Supabase Storage via backend)
  - Add client-side validation with Zod (file type and size validation)
  - Handle form submission with loading states
  - Display Supabase Storage upload errors to user
  - _Requirements: 1.1, 1.2, 1.4, 1.6, 1.8, 5.1, 11.2, 12.2, 12.7, 13.4, 13.6_

- [x] 19. Build admin item table component

  - Create `apps/web/src/features/items/components/item-table.tsx` with sortable columns
  - Add quick action buttons (edit, delete, status change)
  - Implement table/card view toggle
  - _Requirements: 7.1, 7.2, 7.4_

## Frontend - Search Feature

- [x] 20. Create search feature components

  - Create `apps/web/src/features/search/components/search-bar.tsx` with debounced input
  - Create `apps/web/src/features/search/components/search-filters.tsx` (category, date, location, status)
  - Create `apps/web/src/features/search/components/search-results.tsx` with pagination
  - Create `apps/web/src/features/search/hooks/use-search.ts` for search state management
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

## Frontend - Public Pages

- [x] 21. Build home page

  - Update `apps/web/src/app/page.tsx` with hero section and CTA
  - Add mission statement and featured recent items
  - Add navigation to search page
  - Add animations using framer-motion
  - Fine tune it and make it creative
  - Ensure NO auth UI elements are visible
  - _Requirements: 10.1, 10.6, 11.6_

- [x] 22. Create about page

  - Create `apps/web/src/app/about/page.tsx` with service description
  - Add contact information and office location
  - Add office hours and claim process instructions
  - Ensure NO auth UI elements are visible
  - _Requirements: 10.2, 10.3, 10.4, 10.6_

- [x] 23. Create search page

  - Create `apps/web/src/app/search/page.tsx` with search bar and filters
  - Display search results using item grid
  - Implement pagination
  - Ensure NO auth UI elements are visible
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.6_

- [x] 24. Create item detail page

  - Create `apps/web/src/app/items/[id]/page.tsx` for public item viewing
  - Display full-size images from Supabase Storage and complete details
  - Show claim instructions
  - Ensure NO auth UI elements are visible
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.6, 13.4_

## Frontend - Admin Pages

- [x] 25. Update admin dashboard page

  - Use shadcn sidebar component for the admin dashboard layout
  - Move to `apps/web/src/app/admin/dashboard/page.tsx` with item table/grid
  - Add summary statistics (total, unclaimed, claimed, returned)
  - Add filtering and sorting capabilities
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 14.2_

- [x] 26. Create new item page

  - Create `apps/web/src/app/admin/items/new/page.tsx` with item form
  - Handle form submission with Supabase Storage upload and redirect to dashboard
  - Show success/error notifications including Supabase errors
  - _Requirements: 1.1, 1.2, 1.4, 1.8, 11.1, 13.6, 14.2_

- [x] 27. Create edit item page

  - Create `apps/web/src/app/admin/items/[id]/edit/page.tsx` with pre-populated form
  - Handle update submission with Supabase Storage image replacement
  - Add status change functionality
  - Add delete confirmation dialog with Supabase Storage cleanup
  - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 14.2_

## Frontend - Layout & Navigation

- [x] 28. Update root layout and navigation for public pages

  - Update `apps/web/src/app/layout.tsx` with public-only navigation (NO auth UI)
  - Create `apps/web/src/components/header.tsx` with public navigation only (Home, Search, About)
  - Create footer with contact info
  - Add mobile-responsive navigation menu
  - Ensure zero admin/auth UI elements visible on public pages
  - _Requirements: 9.1, 9.2, 9.3, 10.5, 10.6, 10.7, 14.5_

- [x] 29. Create protected admin layout and restructure routes

  - Restructure routes: move admin pages to `/admin` route group
  - Create `apps/web/src/app/admin/layout.tsx` with auth guard and admin sidebar
  - Move login page to `apps/web/src/app/admin/login/page.tsx`
  - Move dashboard to `apps/web/src/app/admin/dashboard/page.tsx`
  - Move item management pages to `apps/web/src/app/admin/items/*`
  - Update `apps/web/src/middleware.ts` to only protect `/admin/*` routes (not root routes)
  - Redirect unauthenticated users to `/admin/login`
  - _Requirements: 6.4, 14.1, 14.2, 14.3, 14.4, 14.6_

## Progressive Web App (PWA)

- [x] 30. Install and configure PWA dependencies

  - Install `@ducanh2912/next-pwa` package
  - Configure `next.config.js` with PWA settings and service worker caching strategies
  - _Requirements: 8.1, 8.2_

- [x] 31. Create PWA manifest and icons

  - Update `apps/web/src/app/manifest.ts` with proper PWA configuration
  - Generate PWA icons using `bun run generate-pwa-assets`
  - Add meta tags for mobile optimization
  - _Requirements: 8.1, 9.4_

- [x] 32. Implement offline functionality

  - Configure service worker caching for API responses
  - Test offline search with cached data
  - Verify data synchronization on reconnection
  - _Requirements: 8.2, 8.3, 8.5_

## Polish & Quality

- [x] 33. Implement loading states and animations

  - Add loading skeletons for data fetching
  - Add toast notifications for all actions
  - Add hover states and transitions to interactive elements
  - Add framer-motion animations to key interactions
  - _Requirements: 11.1, 11.2, 11.4, 11.6_

- [x] 34. Implement comprehensive error handling

  - Add error boundaries for React components
  - Display user-friendly error messages including Supabase Storage errors
  - Add retry functionality for failed requests
  - Ensure form errors don't clear valid fields
  - _Requirements: 11.5, 12.2, 12.3, 12.4, 12.6, 13.6_

- [x] 35. Responsive design verification

  - Test all pages on mobile (< 768px)
  - Test all pages on tablet (768px - 1024px)
  - Test all pages on desktop (> 1024px)
  - Verify touch targets are at least 44x44px on mobile
  - Ensure no horizontal scrolling on any device
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 36. Write unit tests for core functionality

  - Write tests for validation schemas
  - Write tests for API client functions
  - Write tests for custom hooks
  - Write tests for utility functions
  - Write tests for Supabase Storage upload/delete functions
  - _Requirements: 13.2_

## Final Integration & Testing

- [x] 37. End-to-end integration testing

  - Test complete public user flow (search → view → claim info) without seeing any auth UI
  - Test complete admin flow (login at /admin/login → create → update → delete)
  - Test status change workflow with history tracking
  - Test Supabase Storage file upload and image display
  - Test Supabase Storage cleanup on delete
  - Test offline functionality
  - Verify public routes don't trigger auth middleware
  - Verify admin routes are properly protected
  - _Requirements: All requirements_

- [x] 38. Code quality and optimization

  - Run `bun run check` to verify Biome formatting and linting
  - Run `bun run check-types` to verify TypeScript compilation
  - Optimize images and bundle size
  - Review and refactor for code reusability
  - Verify Supabase environment variables are properly configured
  - Test Supabase Storage CDN performance
  - _Requirements: 13.1, 13.2, 13.8_
