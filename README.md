# findhub

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Hono, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting
- **PWA** - Progressive Web App support
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```
## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:
```bash
bun run db:push
```


Then, run the development servers:

```bash
bun run dev
```

This starts all applications:
- **Public Web App**: [http://localhost:3001](http://localhost:3001)
- **Admin App**: [http://localhost:3002](http://localhost:3002)
- **API Server**: [http://localhost:3000](http://localhost:3000)

You can also run applications individually:

```bash
bun run dev:web      # Public web app only
bun run dev:admin    # Admin app only
bun run dev:server   # API server only
```







## Project Structure

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
```

### Application Architecture

**Public Web App (`apps/web`)**
- User-facing interface for searching and viewing lost items
- Port: 3001
- Features: Search, filters, item details, responsive UI

**Admin App (`apps/admin`)**
- Administrative interface for managing items and categories
- Port: 3002
- Features: Dashboard, item management, category management, authentication
- Requires admin authentication for all routes

**Server API (`apps/server`)**
- Backend API serving both web and admin applications
- Port: 3000
- Features: Item CRUD, category management, file uploads, authentication

## Available Scripts

### Development
- `bun run dev`: Start all applications in development mode
- `bun run dev:web`: Start only the public web application (port 3001)
- `bun run dev:admin`: Start only the admin application (port 3002)
- `bun run dev:server`: Start only the API server (port 3000)

### Build & Deploy
- `bun run build`: Build all applications
- `bun run check-types`: Check TypeScript types across all apps
- `bun run check`: Run Biome formatting and linting

### Database
- `bun run db:push`: Push schema changes to database
- `bun run db:studio`: Open database studio UI
- `bun run db:generate`: Generate database migrations
- `bun run db:migrate`: Run database migrations

### Database Seeds
- `bun run seed:check`: Check which seeds have been run
- `bun run seed:categories`: Seed item categories
- `bun run seed:all`: Run all seeds
- `bun run seed <name>`: Run specific seed by name

### Testing
- `bun run test:e2e`: Run end-to-end tests
- `bun run test:e2e:ui`: Run tests with Playwright UI
- `bun run test:e2e:headed`: Run tests in headed mode

### PWA
- `cd apps/web && bun run generate-pwa-assets`: Generate PWA assets


## Admin Application Setup

The admin application is a separate Next.js app for managing lost items and categories.

### First-Time Setup

1. **Create an admin user** (if not already created):
   - Navigate to [http://localhost:3002/signup](http://localhost:3002/signup)
   - Create an account with admin credentials
   - Note: In production, implement proper admin role assignment

2. **Login to admin panel**:
   - Navigate to [http://localhost:3002/login](http://localhost:3002/login)
   - Use your admin credentials

3. **Access admin features**:
   - Dashboard: Overview of system statistics
   - Items: Manage lost items (create, edit, update status)
   - Categories: Manage item categories

### Admin Features

- **Dashboard**: View statistics and recent items
- **Item Management**: Create, edit, and update item status (unclaimed → claimed/disposed)
- **Category Management**: Add, edit, and delete item categories
- **Authentication**: Secure login with Better-Auth

## Category API

The system uses a dynamic category management system backed by the database.

### API Endpoints

**Public Endpoints:**
```
GET /api/categories          # List all categories
GET /api/categories/:id      # Get single category
```

**Protected Endpoints (Admin only):**
```
POST   /api/categories       # Create new category
PATCH  /api/categories/:id   # Update category
DELETE /api/categories/:id   # Delete category
```

### Category Schema

```typescript
{
  id: number;
  name: string;           // Max 100 characters
  description?: string;   // Optional description
}
```

### Usage in Frontend

Categories are fetched dynamically using React Query:

```typescript
import { useCategories } from '@/features/categories/hooks/use-categories';

function MyComponent() {
  const { data: categories, isLoading } = useCategories();
  // categories is cached for 5 minutes
}
```

### Initial Categories

The system seeds the following default categories:
- Electronics
- Clothing
- Accessories
- Books
- Keys
- Cards
- Bags
- Other

## Deployment Guide

### Environment Variables

Both web and admin applications require the following environment variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.findhub.example.com

# Authentication (Better-Auth)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://findhub.example.com  # or admin.findhub.example.com

# Database (Server only)
DATABASE_URL=postgresql://user:password@host:port/database
```

### Production URL Structure

**Recommended setup:**
- Public Web: `https://findhub.example.com`
- Admin Panel: `https://admin.findhub.example.com`
- API Server: `https://api.findhub.example.com`

### Deployment Steps

#### 1. Build Applications

```bash
# Build all applications
bun run build

# Or build individually
cd apps/web && bun run build
cd apps/admin && bun run build
cd apps/server && bun run build
```

#### 2. Deploy Server (API)

```bash
cd apps/server
bun run start
```

Ensure the server is accessible at your API URL.

#### 3. Deploy Web Application

```bash
cd apps/web
bun run start
```

Configure your hosting provider (Vercel, Netlify, etc.) to:
- Set `NEXT_PUBLIC_API_URL` to your API server URL
- Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
- Deploy from `apps/web` directory

#### 4. Deploy Admin Application

```bash
cd apps/admin
bun run start
```

Configure your hosting provider to:
- Set `NEXT_PUBLIC_API_URL` to your API server URL
- Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
- Deploy from `apps/admin` directory
- Use a separate subdomain (e.g., `admin.findhub.example.com`)

### Independent Deployment

The admin and web applications can be deployed independently:

1. **Update admin app** without affecting public users
2. **Scale separately** based on usage patterns
3. **Apply different security rules** (e.g., IP restrictions for admin)

### Database Migrations

Before deploying, ensure database migrations are applied:

```bash
bun run db:migrate
```

### Health Checks

Verify deployments:
- Web: `https://findhub.example.com`
- Admin: `https://admin.findhub.example.com/login`
- API: `https://api.findhub.example.com/health` (if implemented)

## Security Considerations

### Admin Application

- **Authentication Required**: All admin routes require authentication
- **Separate Deployment**: Admin app should be deployed on a separate subdomain
- **Additional Security**: Consider IP whitelisting or VPN access for admin panel
- **Audit Logging**: Monitor admin actions in production

### API Security

- **CORS Configuration**: Whitelist only your web and admin domains
- **Rate Limiting**: Implement rate limiting on sensitive endpoints
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: Using Drizzle ORM with parameterized queries

## Troubleshooting

### Admin app not starting

- Verify port 3002 is available
- Check that all dependencies are installed: `bun install`
- Ensure shared packages are built: `bun run build --filter=@findhub/shared`

### Categories not loading

- Verify API server is running on port 3000
- Check database connection in `apps/server/.env`
- Ensure `item_category` table exists: `bun run db:push`

### Authentication issues

- Verify `BETTER_AUTH_SECRET` is set in environment variables
- Check `BETTER_AUTH_URL` matches your deployment URL
- Clear browser cookies and try again

### Build errors

- Run `bun run check-types` to identify TypeScript errors
- Run `bun run check` to fix formatting issues
- Ensure all workspace dependencies are up to date
