# Database Schema Changes - Security Questions and Privacy Controls

## Overview

This document summarizes the database schema changes implemented for the security questions and privacy controls feature.

## Changes Made

### 1. New Enum Type: question_type

```sql
CREATE TYPE "public"."question_type" AS ENUM('multiple_choice', 'free_text');
```

This enum defines the two types of security questions that can be created.

### 2. New Table: security_questions

A new table to store security questions with encrypted answers:

```typescript
export const securityQuestions = pgTable(
  "security_questions",
  {
    id: serial("id").primaryKey(),
    itemId: integer("item_id").notNull().references(() => lostItems.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    questionType: questionTypeEnum("question_type").notNull(),
    options: text("options").array(), // For multiple choice questions
    encryptedAnswer: text("encrypted_answer").notNull(),
    iv: text("iv").notNull(), // Initialization vector for AES-GCM
    authTag: text("auth_tag").notNull(), // Authentication tag for AES-GCM
    displayOrder: integer("display_order").notNull().default(0),
    createdById: text("created_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("security_questions_item_id_idx").on(table.itemId),
    index("security_questions_display_order_idx").on(table.itemId, table.displayOrder),
  ],
);
```

**Key Features:**
- Cascade delete when parent item is deleted
- Encrypted answers using AES-256-GCM
- Support for both multiple choice and free text questions
- Indexed for efficient querying

### 3. Modified Table: lost_items

Added two new boolean columns for privacy controls:

```typescript
hideLocation: boolean("hide_location").notNull().default(false),
hideDateFound: boolean("hide_date_found").notNull().default(false),
```

These columns control whether location and date found information is visible to public users.

### 4. New TypeScript Types

Added several new types to support the feature:

```typescript
// Enum types
export type QuestionType = (typeof questionTypeEnum.enumValues)[number];

// Database types
export type SecurityQuestion = typeof securityQuestions.$inferSelect;

// Extended types
export interface SecurityQuestionWithDecryptedAnswer
  extends Omit<SecurityQuestion, "encryptedAnswer" | "iv" | "authTag"> {
  answer: string; // Decrypted answer (admin view only)
}

export interface SecurityQuestionInput {
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // For multiple choice
  answer: string; // Plain text answer to be encrypted
  displayOrder?: number;
}

export type LostItemWithSecurity = LostItemWithImages & {
  securityQuestions: SecurityQuestion[];
};

export type PublicLostItem = Omit<LostItemWithImages, "securityQuestions"> & {
  location: string | null; // null if hidden
  dateFound: Date | null; // null if hidden
};
```

### 5. New Relations

Added Drizzle ORM relations for the security questions:

```typescript
export const lostItemsRelations = relations(lostItems, ({ many }) => ({
  images: many(itemImages),
  securityQuestions: many(securityQuestions), // NEW
}));

export const securityQuestionsRelations = relations(
  securityQuestions,
  ({ one }) => ({
    item: one(lostItems, {
      fields: [securityQuestions.itemId],
      references: [lostItems.id],
    }),
  }),
);
```

## Migration Files

- **Migration**: `0004_add_security_questions_and_privacy.sql`
- **Location**: `packages/db/src/migrations/`
- **Journal**: Updated in `packages/db/src/migrations/meta/_journal.json`

## Supporting Files

1. **Encryption Key Generator**: `scripts/generate-encryption-key.ts`
   - Generates a secure 32-byte encryption key
   - Usage: `bun run scripts/generate-encryption-key.ts`

2. **Environment Variables**: Updated `.env.example`
   - Added `ENCRYPTION_KEY` variable

3. **Migration Guide**: `packages/db/MIGRATION-GUIDE.md`
   - Detailed instructions for running the migration
   - Security considerations
   - Rollback procedures

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- ✅ 2.1: Security_Question_Table with encryption fields
- ✅ 2.2: Encrypted Security_Answer data
- ✅ 2.3: Foreign key relationship with cascade delete
- ✅ 2.4: Cascade delete for Security_Question records
- ✅ 2.5: Prevention of direct access to Security_Answer data
- ✅ 2.6: Indexed Security_Question_Table
- ✅ 3.2: Privacy control settings stored as boolean fields
- ✅ 3.3: hide_location flag
- ✅ 3.4: hide_date_found flag
- ✅ 9.1: Database migration for Security_Question_Table
- ✅ 9.2: Database migration for privacy control fields
- ✅ 9.3: Foreign key constraints with cascade delete
- ✅ 9.4: Indexes for query performance
- ✅ 9.5: Reversible migration
- ✅ 9.6: Drizzle ORM schema definitions

## Next Steps

After this schema is deployed, the following tasks can be implemented:

1. Encryption service implementation (Task 2)
2. Backend security questions service (Task 3)
3. Enhanced items service with privacy controls (Task 4)
4. Validation schemas for security questions (Task 5)
5. API endpoints (Tasks 6-7)
6. Frontend components (Tasks 8-15)
