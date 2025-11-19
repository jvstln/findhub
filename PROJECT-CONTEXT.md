# FindHub - Lost and Found Management System
## Complete Project Context Document

**Generated:** November 19, 2025  
**Purpose:** Comprehensive project documentation for AI context

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Features](#features)
6. [Specifications](#specifications)
7. [Development Guide](#development-guide)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Security](#security)

---

## 1. Project Overview

### What is FindHub?

FindHub is a campus lost-and-found management platform designed for university environments. The system enables administrators to manage lost items through a dashboard interface while allowing students to search for found items via a public web interface. Students must physically visit the admin office to claim items after identifying them online.

### Key Characteristics

- **Public-First Access**: Search and discovery require no authentication
- **Admin-Only Management**: All CRUD operations require authentication
- **Offline-First PWA**: Service workers cache search data for offline access
- **Mobile-Optimized**: Touch-friendly interface with responsive design
- **Type-Safe**: End-to-end TypeScript with Zod validation
- **Feature-Sliced**: Frontend organized by features, not technical layers
- **Security-Enhanced**: Optional security questions and privacy controls for sensitive items

### Project Structure

```
findhub/
├── apps/
│   ├── web/         # Public frontend application (Next.js, port 3001)
│   ├── admin/       # Admin frontend application (Next.js, port 3002)
│   └── server/      # Backend API (Hono, port 3000)
├── packages/
│   ├── auth/        # Authentication configuration & logic
│   ├── db/          # Database schema & queries
│   └── shared/      # Shared types and validation schemas
├── e2e/             # End-to-end tests (Playwright)
├── scripts/         # Utility scripts
└── [config files]   # Root-level configuration
```

---

## 2. Technology Stack

### Build System
- **Monorepo:** Turborepo for task orchestration and caching
- **Package Manager:** Bun (v1.2.19)
- **Runtime:** Bun for server-side execution
- **Bundler:** tsdown for package builds, Next.js built-in for web apps

### Frontend (apps/web & apps/admin)
- **Framework:** Next.js 16.0.0 with React 19.2.0
- **Styling:** TailwindCSS v4 with shadcn/ui components
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form with Zod validation
- **Animations:** Motion (Framer Motion)
- **PWA:** @ducanh2912/next-pwa
- **Theming:** next-themes
- **Notifications:** Sonner

### Backend (apps/server)
- **Framework:** Hono v4
- **Validation:** Zod with @hono/zod-validator
- **Runtime:** Bun with hot reload

### Shared Packages
- **Database:** Drizzle ORM with PostgreSQL
- **Authentication:** Better-Auth v1.3.28
- **Validation:** Zod v4.1.11
- **TypeScript:** v5.8.2
- **File Storage:** Supabase Storage

### Code Quality
- **Linter/Formatter:** Biome (replaces ESLint + Prettier)
- **Testing:** Playwright for E2E tests
- **Type Checking:** TypeScript strict mode


---

## 3. Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
├──────────────────────────┬──────────────────────────────────┤
│   Public Web (3001)      │   Admin App (3002)               │
│   - Search Interface     │   - Dashboard                    │
│   - Item Details         │   - Item Management              │
│   - Home/About           │   - Category Management          │
│   - PWA Support          │   - Security Questions           │
└──────────────────────────┴──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (3000)                        │
│   - Hono Framework                                           │
│   - Public Routes (no auth)                                  │
│   - Protected Routes (admin auth)                            │
│   - File Upload Service                                      │
│   - Security Questions Service                               │
│   - Encryption Service                                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│   - PostgreSQL Database                                      │
│   - Drizzle ORM                                              │
│   - Supabase Storage (images)                                │
│   - Better Auth (sessions)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Route Architecture

**Public Routes** (No authentication required):
- `/` - Home page with hero section and featured items
- `/about` - About page with contact info and claim instructions
- `/search` - Search page with filters
- `/items/[id]` - Item detail page

**Admin Routes** (Authentication required):
- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard with item management
- `/admin/items/new` - Create new item form
- `/admin/items/[id]/edit` - Edit item form
- `/admin/categories` - Category management

### Feature-Sliced Design (Frontend)

```
apps/web/src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Public home page
│   ├── about/page.tsx            # Public about page
│   ├── search/page.tsx           # Public search page
│   ├── items/[id]/page.tsx       # Public item details
│   └── layout.tsx                # Public root layout
├── features/                     # Feature-sliced modules
│   ├── items/                    # Lost items feature
│   │   ├── api/                  # API client functions
│   │   ├── components/           # Feature components
│   │   ├── hooks/                # Feature hooks
│   │   ├── types/                # Feature types
│   │   └── lib/                  # Feature utilities
│   ├── search/                   # Search feature
│   └── auth/                     # Authentication feature
├── components/                   # Shared UI components
│   └── ui/                       # shadcn/ui components
└── lib/                          # Shared utilities
```

### Backend Service-Oriented Architecture

```
apps/server/src/
├── index.ts                      # App entry point
├── routes/                       # Route definitions
│   ├── item.route.ts             # Public item routes
│   ├── admin-item.route.ts       # Protected item routes
│   ├── category.route.ts         # Category routes
│   └── auth.route.ts             # Auth routes
├── services/                     # Business logic
│   ├── item.service.ts
│   ├── security-questions.service.ts
│   ├── encryption.service.ts
│   └── upload.service.ts
├── middleware/                   # Custom middleware
│   ├── auth.middleware.ts
│   └── error.middleware.ts
└── lib/                          # Utilities
```


---

## 4. Database Schema

### Complete Database Tables

#### Authentication Tables (Better Auth)

**users**
- id (text, PK)
- name (text)
- email (text, unique)
- email_verified (boolean)
- image (text)
- created_at (timestamp)
- updated_at (timestamp)

**sessions**
- id (text, PK)
- expires_at (timestamp)
- token (text, unique)
- created_at (timestamp)
- updated_at (timestamp)
- ip_address (text)
- user_agent (text)
- user_id (text, FK → users.id)

**accounts**
- id (text, PK)
- account_id (text)
- provider_id (text)
- user_id (text, FK → users.id)
- access_token (text)
- refresh_token (text)
- expires_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

**verifications**
- id (text, PK)
- identifier (text)
- value (text)
- expires_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

#### Lost Items Tables

**lost_items**
- id (serial, PK)
- name (varchar 255, NOT NULL)
- description (text, NOT NULL)
- category_id (integer, FK → item_categories.id)
- keywords (text)
- location (varchar 255, NOT NULL)
- date_found (timestamp, NOT NULL)
- status (item_status enum, NOT NULL, default: 'unclaimed')
- hide_location (boolean, NOT NULL, default: false)
- hide_date_found (boolean, NOT NULL, default: false)
- created_by_id (text, FK → users.id, cascade delete)
- created_at (timestamp, NOT NULL, default: now())
- updated_at (timestamp, NOT NULL, default: now())

**Indexes:**
- lost_items_status_idx (status)
- lost_items_category_idx (category_id)
- lost_items_date_found_idx (date_found)
- lost_items_created_at_idx (created_at)

**item_images**
- id (serial, PK)
- item_id (integer, FK → lost_items.id, cascade delete)
- url (text, NOT NULL) - Supabase Storage public URL
- key (text, NOT NULL) - Supabase Storage file path
- filename (varchar 255, NOT NULL)
- mime_type (varchar 100, NOT NULL)
- size (integer, NOT NULL) - File size in bytes
- display_order (integer, NOT NULL, default: 0)
- uploaded_by_id (text, FK → users.id, cascade delete)
- created_at (timestamp, NOT NULL, default: now())
- updated_at (timestamp, NOT NULL, default: now())

**Indexes:**
- item_images_item_id_idx (item_id)
- item_images_display_order_idx (item_id, display_order)

**item_categories**
- id (serial, PK)
- name (varchar 100, NOT NULL)
- description (text)
- created_at (timestamp, NOT NULL, default: now())
- updated_at (timestamp, NOT NULL, default: now())

**item_status_histories**
- id (serial, PK)
- item_id (integer, FK → lost_items.id, cascade delete)
- previous_status (item_status enum, NOT NULL)
- new_status (item_status enum, NOT NULL)
- changed_by_id (text, FK → users.id, cascade delete)
- notes (text)
- created_at (timestamp, NOT NULL, default: now())
- updated_at (timestamp, NOT NULL, default: now())

**security_questions**
- id (serial, PK)
- item_id (integer, FK → lost_items.id, cascade delete)
- question_text (text, NOT NULL)
- question_type (question_type enum, NOT NULL)
- options (text[], nullable) - For multiple choice questions
- encrypted_answer (text, NOT NULL)
- iv (text, NOT NULL) - Initialization vector for AES-GCM
- auth_tag (text, NOT NULL) - Authentication tag for AES-GCM
- display_order (integer, NOT NULL, default: 0)
- created_by_id (text, FK → users.id, cascade delete)
- created_at (timestamp, NOT NULL, default: now())
- updated_at (timestamp, NOT NULL, default: now())

**Indexes:**
- security_questions_item_id_idx (item_id)
- security_questions_display_order_idx (item_id, display_order)

#### Enums

**item_status**
- unclaimed
- claimed
- returned
- archived

**question_type**
- multiple_choice
- free_text

### Key Relationships

```
users (1) ──< (N) lost_items (created_by_id)
users (1) ──< (N) item_images (uploaded_by_id)
users (1) ──< (N) item_status_histories (changed_by_id)
users (1) ──< (N) security_questions (created_by_id)

item_categories (1) ──< (N) lost_items (category_id)

lost_items (1) ──< (N) item_images (item_id)
lost_items (1) ──< (N) item_status_histories (item_id)
lost_items (1) ──< (N) security_questions (item_id)
```


---

## 5. Features

### Core Features

#### 1. Item Registration (Admin)
- Create lost items with complete details (name, description, category, location, date found)
- Upload multiple images (up to 10) per item
- Images stored in Supabase Storage (5MB max, JPEG/PNG/WebP)
- Automatic UUID-based filename generation
- Image preview and reordering

#### 2. Search and Discovery (Public)
- Keyword search across item name, description, and keywords
- Filter by category, date range, location, and status
- Responsive grid layout (1/2/3 columns based on device)
- Pagination for large result sets
- No authentication required

#### 3. Item Detail Viewing (Public)
- Full-size image gallery
- Complete item information
- Status indicator (unclaimed/claimed/returned)
- Claim instructions and contact information
- Responsive layout for all devices

#### 4. Status Management (Admin)
- Update item status through lifecycle (unclaimed → claimed → returned)
- Status history tracking with timestamps and user attribution
- Visual status badges
- Audit trail for all status changes

#### 5. Item Management (Admin)
- Edit existing items (all fields including images)
- Delete items with confirmation
- Image replacement with automatic cleanup
- Bulk operations support

#### 6. Authentication (Admin)
- Email/password authentication via Better-Auth
- Secure session management (24-hour sessions)
- Protected admin routes with middleware
- Login/logout functionality

#### 7. Category Management (Admin)
- Dynamic category system backed by database
- Create, read, update, delete categories
- Category assignment to items
- Default categories: Electronics, Clothing, Accessories, Books, Keys, Cards, Bags, Other

#### 8. Progressive Web App (PWA)
- Installable on mobile devices
- Offline search with cached data
- Service worker caching strategies
- Background sync for failed requests
- Offline indicator

#### 9. Security Questions (Admin)
- Optional verification questions for items
- Two question types: multiple choice and free text
- Up to 5 questions per item
- Encrypted answer storage (AES-256-GCM)
- Admin-only access to questions and answers

#### 10. Privacy Controls (Admin)
- Hide location from public users
- Hide date found from public users
- Visual indicators for hidden fields
- Obscured field indicators for public users
- Admin always sees complete information

### Feature Details

#### Security Questions System

**Question Types:**
1. **Multiple Choice**: Question with 2-6 options, one correct answer
2. **Free Text**: Question with expected text answer

**Encryption:**
- Algorithm: AES-256-GCM
- 32-byte encryption key from environment
- Unique IV (initialization vector) per encryption
- Authentication tag for tamper detection

**Use Cases:**
- Verify item ownership without revealing sensitive details
- Additional security layer for high-value items
- Reduce false claims

#### Privacy Controls

**Hide Location:**
- Public users see "This information is hidden" indicator
- Admin users see actual location with visibility indicator
- Items excluded from location-based filters when hidden

**Hide Date Found:**
- Public users see "This information is hidden" indicator
- Admin users see actual date with visibility indicator
- Items excluded from date range filters when hidden

**Benefits:**
- Protect sensitive information
- Encourage legitimate claimants to contact admin
- Reduce false claims based on partial information


---

## 6. Specifications

### Specification 1: Lost and Found System (Core)

**Status:** ✅ Complete  
**Location:** `.kiro/specs/lost-and-found-system/`

**Key Requirements:**
- Item registration with image uploads
- Public search and filtering
- Item detail viewing
- Status management (unclaimed → claimed → returned)
- Admin authentication
- PWA capabilities
- Responsive design (mobile/tablet/desktop)
- Supabase Storage integration

**Implementation Highlights:**
- 38 tasks completed
- E2E tests for all user flows
- Responsive design verified across all breakpoints
- Touch targets meet 44x44px minimum on mobile
- Zero horizontal scrolling on any device
- Supabase Storage configured and tested

### Specification 2: UI Improvements and Admin Separation

**Status:** ✅ Complete  
**Location:** `.kiro/specs/ui-improvements-and-admin-separation/`

**Key Requirements:**
- Conditional header search button visibility
- Responsive filter input layouts
- Contextual empty state messaging
- Dynamic category management
- Separate admin application

**Implementation Highlights:**
- Admin app deployed on port 3002
- Category API with CRUD operations
- Improved responsive layouts
- Better empty state UX
- Independent deployment capability

### Specification 3: Item Security and Privacy

**Status:** ✅ Complete  
**Location:** `.kiro/specs/item-security-and-privacy/`

**Key Requirements:**
- Security questions with encrypted answers
- Privacy controls for location and date
- Admin-only access to security data
- Public obscured field indicators
- Validation and error handling

**Implementation Highlights:**
- AES-256-GCM encryption for answers
- Two question types (multiple choice, free text)
- Privacy filtering at service layer
- Comprehensive validation schemas
- Audit trail for security changes

---

## 7. Development Guide

### Prerequisites

- Bun v1.2.19 or later
- PostgreSQL database
- Supabase project (for file storage)
- Node.js 20+ (for some tooling)

### Initial Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd findhub
bun install
```

2. **Environment Variables**

Create `.env` files in:
- `apps/server/.env`
- `apps/web/.env`
- `apps/admin/.env`

**Server (.env):**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/findhub
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=your-64-char-hex-key
```

**Web (.env):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3001
```

**Admin (.env):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3002
```

3. **Generate Encryption Key**
```bash
bun run generate:encryption-key
```

4. **Database Setup**
```bash
# Push schema to database
bun run db:push

# Or run migrations
bun run db:migrate

# Seed categories
bun run seed:categories

# Open database studio
bun run db:studio
```

5. **Supabase Storage Setup**
- Create bucket named "lost-items"
- Enable public read access
- Set 5MB file size limit
- Allow MIME types: image/jpeg, image/png, image/webp

### Development Commands

```bash
# Start all applications
bun run dev

# Start individual applications
bun run dev:web      # Public web app (port 3001)
bun run dev:admin    # Admin app (port 3002)
bun run dev:server   # API server (port 3000)

# Build all applications
bun run build

# Type checking
bun run check-types

# Linting and formatting
bun run check

# Database operations
bun run db:push      # Push schema changes
bun run db:studio    # Open database UI
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations

# Testing
bun run test:e2e         # Run E2E tests
bun run test:e2e:ui      # Run tests with UI
bun run test:e2e:headed  # Run tests in headed mode
```

### Project Structure Details

**Shared Packages:**

`@findhub/db` - Database layer
- Exports: `.` (database instance), `./types` (TypeScript types), `./schemas` (Drizzle schemas)
- Frontend uses type-only imports to avoid bundling database code
- Backend imports full database instance

`@findhub/shared` - Shared logic
- Exports: `./types` (application types), `./schemas` (Zod validation)
- Used by both frontend and backend
- Runtime validation schemas

`@findhub/auth` - Authentication
- Better-Auth configuration
- Shared between web, admin, and server

### Code Organization

**Feature-Sliced Design:**
```
features/
├── items/
│   ├── api/          # API client functions
│   ├── components/   # Feature-specific components
│   ├── hooks/        # Custom hooks
│   ├── types/        # Feature types
│   └── lib/          # Utilities
```

**Naming Conventions:**
- Schema files: `*.schema.ts` (Zod validation)
- Type files: `*.type.ts` (TypeScript types)
- Database types: Singular PascalCase (e.g., `LostItem`)
- Application types: Descriptive PascalCase (e.g., `SearchFilters`)


---

## 8. Deployment

### Production URL Structure

- **Public Web:** `https://findhub.example.com`
- **Admin Panel:** `https://admin.findhub.example.com`
- **API Server:** `https://api.findhub.example.com`

### Environment Variables (Production)

**Server:**
```bash
DATABASE_URL=postgresql://prod-host:5432/findhub_prod
CORS_ORIGIN=https://findhub.example.com,https://admin.findhub.example.com
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=<production-service-key>
BETTER_AUTH_SECRET=<production-secret>
BETTER_AUTH_URL=https://api.findhub.example.com
ENCRYPTION_KEY=<production-encryption-key>
```

**Web:**
```bash
NEXT_PUBLIC_API_URL=https://api.findhub.example.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
BETTER_AUTH_SECRET=<production-secret>
BETTER_AUTH_URL=https://findhub.example.com
```

**Admin:**
```bash
NEXT_PUBLIC_API_URL=https://api.findhub.example.com
BETTER_AUTH_SECRET=<production-secret>
BETTER_AUTH_URL=https://admin.findhub.example.com
NEXT_PUBLIC_ADMIN_MODE=true
```

### Build Process

```bash
# Build all applications
bun run build

# Build individually
turbo build --filter=web
turbo build --filter=@findhub/admin
turbo build --filter=server
```

### Deployment Methods

#### Method 1: Vercel (Recommended for Next.js apps)

**Web App:**
1. Connect repository to Vercel
2. Set build command: `cd ../.. && turbo build --filter=web`
3. Set output directory: `apps/web/.next`
4. Configure environment variables

**Admin App:**
1. Create separate Vercel project
2. Set build command: `cd ../.. && turbo build --filter=@findhub/admin`
3. Set output directory: `apps/admin/.next`
4. Configure environment variables

#### Method 2: Docker

See `DEPLOYMENT.md` for complete Docker configurations.

#### Method 3: Traditional VPS/Server

Using PM2:
```bash
# Install PM2
npm install -g pm2

# Build applications
bun run build

# Start with PM2
pm2 start ecosystem.config.js
```

### Database Migration

```bash
# Production migration
DATABASE_URL="<production-url>" bun run db:migrate

# Verify
DATABASE_URL="<production-url>" bun run db:studio
```

### Health Checks

Add to server for monitoring:
```typescript
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/health/db', async (c) => {
  try {
    await db.select().from(items).limit(1);
    return c.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return c.json({ status: 'error', database: 'disconnected' }, 500);
  }
});
```

### Security Checklist

- [ ] HTTPS enabled for all domains
- [ ] CORS configured for production domains
- [ ] Supabase Storage bucket configured with RLS policies
- [ ] Environment variables secured (use secrets manager)
- [ ] Encryption key rotated and secured
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Admin routes IP-restricted (optional)

### Performance Optimization

**Frontend:**
- Next.js Image optimization enabled
- Code splitting by route
- Service worker caching
- Static generation where possible

**Backend:**
- Database connection pooling
- Query optimization with indexes
- Supabase Storage CDN
- Response caching where appropriate

**Database:**
- Indexes on frequently queried columns
- Connection pooling
- Regular VACUUM and ANALYZE


---

## 9. Testing

### E2E Tests (Playwright)

**Test Files:**
- `e2e/public-flow.spec.ts` - Public user search and view
- `e2e/admin-flow.spec.ts` - Admin CRUD operations
- `e2e/status-workflow.spec.ts` - Status change tracking
- `e2e/file-upload.spec.ts` - Image upload functionality
- `e2e/offline-functionality.spec.ts` - PWA offline capabilities

**Running Tests:**
```bash
# Run all tests
bun run test:e2e

# Run with UI
bun run test:e2e:ui

# Run in headed mode
bun run test:e2e:headed
```

**Test Coverage:**
- ✅ Public user flows (search, filter, view)
- ✅ Admin authentication
- ✅ Item CRUD operations
- ✅ Status management
- ✅ File uploads
- ✅ Offline functionality
- ✅ Security questions
- ✅ Privacy controls

### Unit Tests

**Encryption Service:**
```typescript
describe("EncryptionService", () => {
  it("should encrypt and decrypt correctly");
  it("should generate unique IVs");
  it("should fail with wrong auth tag");
});
```

**Security Questions Service:**
```typescript
describe("SecurityQuestionsService", () => {
  it("should create questions with encrypted answers");
  it("should decrypt answers when retrieving");
  it("should update questions");
  it("should delete questions");
});
```

**Validation Schemas:**
```typescript
describe("Security Question Validation", () => {
  it("should validate multiple choice questions");
  it("should reject invalid structures");
  it("should validate free text questions");
});
```

### Integration Tests

**API Endpoints:**
- Test complete request/response cycles
- Test authentication flows
- Test file upload end-to-end
- Test error handling scenarios

### Testing Strategy

1. **Unit Tests**: Core business logic and utilities
2. **Integration Tests**: API endpoints and services
3. **E2E Tests**: Complete user journeys
4. **Visual Regression**: UI components (optional)

---

## 10. Security

### Authentication & Authorization

**Better-Auth Implementation:**
- Email/password authentication
- Secure session management
- HTTP-only cookies
- CSRF protection
- Session timeout (24 hours)

**Access Control:**
- Public routes: No authentication required
- Admin routes: Require valid session
- Middleware validates session on protected routes
- Role-based access (admin only)

### Encryption

**Security Questions:**
- Algorithm: AES-256-GCM
- Key: 32-byte hex string from environment
- Unique IV per encryption
- Authentication tag for tamper detection

**Key Management:**
- Stored in environment variables
- Never committed to version control
- Rotated periodically in production
- Backed up securely

### Input Validation

**Client-Side:**
- Zod schemas validate forms before submission
- Real-time validation feedback
- File type and size validation

**Server-Side:**
- All inputs validated again on backend
- Zod schemas with @hono/zod-validator
- SQL injection prevention via Drizzle ORM
- XSS prevention via React escaping

### File Upload Security

**Validation:**
- File type whitelist: JPEG, PNG, WebP only
- File size limit: 5MB enforced on client and server
- Filename sanitization: UUID-based names
- MIME type verification

**Storage:**
- Supabase Storage with public bucket
- RLS policies for additional security
- CDN delivery for performance
- Automatic cleanup on deletion

### API Security

**CORS Configuration:**
```typescript
app.use('*', cors({
  origin: [
    'https://findhub.example.com',
    'https://admin.findhub.example.com'
  ],
  credentials: true
}));
```

**Rate Limiting:**
- Implement rate limiting on sensitive endpoints
- Protect login endpoint from brute force
- Monitor and alert on suspicious activity

### Data Privacy

**Privacy Controls:**
- Admin can hide location from public
- Admin can hide date found from public
- Security questions never exposed to public API
- Encrypted answers stored in database

**Audit Trail:**
- Status changes logged with user and timestamp
- Security question creation/modification tracked
- Privacy control changes logged

### Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **HTTPS**: Always use HTTPS in production
3. **Session Security**: HTTP-only, secure, SameSite cookies
4. **Input Validation**: Validate on client and server
5. **SQL Injection**: Use parameterized queries (Drizzle ORM)
6. **XSS Prevention**: React escapes output by default
7. **File Upload**: Validate type, size, and sanitize names
8. **Encryption**: Use strong algorithms (AES-256-GCM)
9. **Access Control**: Verify permissions on every request
10. **Audit Logging**: Track sensitive operations


---

## 11. API Reference

### Public Endpoints (No Authentication)

#### GET /api/items
Search and filter lost items

**Query Parameters:**
- `keyword` (string, optional): Search in name, description, keywords
- `category` (string, optional): Filter by category ID
- `location` (string, optional): Filter by location
- `status` (string, optional): Filter by status (unclaimed, claimed, returned)
- `dateFrom` (date, optional): Filter items found after this date
- `dateTo` (date, optional): Filter items found before this date
- `page` (number, optional, default: 1): Page number
- `pageSize` (number, optional, default: 20): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [/* array of items */],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

#### GET /api/items/:id
Get single item details (with privacy filtering)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Blue Backpack",
    "description": "...",
    "categoryId": 7,
    "location": "Library 3rd Floor",  // null if hidden
    "dateFound": "2025-11-15T10:30:00Z",  // null if hidden
    "status": "unclaimed",
    "hideLocation": false,
    "hideDateFound": true,
    "images": [/* array of image objects */],
    "createdAt": "2025-11-15T10:30:00Z",
    "updatedAt": "2025-11-15T10:30:00Z"
  }
}
```

#### GET /api/categories
List all categories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories"
    }
  ]
}
```

### Protected Endpoints (Admin Only)

#### POST /api/admin/items
Create new item with security questions

**Headers:**
- `Authorization: Bearer <token>`

**Body (multipart/form-data):**
```json
{
  "name": "Blue Backpack",
  "description": "...",
  "categoryId": 7,
  "location": "Library 3rd Floor",
  "dateFound": "2025-11-15T10:30:00Z",
  "hideLocation": false,
  "hideDateFound": true,
  "securityQuestions": [
    {
      "questionText": "What brand is the laptop inside?",
      "questionType": "free_text",
      "answer": "Dell"
    }
  ],
  "images": [/* File objects */]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    /* item with security questions */
  }
}
```

#### GET /api/admin/items/:id
Get item with security questions (decrypted answers)

**Response:**
```json
{
  "success": true,
  "data": {
    /* item object */,
    "securityQuestions": [
      {
        "id": 1,
        "questionText": "What brand is the laptop inside?",
        "questionType": "free_text",
        "answer": "Dell",  // Decrypted
        "displayOrder": 0
      }
    ]
  }
}
```

#### PATCH /api/admin/items/:id
Update item

**Body:**
```json
{
  "name": "Updated Name",
  "status": "claimed",
  "hideLocation": true,
  "securityQuestions": [/* updated questions */]
}
```

#### DELETE /api/admin/items/:id
Delete item (with Supabase Storage cleanup)

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

#### POST /api/categories
Create new category

**Body:**
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

#### PATCH /api/categories/:id
Update category

#### DELETE /api/categories/:id
Delete category

### Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Item not found"
  }
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```


---

## 12. Common Commands Reference

### Development

```bash
# Start all applications
bun run dev

