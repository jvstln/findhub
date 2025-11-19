# Component Tests for Security and Privacy UI Elements

## Overview

This document describes the component tests implemented for the security questions and privacy controls features. The tests verify the functionality of UI components in a real browser environment using Playwright.

## Test File

**Location:** `e2e/component-tests.spec.ts`

**Test Project:** `components` (configured in `playwright.config.ts`)

## Test Coverage

### 1. SecurityQuestionsBuilder Component Tests

Tests the security questions builder component functionality including:

#### Test Cases:
- **Display add question button and empty state**: Verifies the initial state shows the "Add Question" button and empty state message
- **Add a new security question**: Tests adding a question and verifying the question card appears with all required fields
- **Remove a security question**: Tests removing a question and verifying it returns to empty state
- **Add multiple security questions**: Tests adding multiple questions and verifying the counter updates correctly
- **Disable add button at maximum questions**: Tests that the add button is disabled when 10 questions (maximum) are added
- **Switch between free text and multiple choice question types**: Tests toggling between question types and verifying the appropriate fields appear
- **Add and remove options in multiple choice questions**: Tests adding/removing options in multiple choice questions
- **Display drag handle for reordering**: Verifies drag handles are present for reordering questions

**Requirements Covered:** 1.9 (Add/remove functionality)

### 2. PrivacyControls Component Tests

Tests the privacy controls toggle functionality:

#### Test Cases:
- **Display privacy controls section**: Verifies the privacy controls section is visible with proper headings
- **Display both toggle switches**: Tests that both "Hide Location" and "Hide Date Found" toggles are present
- **Toggle hide location switch**: Tests toggling the location privacy switch on and off
- **Toggle hide date found switch**: Tests toggling the date privacy switch on and off
- **Show public view preview when location is hidden**: Verifies the preview section appears when location is hidden
- **Show public view preview when date is hidden**: Verifies the preview section appears when date is hidden
- **Show preview for both fields when both are hidden**: Tests that both preview items appear when both toggles are enabled
- **Hide preview when both toggles are disabled**: Verifies the preview disappears when toggles are disabled

**Requirements Covered:** 3.5 (Toggle behavior)

### 3. ObscuredFieldIndicator Component Tests

Tests the obscured field indicator rendering on public pages:

#### Test Cases:
- **Display obscured field indicator for hidden location**: Creates an item with hidden location and verifies the indicator appears on the public view
- **Display obscured field indicator for hidden date**: Creates an item with hidden date and verifies the indicator appears on the public view
- **Not display obscured indicators when fields are visible**: Verifies that indicators don't appear when privacy controls are disabled

**Requirements Covered:** 4.3 (Obscured field rendering)

### 4. Form Validation Feedback Tests

Tests form validation for security questions:

#### Test Cases:
- **Show validation error for empty question text**: Tests that the form doesn't submit with empty question text
- **Show validation error for multiple choice without correct answer**: Tests that multiple choice questions require a correct answer selection
- **Successfully submit with valid security question**: Tests successful form submission with a valid security question
- **Validate minimum question text length**: Tests that question text must be at least 5 characters

**Requirements Covered:** 7.5 (Form validation feedback)

## Running the Tests

### Run all component tests:
```bash
bun run test:e2e component-tests.spec.ts --project=components
```

### Run specific test suite:
```bash
bun run test:e2e component-tests.spec.ts --project=components --grep "SecurityQuestionsBuilder"
```

### Run with UI mode:
```bash
bun run test:e2e:ui component-tests.spec.ts --project=components
```

### Run in headed mode (see browser):
```bash
bun run test:e2e:headed component-tests.spec.ts --project=components
```

## Test Prerequisites

1. **Database**: Tests require a database with the admin user seeded:
   - Email: `admin@findhub.com`
   - Password: `password123`

2. **Servers Running**: The Playwright config automatically starts:
   - Backend server (port 3000)
   - Web app (port 3001)
   - Admin app (port 3002)

3. **Browsers**: Chromium browser must be installed:
   ```bash
   npx playwright install chromium
   ```

## Test Architecture

### Integration-Style Component Tests

These tests are integration-style tests that:
- Run in a real browser environment
- Test components in the context of the full application
- Verify end-to-end user interactions
- Test actual form submissions and API calls

This approach was chosen because:
1. The project uses Playwright for E2E tests (no unit testing framework configured)
2. Component behavior is best tested in the context of the full application
3. Integration tests provide more confidence in real-world functionality
4. Tests verify both component behavior and integration with backend APIs

### Test Structure

Each test suite follows this pattern:
1. **beforeEach**: Login as admin and navigate to the appropriate page
2. **Test cases**: Interact with components and verify expected behavior
3. **Assertions**: Use Playwright's expect API for robust assertions

## Maintenance

### Adding New Tests

To add new component tests:
1. Add test cases to the appropriate `test.describe` block
2. Follow the existing pattern for login and navigation
3. Use semantic selectors (roles, labels) for better maintainability
4. Add clear test descriptions that explain what is being tested

### Updating Tests

When components change:
1. Update selectors if UI structure changes
2. Update assertions if expected behavior changes
3. Ensure tests still cover the requirements listed in tasks.md

## Related Files

- **Components Under Test:**
  - `apps/admin/src/features/items/components/security-questions-builder.tsx`
  - `apps/admin/src/features/items/components/privacy-controls.tsx`
  - `apps/web/src/features/items/components/obscured-field-indicator.tsx`

- **Configuration:**
  - `playwright.config.ts` - Test configuration with "components" project

- **Requirements:**
  - `.kiro/specs/item-security-and-privacy/requirements.md`
  - `.kiro/specs/item-security-and-privacy/tasks.md`
