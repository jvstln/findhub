# Product Overview

FindHub is a lost and found management system that helps users report, search, and track lost items. The platform provides both public and admin interfaces for managing lost items through their lifecycle from reported to claimed/disposed.

## Core Features

- Lost item reporting with file uploads
- Public search and filtering
- Admin workflow for item status management (unclaimed → claimed/disposed)
- Progressive Web App (PWA) support for offline functionality
- Authentication system for admin access

## Architecture

Full-stack TypeScript monorepo with separate frontend (Next.js) and backend (Hono) applications, sharing common packages for authentication, database access, and validation logic.
