---
inclusion: always
---

# Product Overview

**findhub** is a full-stack TypeScript application built with modern web technologies. It's a monorepo project that separates frontend (Next.js) and backend (Hono) concerns while sharing common packages for authentication, database access, and type-safe validation.

## Key Characteristics

- Full-stack TypeScript application with end-to-end type safety
- Progressive Web App (PWA) support for offline-first capabilities
- Authentication-enabled platform using Better-Auth
- PostgreSQL-backed data persistence with Drizzle ORM
- Monorepo architecture for code sharing and modularity
- Type inference from database schema (single source of truth)
- Framework-agnostic shared package for types and validation

## Core Features

- **Lost and Found System** - Report, search, and claim lost items
- **User Authentication** - Secure login and user management
- **Image Upload** - Upload and manage item photos
- **Advanced Search** - Filter by category, location, date, and keywords
- **Status Tracking** - Track item status (unclaimed, claimed, returned, archived)
