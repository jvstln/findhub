# Implementation Plan

- [x] 1. Database schema and migration setup





  - Create security_questions table with encryption fields
  - Add privacy control columns to lost_items table
  - Create question_type enum
  - Add appropriate indexes for performance
  - Generate and test migration scripts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.2, 3.3, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 2. Encryption service implementation





  - Implement AES-256-GCM encryption service with encrypt and decrypt methods
  - Add encryption key generation script
  - Create environment variable configuration for encryption key
  - Handle encryption errors gracefully
  - _Requirements: 2.1, 8.2, 8.3, 8.4_

- [x] 3. Backend security questions service





  - Implement SecurityQuestionsService with CRUD operations
  - Create method to encrypt and store security questions
  - Create method to retrieve and decrypt security questions for admin users
  - Implement update and delete operations for security questions
  - _Requirements: 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 4. Enhanced items service with privacy controls





  - Extend ItemsService to handle security questions during item creation
  - Implement privacy filtering for public item retrieval
  - Add methods to get items with security questions for admin users
  - Update item update logic to handle security questions and privacy controls
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5. Validation schemas for security questions
  - Create Zod schemas for multiple choice questions
  - Create Zod schemas for free text questions
  - Implement discriminated union for question type validation
  - Add privacy controls validation schema
  - Extend item creation/update schemas with security fields
  - _Requirements: 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 6. Admin API endpoints for security questions
  - Create POST /api/admin/items endpoint with security questions support
  - Create GET /api/admin/items/:id endpoint returning decrypted security questions
  - Create PATCH /api/admin/items/:id endpoint for updating security questions
  - Create GET /api/admin/items/:id/security-questions endpoint
  - Create PUT /api/admin/items/:id/security-questions endpoint
  - Implement authentication middleware for all security question endpoints
  - _Requirements: 1.1, 1.2, 1.7, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 7. Public API privacy filtering
  - Update GET /api/items/:id to apply privacy filtering
  - Ensure security questions are never included in public responses
  - Update GET /api/items search to handle privacy controls in filters
  - Implement logic to exclude items with hidden fields from filtered results
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8. Security questions builder component
  - Create SecurityQuestionsBuilder component with add/remove functionality
  - Implement MultipleChoiceQuestion sub-component with options management
  - Implement FreeTextQuestion sub-component with answer input
  - Add drag-and-drop reordering for questions
  - Implement validation feedback for question inputs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.9, 7.1, 7.2, 7.3, 7.4, 7.5, 7.7_

- [ ] 9. Privacy controls component
  - Create PrivacyControls component with toggle switches
  - Add clear labels and descriptions for each privacy option
  - Implement visual preview of public view
  - Integrate with item form state management
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 10. Enhanced admin item form
  - Integrate SecurityQuestionsBuilder into item creation form
  - Integrate PrivacyControls into item creation form
  - Add visual indicators for hidden fields in edit mode
  - Update form submission to include security questions and privacy settings
  - Handle validation errors for security questions
  - _Requirements: 1.1, 1.2, 1.6, 1.7, 3.1, 3.6, 3.7, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.5, 7.6_

- [ ] 11. Obscured field indicator component
  - Create ObscuredFieldIndicator component with lock icon
  - Implement clear messaging for hidden information
  - Add distinct visual styling for obscured fields
  - Make component reusable for location and date fields
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 12. Enhanced public item detail page
  - Update item detail page to conditionally render location and date
  - Integrate ObscuredFieldIndicator for hidden fields
  - Ensure security questions are never displayed
  - Test privacy filtering with various combinations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 13. Security questions display component
  - Create SecurityQuestionsDisplay component for admin view
  - Implement read-only display of questions and decrypted answers
  - Add visual distinction between question types
  - Make component expandable/collapsible
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 14. Privacy status indicators for admin dashboard
  - Create PrivacyStatusBadge component with eye-slash icon
  - Add tooltip showing which fields are hidden
  - Integrate badges into admin dashboard item table/cards
  - Ensure indicators are visible but not intrusive
  - _Requirements: 5.3, 5.4, 5.5_

- [ ] 15. Admin dashboard integration
  - Update admin item table to display privacy status indicators
  - Update admin item detail view to show security questions
  - Ensure complete information is always visible to admins
  - Add visual indicators for fields hidden from public
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 16. Unit tests for encryption service
  - Write tests for encrypt and decrypt methods
  - Test unique IV generation
  - Test authentication tag validation
  - Test error handling for invalid inputs
  - _Requirements: 2.1, 8.2, 8.3_

- [ ]* 17. Unit tests for security questions service
  - Write tests for creating questions with encryption
  - Test retrieving questions with decryption
  - Test updating and deleting questions
  - Test cascade deletion when item is deleted
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 18. Unit tests for validation schemas
  - Test multiple choice question validation
  - Test free text question validation
  - Test invalid question structures
  - Test privacy controls validation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ]* 19. Integration tests for API endpoints
  - Test creating items with security questions
  - Test retrieving items with privacy filtering
  - Test updating security questions
  - Test access control for security question endpoints
  - Test that public API never exposes security data
  - _Requirements: 4.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ]* 20. Component tests for UI elements
  - Test SecurityQuestionsBuilder add/remove functionality
  - Test PrivacyControls toggle behavior
  - Test ObscuredFieldIndicator rendering
  - Test form validation feedback
  - _Requirements: 1.9, 3.5, 4.3, 7.5_