# Start individual apps
bun run dev:web      # Public web (port 3001)
bun run dev:admin    # Admin app (port 3002)
bun run dev:server   # API server (port 3000)
```

### Build & Quality

```bash
# Build all applications
bun run build

# Type checking
bun run check-types

# Linting and formatting
bun run check
```

### Database

```bash
# Push schema changes
bun run db:push

# Open database studio
bun run db:studio

# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Seed categories
bun run seed:categories

# Check seed status
bun run seed:check
```

### Testing

```bash
# Run E2E tests
bun run test:e2e

# Run tests with UI
bun run test:e2e:ui

# Run tests in headed mode
bun run test:e2e:headed
```

### Utilities

```bash
# Generate encryption key
bun run generate:encryption-key

# Generate PWA assets (in apps/web)
cd apps/web && bun run generate-pwa-assets
```

---

## 13. Troubleshooting

### Common Issues

#### Database Connection Errors
**Problem:** Cannot connect to database  
**Solution:**
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Verify database exists
- Check network connectivity

#### Supabase Storage Errors
**Problem:** Image upload fails  
**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Check bucket "lost-items" exists
- Verify bucket is public
- Check file size < 5MB
- Verify MIME type is allowed

#### Authentication Errors
**Problem:** Cannot log in  
**Solution:**
- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches deployment URL
- Clear browser cookies
- Check user exists in database

#### Build Errors
**Problem:** Build fails  
**Solution:**
- Run `bun run check-types` to identify TypeScript errors
- Run `bun run check` to fix formatting
- Clear `.next` and `dist` directories
- Run `bun install` to update dependencies

#### Port Already in Use
**Problem:** Port 3000/3001/3002 already in use  
**Solution:**
- Kill process using port: `lsof -ti:3000 | xargs kill -9`
- Or change port in package.json scripts

### Debug Mode

Enable debug logging:
```bash
# Server
DEBUG=* bun run dev:server

