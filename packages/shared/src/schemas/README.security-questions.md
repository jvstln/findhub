# Security Questions Validation Schemas

This document describes the validation schemas implemented for the security questions and privacy controls feature.

## Overview

The security questions validation schemas provide comprehensive validation for:
- Multiple choice security questions
- Free text security questions
- Privacy controls for hiding location and date information
- Extended item creation/update schemas with security features

## Schemas

### Question Type Schema

```typescript
questionTypeSchema = z.enum(["multiple_choice", "free_text"])
```

Validates the type of security question.

### Multiple Choice Question Schema

```typescript
multipleChoiceQuestionSchema = z.object({
  questionText: z.string().min(5).max(500),
  questionType: z.literal("multiple_choice"),
  options: z.array(z.string().min(1).max(200)).min(2).max(6),
  answer: z.string().min(1),
  displayOrder: z.number().int().min(0).optional(),
})
```

**Validation Rules:**
- Question text: 5-500 characters
- Must have 2-6 options
- Each option: 1-200 characters
- Answer must be non-empty (should match one of the options)
- Display order is optional, must be non-negative integer

### Free Text Question Schema

```typescript
freeTextQuestionSchema = z.object({
  questionText: z.string().min(5).max(500),
  questionType: z.literal("free_text"),
  options: z.undefined(),
  answer: z.string().min(1).max(500),
  displayOrder: z.number().int().min(0).optional(),
})
```

**Validation Rules:**
- Question text: 5-500 characters
- Options must be undefined
- Answer: 1-500 characters
- Display order is optional, must be non-negative integer

### Security Question Input Schema

```typescript
securityQuestionInputSchema = z.discriminatedUnion("questionType", [
  multipleChoiceQuestionSchema,
  freeTextQuestionSchema,
])
```

Uses discriminated union based on `questionType` to validate either multiple choice or free text questions.

### Security Questions Array Schema

```typescript
securityQuestionsArraySchema = z.array(securityQuestionInputSchema).max(10)
```

**Validation Rules:**
- Maximum 10 security questions per item
- Each question must be valid according to its type

### Privacy Controls Schema

```typescript
privacyControlsSchema = z.object({
  hideLocation: z.boolean().default(false),
  hideDateFound: z.boolean().default(false),
})
```

**Validation Rules:**
- Both fields are booleans
- Default to false if not provided

### Extended Item Schemas

```typescript
createItemWithSecuritySchema = createItemSchema
  .extend({ securityQuestions: securityQuestionsArraySchema.optional() })
  .merge(privacyControlsSchema)

updateItemWithSecuritySchema = createItemWithSecuritySchema.partial()
```

Extends the base item schemas with security questions and privacy controls.

## Usage Examples

### Creating an Item with Security Questions

```typescript
import { createItemWithSecuritySchema } from "@findhub/shared/schemas";

const itemData = {
  name: "Blue Backpack",
  description: "Blue backpack with laptop compartment",
  category: "bags",
  location: "Library 3rd Floor",
  dateFound: new Date(),
  hideLocation: false,
  hideDateFound: true,
  securityQuestions: [
    {
      questionText: "What brand is the laptop inside?",
      questionType: "free_text",
      answer: "Dell",
    },
    {
      questionText: "What color is the keychain attached?",
      questionType: "multiple_choice",
      options: ["Red", "Blue", "Green", "Black"],
      answer: "Red",
    },
  ],
};

const validated = createItemWithSecuritySchema.parse(itemData);
```

### Validating Security Questions Only

```typescript
import { securityQuestionsArraySchema } from "@findhub/shared/schemas/security-questions.schema";

const questions = [
  {
    questionText: "What's inside the bag?",
    questionType: "free_text",
    answer: "Laptop and books",
  },
];

const validated = securityQuestionsArraySchema.parse(questions);
```

### Validating Privacy Controls

```typescript
import { privacyControlsSchema } from "@findhub/shared/schemas/security-questions.schema";

const privacy = {
  hideLocation: true,
  hideDateFound: false,
};

const validated = privacyControlsSchema.parse(privacy);
```

## Type Exports

All schemas export corresponding TypeScript types:

```typescript
type QuestionTypeSchema = z.infer<typeof questionTypeSchema>;
type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
type FreeTextQuestion = z.infer<typeof freeTextQuestionSchema>;
type SecurityQuestionInput = z.infer<typeof securityQuestionInputSchema>;
type SecurityQuestionsArray = z.infer<typeof securityQuestionsArraySchema>;
type PrivacyControls = z.infer<typeof privacyControlsSchema>;
```

## Testing

Comprehensive tests are available in:
- `security-questions.schema.test.ts` - Tests for all security question schemas
- `item-with-security.test.ts` - Tests for extended item schemas

Run tests with:
```bash
bun test packages/shared/src/schemas/security-questions.schema.test.ts
bun test packages/shared/src/schemas/item-with-security.test.ts
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **1.3**: Multiple choice question validation with options
- **1.4**: Free text question validation
- **1.5**: Question type validation
- **7.1**: Question text validation (5-500 characters)
- **7.2**: Multiple choice options validation (2-6 options)
- **7.3**: Multiple choice answer validation
- **7.4**: Free text answer validation (1-500 characters)
- **7.5**: Inline validation error support
- **7.6**: Optional security questions support
- **7.7**: Visual distinction between question types (via discriminated union)
