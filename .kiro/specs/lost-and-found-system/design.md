# Design Document: FindHub Lost & Found System

## Overview

FindHub is a full-stack lost-and-found management system built on the Better Stack with a clear separation between public and administrative interfaces. The system leverages the existing monorepo architecture with Next.js frontend, Hono backend, PostgreSQL database, and Better Auth for authentication.

The design follows feature-sliced architecture principles on the frontend and modular service-oriented architecture on the backend. The system is optimized for mobile-first usage with PWA capabilities, enabling offline search and installation on mobile devices.

### Key Design Principles

1. **Public-First Access**: Search and discovery require no authentication
2. **Admin-Only Management**: All CRUD operations require authentication
3. **Offline-First PWA**: Service workers cache search data for offline access
4. **Mobile-Optimized**: Touch-friendly interface with responsive design
5. **Type-Safe**: End-to-end TypeScript with Zod validation
6. **Feature-Sliced**: Frontend organized by features, not technical layers

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend - Next.js App Router"
        A[Public Pages] --> B[Search Interface]
        A --> C[Item Details]
        A --> D[Home/About]
        E[Admin Pages] --> F[Dashboard]
        E --> G[Item Management]
        H[Service Worker] --> I[Cache API]
    end

    subgraph "Backend - Hono API"
        J[Public Routes] --> K[Item Search]
        J --> L[Item Details]
        M[Protected Routes] --> N[Item CRUD]
        M --> O[Status Updates]
        P[Auth Middleware] --> M
        Q[File Upload] --> R[Image Storage]
    end

    subgraph "Data Layer"
        S[Drizzle ORM]
        T[(PostgreSQL)]
        U[Better Auth Tables]
        V[Lost Items Table]
        W[Audit Logs Table]
    end

    B --> K
    C --> L
    F --> N
    G --> N
    G --> O
    N --> S
    O --> S
    S --> T
    T --> U
    T --> V
    T --> W
    P --> U
