# Security Questions Service Tests

## Overview

Comprehensive unit tests for the `SecurityQuestionsService` class that validates all CRUD operations, encryption/decryption functionality, and cascade deletion behavior.

## Test Coverage

### Test Requirements Covered

The tests validate all requirements specified in the spec:

- **Requirement 2.1**: Encryption of security answers before storage
- **Requirement 2.2**: Proper database table structure and relationships
- **Requirement 2.3**: Foreign key relationships with lost items
- **Requirement 2.4**: Cascade deletion when items are deleted
- **Requirement 6.1-6.6**: All security question CRUD operations

### Test Suites

#### 1. createQuestions
- ✓ Creates security questions with encryption
- ✓ Returns empty array when no questions provided
- ✓ Uses index as displayOrder when not provided
- ✓ Stores null options for free text questions

#### 2. getQuestionsWithAnswers
- ✓ Retrieves questions with decrypted answers
- ✓ Returns questions in display order
- ✓ Returns empty array when no questions exist
- ✓ Decrypts multiple choice answers correctly

#### 3. getQuestions
- ✓ Retrieves questions without decrypting answers (encrypted data only)

#### 4. updateQuestions
- ✓ Deletes existing questions and creates new ones
- ✓ Deletes all questions when empty array provided

#### 5. deleteQuestions
- ✓ Deletes all security questions for an item
- ✓ Does not throw error when deleting from item with no questions

#### 6. deleteQuestion
- ✓ Deletes a specific security question by ID
- ✓ Returns false when deleting non-existent question

#### 7. hasSecurityQuestions
- ✓ Returns true when item has security questions
- ✓ Returns false when item has no security questions

#### 8. cascade deletion
- ✓ Deletes security questions when item is deleted (tests database cascade)

## Running the Tests

### Prerequisites

1. **Database Connection**: Tests require a PostgreSQL database connection
2. **Environment Variables**: Ensure `.env` file is configured with:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/findhub
   ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
   ```

### Run Tests

```bash
# Run all service tests
bun test apps/server/src/services/

# Run only security questions service tests
bun test apps/server/src/services/security-questions.service.test.ts

# Run with verbose output
bun test --verbose apps/server/src/services/security-questions.service.test.ts
```

## Test Structure

### Setup and Teardown

Each test follows this pattern:

1. **beforeEach**: Creates a test user and test item in the database
2. **Test execution**: Performs the specific test operation
3. **afterEach**: Cleans up test data (deletes questions, items, and users)

This ensures test isolation and prevents data pollution between tests.

### Test Data

Tests use realistic data:
- Free text questions (e.g., "What brand is the laptop?")
- Multiple choice questions with options
- Various display orders
- Encrypted answers that are validated through decryption

## Key Testing Patterns

### 1. Encryption Validation
Tests verify that:
- Answers are encrypted before storage (encryptedAnswer, iv, authTag fields exist)
- Decryption returns the original answer
- Encrypted fields are not exposed in decrypted responses

### 2. Database Relationships
Tests validate:
- Foreign key relationships work correctly
- Cascade deletion removes security questions when items are deleted
- Questions are properly associated with items

### 3. Display Order
Tests ensure:
- Questions are returned in the correct display order
- Default ordering uses array index when not specified
- Custom display orders are respected

### 4. Error Handling
Tests verify:
- Operations on non-existent items/questions handle gracefully
- Empty arrays are handled correctly
- Database constraints are enforced

## Integration with Encryption Service

These tests depend on the `EncryptionService` which must be properly configured with a valid encryption key. The tests use a test encryption key set in the test file:

```typescript
process.env.ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
```

## Notes

- Tests use real database operations (not mocked) to validate actual functionality
- Each test is isolated with its own test data
- Tests validate both success and edge cases
- Cascade deletion is tested to ensure database constraints work correctly
