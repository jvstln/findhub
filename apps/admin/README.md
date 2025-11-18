# FindHub Admin Application

Admin interface for managing lost items, categories, and system data.

## Development

```bash
# From root directory
bun run dev:admin

# Or directly in this directory
bun run dev
```

The admin app runs on port 3002 by default.

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000)
- `BETTER_AUTH_SECRET` - Secret key for authentication
- `BETTER_AUTH_URL` - Admin app URL (default: http://localhost:3002)

## Features

- Dashboard with statistics
- Item management (CRUD operations)
- Category management
- Status workflow management
- Authentication and authorization