```

### Technology Stack Integration

- **Frontend**: Next.js 16 App Router with React 19.2
- **Backend**: Hono 4.8+ with Bun runtime
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth with email/password
- **Styling**: TailwindCSS 4 + shadcn/ui components
- **State**: TanStack Query for server state and Zustand for state management
- **Forms**: React hook form with Zod validation
- **PWA**: Next.js PWA plugin with Workbox
- **File Storage**: Supabase Storage with public bucket access

## Route Architecture and Access Control

### Public vs Admin Route Separation

The application uses a clear route structure to separate public and admin functionality:

**Public Routes** (No authentication required):
- `/` - Home page with hero section and featured items
- `/about` - About page with contact info and claim instructions
- `/search` - Search page with filters
- `/items/[id]` - Item detail page

**Admin Routes** (Authentication required):
- `/admin/login` - Admin login page (public access but admin-focused)
- `/admin/dashboard` - Admin dashboard with item management
- `/admin/items/new` - Create new item form
- `/admin/items/[id]/edit` - Edit item form

### Middleware Strategy

```typescript
// apps/web/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only apply auth checks to /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('session')
    
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}
```

### Layout Separation

**Public Layout** (`app/layout.tsx`):
- Clean navigation without auth UI
- Footer with contact info
- No admin links or buttons
- Optimized for public discovery

**Admin Layout** (`app/admin/layout.tsx`):
- Protected by auth guard
- Admin sidebar navigation
- User profile/logout controls
- Dashboard-focused UI

### Key Design Principles

1. **Zero Auth UI on Public Pages**: Public users never see login, signup, or admin buttons
2. **Middleware Only on Admin Routes**: Authentication checks only run for `/admin/*` paths
3. **Separate Layout Trees**: Public and admin pages use completely different layouts
4. **Clear URL Structure**: `/admin/*` prefix makes admin routes immediately identifiable
5. **No Shared Navigation**: Public header and admin sidebar are completely separate components

## Components and Interfaces

### Frontend Architecture (Feature-Sliced Design)

```
apps/web/src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Public home page
│   ├── about/page.tsx            # Public about page
│   ├── search/page.tsx           # Public search page
│   ├── items/[id]/page.tsx       # Public item details
│   ├── layout.tsx                # Public root layout (no auth UI)
│   └── admin/                    # Admin route group
│       ├── layout.tsx            # Protected admin layout
│       ├── login/page.tsx        # Admin login page
│       ├── dashboard/page.tsx    # Admin dashboard
│       └── items/                # Admin item management
│           ├── new/page.tsx      # Create item
│           └── [id]/edit/page.tsx # Edit item
├── features/                     # Feature-sliced modules
│   ├── items/                    # Lost items feature
│   │   ├── api/                  # API client functions
│   │   │   ├── get-items.ts
│   │   │   ├── get-item.ts
│   │   │   ├── create-item.ts
│   │   │   ├── update-item.ts
│   │   │   └── delete-item.ts
│   │   ├── components/           # Feature components
│   │   │   ├── item-card.tsx
│   │   │   ├── item-grid.tsx
│   │   │   ├── item-detail.tsx
│   │   │   ├── item-form.tsx
│   │   │   ├── item-table.tsx
│   │   │   └── status-badge.tsx
│   │   ├── hooks/                # Feature hooks
│   │   │   ├── use-items.ts
│   │   │   ├── use-item.ts
│   │   │   └── use-item-mutations.ts
│   │   ├── types/                # Feature types
│   │   │   └── item.ts
│   │   └── lib/                  # Feature utilities
│   │       └── validation.ts
│   ├── search/                   # Search feature
│   │   ├── components/
│   │   │   ├── search-bar.tsx
│   │   │   ├── search-filters.tsx
│   │   │   └── search-results.tsx
│   │   ├── hooks/
│   │   │   └── use-search.ts
│   │   └── types/
│   │       └── filters.ts
│   └── auth/                     # Authentication feature
│       ├── components/
│       │   ├── login-form.tsx
│       │   └── auth-guard.tsx
│       ├── hooks/
│       │   └── use-auth.ts
│       └── api/
│           └── auth-client.ts
├── components/                   # Shared UI components
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       └── ...
└── lib/                          # Shared utilities
    ├── api-client.ts             # Base API client
    ├── query-client.ts           # TanStack Query setup
    └── utils.ts                  # Helper functions
```

### Backend Architecture (Service-Oriented)

```
apps/server/src/
├── index.ts                      # App entry point
├── routes/                       # Route definitions
│   ├── items.ts                  # Item routes
│   └── auth.ts                   # Auth routes
├── controllers/                  # Request handlers
│   └── items.controller.ts
├── services/                     # Business logic
│   ├── items.service.ts
│   └── upload.service.ts
├── middleware/                   # Custom middleware
│   ├── auth.middleware.ts
│   └── error.middleware.ts
└── lib/                          # Utilities
    ├── validation.ts
    └── response.ts
```

### Database Schema

```
packages/db/src/schema/
├── auth.ts                       # Existing Better Auth tables
└── items.ts                      # New lost items schema
```

## Data Models

### Lost Item Schema

```typescript
// packages/db/src/schema/items.ts
import { pgTable, text, timestamp, varchar, serial } from "drizzle-orm/pg-core";

export const lostItem = pgTable("lost_item", {
  id: serial().primaryKey(),
  name: varchar(, { length: 255 }).notNull(),
  description: text().notNull(),
  category: varchar(, { length: 100 }).notNull(),
  location: varchar(, { length: 255 }).notNull(),
  dateFound: timestamp().notNull(),
  status: varchar(, { length: 50 }).notNull().default("unclaimed"),
  imageUrl: text(), // Supabase Storage public URL
  imageKey: text(), // Supabase Storage file path for deletion
  createdById: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const itemStatusHistory = pgTable("item_status_history", {
  id: serial().primaryKey(),
  itemId: serial()
    .notNull()
    .references(() => lostItem.id, { onDelete: "cascade" }),
  previousStatus: varchar({length: 50 }).notNull(),
  newStatus: varchar({ length: 50 }).notNull(),
  changedById: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  changedAt: timestamp().notNull().defaultNow(),
  notes: text(),
});
```

### TypeScript Types

```typescript
// Shared types for frontend and backend
export type ItemStatus = "unclaimed" | "claimed" | "returned";

export type ItemCategory =
  | "electronics"
  | "clothing"
  | "accessories"
  | "books"
  | "keys"
  | "cards"
  | "bags"
  | "other";

export interface LostItem {
  id: number;
  name: string;
  description: string;
  category: ItemCategory;
  location: string;
  dateFound: Date;
  status: ItemStatus;
  imageUrl: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemWithHistory extends LostItem {
  statusHistory: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  id: number;
  itemId: number;
  previousStatus: ItemStatus;
  newStatus: ItemStatus;
  changedById: string;
  changedAt: Date;
  notes: string | null;
}

export interface SearchFilters {
  keyword?: string;
  category?: ItemCategory;
  location?: string;
  status?: ItemStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Zod Validation Schemas

```typescript
// Shared validation schemas
import { z } from "zod";

export const itemStatusSchema = z.enum(["unclaimed", "claimed", "returned"]);

export const itemCategorySchema = z.enum([
  "electronics",
  "clothing",
  "accessories",
  "books",
  "keys",
  "cards",
  "bags",
  "other",
]);

export const createItemSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(10).max(2000),
  category: itemCategorySchema,
  location: z.string().min(3).max(255),
  dateFound: z.coerce.date(),
  image: z.instanceof(File).optional(),
});

export const updateItemSchema = createItemSchema.partial().extend({
  status: itemStatusSchema.optional(),
});

export const searchFiltersSchema = z.object({
  keyword: z.string().optional(),
  category: itemCategorySchema.optional(),
  location: z.string().optional(),
  status: itemStatusSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
```

## API Design

### Public Endpoints (No Authentication Required)

```typescript
// GET /api/items
// Query params: keyword, category, location, status, dateFrom, dateTo, page, pageSize
// Response: PaginatedResponse<LostItem>

// GET /api/items/:id
// Response: LostItem
```

### Protected Endpoints (Admin Only)

```typescript
// POST /api/items
// Body: FormData with item fields + image file
// Response: LostItem

// PATCH /api/items/:id
// Body: Partial item fields (including status)
// Response: LostItem

// DELETE /api/items/:id
// Response: { success: boolean }

// GET /api/items/:id/history
// Response: StatusHistoryEntry[]
```

### Authentication Endpoints (Better Auth)

```typescript
// POST /api/auth/sign-in
// Body: { email: string, password: string }
// Response: { user, session }

// POST /api/auth/sign-out
// Response: { success: boolean }

// GET /api/auth/session
// Response: { user, session } | null
```

### API Response Format

```typescript
// Success response
{
  success: true,
  data: T,
  message?: string
}

// Error response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: unknown
  }
}
```

## File Upload Strategy (Supabase Storage)

### Image Upload Flow

1. **Frontend**: User selects image in form
2. **Validation**: Client validates file size (max 5MB) and type (JPEG, PNG, WebP)
3. **Upload**: FormData sent to backend with multipart/form-data
4. **Backend Processing**:
   - Validate file again on server
   - Generate unique filename: `{uuid}.{ext}`
   - Upload to Supabase Storage bucket "lost-items" using Supabase client
   - Get public URL from Supabase
   - Store public URL and file path in database
5. **Serving**: Images served directly from Supabase CDN via public URLs
6. **Deletion**: When item deleted, remove file from Supabase Storage using stored imageKey

### Supabase Storage Configuration

```typescript
// Supabase Storage setup
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Bucket configuration
// - Name: "lost-items"
// - Public: true (for public read access)
// - File size limit: 5MB
// - Allowed MIME types: image/jpeg, image/png, image/webp
```

### File Storage Structure in Supabase

```
Supabase Storage Bucket: lost-items/
├── abc123-def456-ghi789.jpg
├── jkl012-mno345-pqr678.png
└── stu901-vwx234-yz567.webp
```

## Error Handling

### Error Categories

1. **Validation Errors** (400): Invalid input data
2. **Authentication Errors** (401): Missing or invalid session
3. **Authorization Errors** (403): Insufficient permissions
4. **Not Found Errors** (404): Resource doesn't exist
5. **Server Errors** (500): Unexpected failures

### Error Handling Strategy

**Backend**:

```typescript
// Global error middleware
app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: err.errors,
        },
      },
      400
    );
  }

  // Log unexpected errors
  console.error(err);

  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    500
  );
});
```

**Frontend**:

```typescript
// TanStack Query error handling
const { data, error, isError } = useQuery({
  queryKey: ["items"],
  queryFn: fetchItems,
  retry: 2,
  onError: (error) => {
    toast.error(error.message || "Failed to load items");
  },
});

// Form submission error handling
const mutation = useMutation({
  mutationFn: createItem,
  onError: (error) => {
    if (error.code === "VALIDATION_ERROR") {
      // Show field-specific errors
      setFieldErrors(error.details);
    } else {
      toast.error(error.message);
    }
  },
  onSuccess: () => {
    toast.success("Item created successfully");
    router.push("/dashboard");
  },
});
```

## Progressive Web App (PWA) Implementation

### Service Worker Strategy

```typescript
// Workbox configuration in next.config.js
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        urlPattern: /^\/api\/items/,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-items",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|png|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
});
```

### Manifest Configuration

```json
{
  "name": "FindHub - Lost & Found",
  "short_name": "FindHub",
  "description": "Campus lost and found management system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Offline Indicator Component

```typescript
// components/offline-indicator.tsx
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg">
      You are offline. Showing cached results.
    </div>
  );
}
```

## Testing Strategy

### Unit Testing

**Backend Services**:

- Test item CRUD operations with mock database
- Test validation schemas with valid/invalid inputs
- Test file upload service with mock files
- Test authentication middleware with mock sessions

**Frontend Hooks**:

- Test custom hooks with React Testing Library
- Test form validation logic
- Test search filter logic

### Integration Testing

**API Endpoints**:

- Test complete request/response cycles
- Test authentication flows
- Test file upload end-to-end
- Test error handling scenarios

**Frontend Features**:

- Test item creation flow
- Test search and filter functionality
- Test status update flow

### E2E Testing (Optional)

- Test complete user journeys (search → view → claim process)
- Test admin workflows (login → create → update → delete)
- Test PWA installation and offline functionality

### Testing Tools

- **Unit/Integration**: Bun's built-in test runner
- **Frontend**: React Testing Library + Vitest
- **E2E**: Playwright (optional)

## Supabase Storage Integration Details

### Backend Upload Service

```typescript
// apps/server/src/services/upload.service.ts
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function uploadItemImage(file: File): Promise<{ url: string; key: string }> {
  // Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB')
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const filename = `${uuidv4()}.${ext}`

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from('lost-items')
    .upload(filename, file, {
      contentType: file.type,
      upsert: false
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('lost-items')
    .getPublicUrl(filename)

  return {
    url: publicUrl,
    key: filename
  }
}

export async function deleteItemImage(key: string): Promise<void> {
  const { error } = await supabase.storage
    .from('lost-items')
    .remove([key])

  if (error) throw error
}
```

### Frontend Upload Component

```typescript
// Frontend can optionally upload directly to Supabase
// or proxy through backend for additional validation
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Direct upload (if using RLS policies)
async function uploadDirect(file: File) {
  const filename = `${crypto.randomUUID()}.${file.name.split('.').pop()}`
  
  const { data, error } = await supabase.storage
    .from('lost-items')
    .upload(filename, file)
    
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('lost-items')
    .getPublicUrl(filename)
    
  return { url: publicUrl, key: filename }
}
```

### Supabase Storage Bucket Setup

1. **Create Bucket**: In Supabase dashboard, create bucket named "lost-items"
2. **Set Public Access**: Enable public access for read operations
3. **Configure RLS Policies** (optional):
   - Allow public SELECT (read)
   - Allow authenticated INSERT (upload) - if using direct upload
   - Allow authenticated DELETE (cleanup) - if using direct upload
4. **Set File Size Limit**: Configure 5MB max file size in bucket settings
5. **Configure CORS**: Add application domain to allowed origins

### Error Handling for Supabase Operations

```typescript
// Handle Supabase-specific errors
try {
  await uploadItemImage(file)
} catch (error) {
  if (error.message.includes('Bucket not found')) {
    // Handle bucket configuration error
  } else if (error.message.includes('exceeded')) {
    // Handle quota/size limit error
  } else {
    // Generic error
  }
}
```

## Security Considerations

### Authentication & Authorization

1. **Session Management**: Better Auth handles secure session cookies
2. **CSRF Protection**: SameSite cookies with secure flag
3. **Route Protection**: Middleware validates session on protected routes
4. **Role-Based Access**: Only authenticated users can access admin routes

### Input Validation

1. **Client-Side**: Zod schemas validate forms before submission
2. **Server-Side**: All inputs validated again on backend
3. **SQL Injection**: Drizzle ORM parameterizes queries
4. **XSS Prevention**: React escapes output by default

### File Upload Security

1. **File Type Validation**: Whitelist JPEG, PNG, WebP only
2. **File Size Limits**: Max 5MB enforced on client and server
3. **Filename Sanitization**: Generate UUID-based filenames, ignore user input
4. **Storage Isolation**: Files stored in Supabase Storage with proper access controls
5. **Bucket Policies**: Configure Supabase RLS policies to restrict upload/delete operations
6. **Public URL Security**: Use Supabase public URLs for read-only access, signed URLs for temporary access if needed

### Rate Limiting (Future Enhancement)

- Implement rate limiting on API endpoints
- Protect login endpoint from brute force attacks
- Limit file upload frequency per user

## Performance Optimization

### Frontend Optimizations

1. **Image Optimization**: Next.js Image component with automatic optimization
2. **Code Splitting**: Automatic route-based splitting with App Router
3. **Lazy Loading**: Dynamic imports for heavy components
4. **Caching**: TanStack Query caches server data
5. **Debouncing**: Search input debounced to reduce API calls

### Backend Optimizations

1. **Database Indexing**: Index on frequently queried columns (status, category, dateFound)
2. **Pagination**: Limit query results to prevent large data transfers
3. **Connection Pooling**: PostgreSQL connection pool for efficient DB access
4. **Static File Serving**: Hono serves images directly without processing

### Database Indexes

```typescript
// Add indexes for common queries
export const lostItem = pgTable(
  "lost_item",
  {
    // ... columns
  },
  (table) => ({
    statusIdx: index("status_idx").on(table.status),
    categoryIdx: index("category_idx").on(table.category),
    dateFoundIdx: index("date_found_idx").on(table.dateFound),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);
```

## Responsive Design Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet
  lg: "1024px", // Desktop
  xl: "1280px", // Large desktop
  "2xl": "1536px", // Extra large
};

// Design approach
// Mobile-first: Base styles for mobile
// md: Tablet adjustments
// lg: Desktop layout
```

### Layout Patterns

**Mobile (< 768px)**:

- Single column layout
- Stacked navigation
- Full-width cards
- Bottom sheet modals

**Tablet (768px - 1024px)**:

- Two column grid for items
- Side navigation drawer
- Modal dialogs

**Desktop (> 1024px)**:

- Three column grid for items
- Persistent sidebar navigation
- Larger modal dialogs
- Data table for admin dashboard

## Deployment Considerations

### Environment Variables

```bash
# apps/server/.env
DATABASE_URL=postgresql://user:password@localhost:5432/findhub
CORS_ORIGIN=http://localhost:3001
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Build Process

```bash
# Build all packages
bun run build

# Run migrations
bun run db:migrate

# Start production servers
cd apps/server && bun run start
cd apps/web && bun run start
```

### Production Checklist

- [ ] Set secure environment variables (including Supabase credentials)
- [ ] Enable HTTPS for both frontend and backend
- [ ] Configure CORS for production domain (including Supabase Storage)
- [ ] Set up database backups
- [ ] Configure Supabase Storage bucket with proper RLS policies
- [ ] Set file upload limits in Supabase bucket settings
- [ ] Enable error logging and monitoring
- [ ] Test PWA installation on mobile devices
- [ ] Verify offline functionality
- [ ] Run security audit
- [ ] Performance testing under load
- [ ] Verify Supabase Storage CDN performance

## Future Enhancements

1. **Email Notifications**: Notify item owners when status changes
2. **Advanced Search**: Full-text search with PostgreSQL
3. **Image Recognition**: AI-powered item matching
4. **Multi-Language**: i18n support for international campuses
5. **Analytics Dashboard**: Track claim rates and popular categories
6. **QR Code Generation**: Generate QR codes for physical item tags
7. **Mobile Apps**: Native iOS/Android apps
8. **Bulk Import**: CSV import for existing lost items
