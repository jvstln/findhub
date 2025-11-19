# SecurityQuestionsBuilder Component

A comprehensive React component for building and managing security questions in the admin item form.

## Features

- ✅ Add/remove security questions
- ✅ Support for multiple choice and free-text question types
- ✅ Drag-and-drop reordering
- ✅ Up to 10 questions per item
- ✅ Multiple choice: 2-6 options with visual answer selection
- ✅ Inline validation feedback
- ✅ Fully typed with TypeScript discriminated unions

## Usage

```tsx
import { SecurityQuestionsBuilder } from "@/features/items/components";
import type { SecurityQuestionInput } from "@findhub/shared/schemas";
import { useState } from "react";

function ItemForm() {
  const [questions, setQuestions] = useState<SecurityQuestionInput[]>([]);
  const [errors, setErrors] = useState<Record<number, any>>({});

  return (
    <SecurityQuestionsBuilder
      questions={questions}
      onChange={setQuestions}
      errors={errors}
    />
  );
}
```

## Props

### `questions: SecurityQuestionInput[]`
Array of security questions. Each question must follow the discriminated union type:

**Free Text Question:**
```typescript
{
  questionText: string;
  questionType: "free_text";
  options: undefined;
  answer: string;
  displayOrder?: number;
}
```

**Multiple Choice Question:**
```typescript
{
  questionText: string;
  questionType: "multiple_choice";
  options: string[];
  answer: string;
  displayOrder?: number;
}
```

### `onChange: (questions: SecurityQuestionInput[]) => void`
Callback function called whenever questions are added, removed, reordered, or modified.

### `errors?: Record<number, { questionText?: string; options?: string; answer?: string }>`
Optional validation errors object. Keys are question indices, values are error messages for specific fields.

Example:
```typescript
{
  0: {
    questionText: "Question must be at least 5 characters",
    answer: "Answer is required"
  },
  1: {
    options: "Multiple choice questions must have at least 2 options"
  }
}
```

## Component Structure

### Main Component: SecurityQuestionsBuilder
- Manages the list of questions
- Handles drag-and-drop reordering
- Provides "Add Question" button
- Shows empty state when no questions exist

### Sub-component: QuestionCard
- Displays individual question with drag handle
- Question type selector
- Question text input
- Renders appropriate question type component
- Remove button

### Sub-component: MultipleChoiceQuestion
- Manages 2-6 options
- Radio button selection for correct answer
- Add/remove option buttons
- Validation feedback

### Sub-component: FreeTextQuestion
- Simple text input for expected answer
- Shows encryption notice
- Validation feedback

## Drag-and-Drop

Questions can be reordered by dragging the grip icon (⋮⋮) on the left side of each question card. The display order is automatically updated when questions are reordered.

## Validation

The component displays validation errors passed via the `errors` prop. Validation should be performed by the parent form using the Zod schemas from `@findhub/shared/schemas`:

```typescript
import { securityQuestionsArraySchema } from "@findhub/shared/schemas";

try {
  securityQuestionsArraySchema.parse(questions);
} catch (error) {
  // Handle validation errors
}
```

## Limits

- Maximum 10 questions per item
- Multiple choice: 2-6 options per question
- Question text: 5-500 characters
- Option text: 1-200 characters
- Answer text: 1-500 characters

## Accessibility

- Drag handles have `aria-label` for screen readers
- Remove buttons have descriptive `sr-only` text
- Form fields use proper `aria-invalid` attributes
- All interactive elements are keyboard accessible

## Integration with Item Form

To integrate with the item form, add the component to the form and include security questions in the form submission:

```tsx
import { SecurityQuestionsBuilder } from "@/features/items/components";
import { createItemWithSecuritySchema } from "@findhub/shared/schemas";

function ItemForm() {
  const { register, handleSubmit, watch, setValue } = useForm({
    resolver: zodResolver(createItemWithSecuritySchema),
  });

  const securityQuestions = watch("securityQuestions") || [];

  const onSubmit = async (data) => {
    // data.securityQuestions will contain the questions array
    await createItem(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Other form fields */}
      
      <SecurityQuestionsBuilder
        questions={securityQuestions}
        onChange={(questions) => setValue("securityQuestions", questions)}
      />
      
      <button type="submit">Create Item</button>
    </form>
  );
}
```
