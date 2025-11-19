# Security and Privacy API Integration Tests

## Overview

This test suite provides comprehensive integration testing for the security questions and privacy controls API endpoints. The tests verify that:

1. **Security questions** are properly encrypted, stored, and retrieved
2. **Privacy controls** correctly hide location and date information from public users
3. **Access control** prevents unauthorized access to sensitive data
4. **Public API** never exposes security questions or answers

## Test Coverage

### Admin API - Creating Items with Security Questions
- ✅ Create item with multiple choice security question
- ✅ Create item with free text security question
- ✅ Create item with multiple security questions
- ✅ Create item without security questions (optional)
- ✅ Reject invalid security question format

### Admin API - Privacy Controls
- ✅ Create item with hidden location
- ✅ Create item with hidden date
- ✅ Create item with both location and date hidden

### Admin API - Retrieving Items
- ✅ Retrieve item with decrypted security questions
- ✅ Retrieve security questions via dedicated endpoint

### Admin API - Updating
- ✅ Update security questions for existing item
- ✅ Update privacy controls for existing item

### Public API - Privacy Filtering
- ✅ Return full data for items without privacy controls
- ✅ Hide location when hideLocation is true
- ✅ Hide date when hideDateFound is true
- ✅ Hide both location and date when both flags are true
- ✅ Never expose security questions in public API
- ✅ Include items with hidden fields in search results

### Access Control
- ✅ Reject unauthenticated access to admin create endpoint
- ✅ Reject unauthenticated access to admin get endpoint
- ✅ Reject unauthenticated access to security questions endpoint
- ✅ Reject unauthenticated access to update security questions
- ✅ Reject unauthenticated access to admin update endpoint

## Requirements Coverage

These tests verify the following requirements:

- **Requirement 4.6**: Public view with hidden information
- **Requirement 8.1**: API security and access control - restricted endpoints
- **Requirement 8.2**: API security - unauthorized access returns 401
- **Requirement 8.3**: API security - public API excludes security questions
- **Requirement 8.4**: API security - admin API includes decrypted answers
- **Requirement 8.5**: API security - validate authentication tokens
- **Requirement 8.6**: API security - log access attempts

## Running the Tests

### Prerequisites

1. Ensure all servers are running:
   ```bash
   bun run dev
   ```

2. Ensure test database is seeded with admin user:
   - Email: admin@findhub.com
   - Password: password123

### Run Tests

```bash
# Run all E2E tests including API tests
bun run test:e2e

# Run only security/privacy API tests
bun run test:e2e security-privacy-api.spec.ts

# Run with UI
bun run test:e2e:ui security-privacy-api.spec.ts
```

## Test Structure

The tests use Playwright's `request` fixture to make direct HTTP requests to the API endpoints, simulating real client behavior. This approach:

- Tests the actual API endpoints without mocking
- Verifies authentication and authorization
- Validates request/response formats
- Ensures data persistence across requests

## Authentication

Tests authenticate using Better Auth's email/password endpoint:
```typescript
POST /api/auth/sign-in/email
{
  "email": "admin@findhub.com",
  "password": "password123"
}
```

The session cookie is then used for subsequent authenticated requests.

## Notes

- Tests create real data in the database during execution
- Each test suite cleans up after itself where possible
- Tests are designed to be idempotent and can run multiple times
- Some tests depend on data created in `beforeAll` hooks