# Database queries
DATABASE_DEBUG=true bun run dev:server
```

### Performance Issues

**Slow Queries:**
- Check database indexes exist
- Use `EXPLAIN ANALYZE` on slow queries
- Consider adding more indexes

**Slow Image Loading:**
- Verify Supabase Storage CDN is enabled
- Check image sizes (should be < 5MB)
- Verify Next.js Image optimization is working

**Slow Page Loads:**
- Check React Query cache settings
- Verify service worker caching
- Use Lighthouse to identify bottlenecks

---

## 14. Future Enhancements

### Planned Features

1. **Email Notifications**
   - Notify users when item status changes
   - Send claim reminders
   - Weekly digest of new items

2. **Advanced Search**
   - Full-text search with PostgreSQL
   - Fuzzy matching
   - Search suggestions

3. **Image Recognition**
   - AI-powered item matching
   - Automatic categorization
   - Duplicate detection

4. **Multi-Language Support**
   - i18n for international campuses
   - RTL language support
   - Localized content

5. **Analytics Dashboard**
   - Track claim rates
   - Popular categories
   - User engagement metrics
   - Performance monitoring

6. **QR Code Generation**
   - Generate QR codes for physical item tags
   - Quick item lookup via QR scan
   - Print-friendly labels

7. **Mobile Apps**
   - Native iOS app
   - Native Android app
   - Push notifications

8. **Bulk Operations**
   - CSV import for existing items
   - Bulk status updates
   - Batch image uploads

9. **Security Question Verification**
   - Public users can attempt to answer questions
   - Correct answers reveal hidden information
   - Rate limiting to prevent brute force

10. **Advanced Privacy Controls**
    - Time-based privacy (auto-reveal after X days)
    - Partial information reveal
    - Custom privacy rules per category

---

## 15. Contributing Guidelines

### Code Style

- Use Biome for formatting and linting
- Follow TypeScript strict mode
- Use feature-sliced design for frontend
- Write descriptive commit messages

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with tests
3. Run `bun run check` and `bun run check-types`
4. Run E2E tests
5. Submit PR with description
6. Address review comments
7. Merge after approval

### Testing Requirements

- Add E2E tests for new user flows
- Add unit tests for business logic
- Verify responsive design
- Test on multiple browsers

---

## 16. License & Credits

### Technology Credits

- **Next.js** - React framework
- **Hono** - Web framework
- **Drizzle ORM** - TypeScript ORM
- **Better-Auth** - Authentication
- **Supabase** - File storage
- **shadcn/ui** - UI components
- **TailwindCSS** - Styling
- **Bun** - Runtime and package manager
- **Turborepo** - Monorepo tooling

### Project Information

- **Created with:** Better-T-Stack
- **Repository:** [GitHub URL]
- **Documentation:** This file
- **Support:** [Contact information]

---

## Appendix A: Environment Variables Reference

### Complete Environment Variables List

**apps/server/.env:**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002

# Server
PORT=3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Authentication
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Encryption
ENCRYPTION_KEY=your-64-character-hex-key
```

