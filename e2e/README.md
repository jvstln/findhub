# End-to-End Tests

This directory contains comprehensive E2E tests for the FindHub application using Playwright.

## Test Coverage

### 1. Public User Flow (`public-flow.spec.ts`)
- Complete search → view → claim info flow **without seeing any auth UI**
- Verification that NO login/signup buttons appear on public pages
- Search functionality with filters
- Category filtering
- About page navigation and contact info
- Responsive layout on mobile devices
- **Verification that public routes don't trigger auth middleware**

### 2. Admin User Flow (`admin-flow.spec.ts`)
- Complete login at `/admin/login` → create → update → delete flow
- Form validation error handling
- **Verification that admin routes are properly protected**
- Authentication guard (redirect to `/admin/login`)
- Multiple protected route testing

### 3. Status Change Workflow (`status-workflow.spec.ts`)
- Update item status with **history tracking**
- Multiple status changes (unclaimed → claimed → returned)
- Status badge display on public view
- Status history verification

### 4. File Upload and Image Display (`file-upload.spec.ts`)
- **Supabase Storage** image upload and display
- File size and type validation
- Image update functionality with **Supabase Storage replacement**
- **Supabase Storage cleanup on item deletion**
- Verification of image URLs from Supabase

### 5. Offline Functionality (`offline-functionality.spec.ts`)
- Offline indicator display
- Cached search results for offline access
- Error handling when creating items offline
- Service worker registration (PWA)
- Data synchronization when coming back online
- Offline navigation within cached pages

## Running Tests

### Prerequisites
1. Ensure both frontend and backend servers can start:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:3001`

2. Database should be set up and migrated

3. **Supabase Storage bucket "lost-items" should be configured**

4. Test user should exist:
   - Email: `admin@findhub.com`
   - Password: `password123`

### Commands

```bash
# Run all E2E tests
bun run test:e2e

# Run tests in UI mode (interactive)
bun run test:e2e:ui

# Run tests in headed mode (see browser)
bun run test:e2e:headed

# Run specific test file
bun run test:e2e e2e/public-flow.spec.ts

# Run tests in debug mode
bun run test:e2e --debug
```

## Test Structure

Each test file follows this pattern:
- `test.describe()` - Groups related tests
- `test.beforeEach()` - Setup before each test (e.g., login)
- `test()` - Individual test cases
- Cleanup - Delete test data after tests

## Notes

- Tests use `data-testid` attributes for reliable element selection
- Tests create and clean up their own test data
- Servers are automatically started by Playwright configuration
- Tests run in Chromium by default (can be extended to other browsers)

## Troubleshooting

### Tests fail to start servers
- Check if ports 3000 and 3001 are available
- Verify environment variables are set correctly

### Authentication tests fail
- Ensure test user exists in database
- Check Better Auth configuration

### Timeout errors
- Increase timeout in `playwright.config.ts`
- Check if servers are responding slowly

### Image upload tests fail
- Verify `e2e/fixtures/test-image.jpg` exists
- Run `bun run e2e/fixtures/create-test-image.js` to recreate it