**apps/web/.env:**
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Authentication
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3001
```

**apps/admin/.env:**
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Authentication
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3002

# Admin Mode
NEXT_PUBLIC_ADMIN_MODE=true
```

---

## Appendix B: Database Migrations

### Migration History

1. **0001_initial_schema** - Initial database setup with Better-Auth tables
2. **0002_lost_items** - Lost items, categories, images, status history tables
3. **0003_category_seed** - Seed initial categories
4. **0004_add_security_questions_and_privacy** - Security questions and privacy controls

### Running Migrations

```bash
# Generate new migration
bun run db:generate

# Review generated SQL in packages/db/src/migrations/

# Apply migration
bun run db:migrate

# Verify in studio
bun run db:studio
```

### Rollback Procedure

If migration fails:
1. Restore database from backup
2. Fix migration SQL
3. Re-run migration
4. Verify data integrity

---

## Appendix C: Supabase Storage Configuration

### Bucket Setup

1. **Create Bucket:**
   - Name: `lost-items`
   - Public: Yes (for read access)
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp

2. **RLS Policies (Optional):**
   ```sql
   -- Public read access
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'lost-items');
   
   -- Authenticated upload (if using direct frontend upload)
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'lost-items' 
     AND auth.role() = 'authenticated'
   );
   ```

3. **CORS Configuration:**
   - Add application domains to allowed origins
   - Enable credentials if needed

### File Naming Convention

- Format: `{uuid}.{extension}`
- Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`
- Prevents collisions and sanitizes user input

---

**End of Document**

This comprehensive context document provides all necessary information about the FindHub project for AI-assisted development, maintenance, and enhancement.

