# SecurityQuestionsDisplay Component

## Overview

The `SecurityQuestionsDisplay` component provides a read-only view of security questions and their decrypted answers for admin users. It displays questions in an organized, collapsible card format with clear visual distinction between multiple choice and free text question types.

## Features

- **Read-only Display**: Shows security questions with decrypted answers (admin view only)
- **Expandable/Collapsible**: Card can be collapsed to save space when viewing items
- **Visual Distinction**: Clear badges and icons differentiate between question types
- **Multiple Choice Display**: Shows all options with the correct answer highlighted
- **Free Text Display**: Shows the expected answer in a secure-looking format
- **Empty State Handling**: Component returns null when no questions exist

## Usage

```tsx
import { SecurityQuestionsDisplay } from "@/features/items/components";
import type { SecurityQuestionWithDecryptedAnswer } from "@findhub/db";

function ItemDetailPage() {
	const questions: SecurityQuestionWithDecryptedAnswer[] = [
		{
			id: 1,
			itemId: 123,
			questionText: "What color is the keychain attached?",
			questionType: "multiple_choice",
			options: ["Red", "Blue", "Green", "Black"],
			answer: "Red",
			displayOrder: 0,
			createdById: "user123",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 2,
			itemId: 123,
			questionText: "What brand is the laptop inside?",
			questionType: "free_text",
			options: null,
			answer: "Dell",
			displayOrder: 1,
			createdById: "user123",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	return (
		<div>
			<SecurityQuestionsDisplay questions={questions} />
		</div>
	);
}
```

## Props

### SecurityQuestionsDisplayProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `questions` | `SecurityQuestionWithDecryptedAnswer[]` | Yes | Array of security questions with decrypted answers |

## Question Types

### Multiple Choice Questions

Multiple choice questions display:
- Question text with "Multiple Choice" badge
- All available options
- Correct answer highlighted with green background and checkmark icon
- "Correct Answer" badge on the right answer

### Free Text Questions

Free text questions display:
- Question text with "Free Text" badge
- Expected answer in a highlighted box with lock icon
- Secure visual styling to indicate sensitive information

## Visual Design

### Component Structure

```
┌─────────────────────────────────────────────────────────┐
│ Security Questions                                      │
│ Verification questions for claimant identity validation │
├─────────────────────────────────────────────────────────┤
│ 🛡️ Security Questions (2)                      [▼]     │
│ These questions can be used to verify...                │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐   │
│ │ Question 1  [Multiple Choice]                   │   │
│ │ What color is the keychain attached?            │   │
│ │                                                  │   │
│ │ Options:                                         │   │
│ │ ✓ Red                          [Correct Answer] │   │
│ │ ○ Blue                                          │   │
│ │ ○ Green                                         │   │
│ │ ○ Black                                         │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Question 2  [Free Text]                         │   │
│ │ What brand is the laptop inside?                │   │
│ │                                                  │   │
│ │ Expected Answer:                                 │   │
│ │ 🔒 Dell                                          │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## State Management

The component maintains internal state for:
- `isExpanded`: Controls whether the questions list is visible or collapsed (default: `true`)

## Accessibility

- Collapse/expand button has proper `aria-label` attributes
- Visual indicators use both color and icons for accessibility
- Semantic HTML structure with proper heading hierarchy
- Keyboard navigation support through button elements

## Integration Points

### Admin Item Detail View

```tsx
import { SecurityQuestionsDisplay } from "@/features/items/components";

function AdminItemDetailPage({ item }) {
	return (
		<div className="space-y-6">
			{/* Other item details */}
			
			<SecurityQuestionsDisplay questions={item.securityQuestions} />
		</div>
	);
}
```

### Admin Item Edit Page

```tsx
import { SecurityQuestionsDisplay } from "@/features/items/components";

function AdminItemEditPage({ item }) {
	return (
		<div className="space-y-6">
			{/* Item edit form */}
			
			{/* Show current questions before editing */}
			<SecurityQuestionsDisplay questions={item.securityQuestions} />
			
			{/* Security questions builder for editing */}
		</div>
	);
}
```

## Security Considerations

1. **Admin Only**: This component should only be rendered in admin-authenticated contexts
2. **Decrypted Data**: The component receives already-decrypted answers from the backend
3. **No Public Exposure**: Never use this component in public-facing pages
4. **Sensitive Information**: Answers are displayed in a visually secure format to indicate their sensitivity

## Related Components

- `SecurityQuestionsBuilder`: For creating/editing security questions
- `PrivacyControls`: For managing field visibility settings
- `ItemForm`: Main form that integrates security questions

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **5.1**: Admin users can view complete item information including security questions
- **5.2**: Security questions are displayed with their correct answers in admin view
- **5.3**: Visual indicators show which fields are hidden from public users
- **5.4**: Admin interface allows viewing of security questions when managing items
- **5.5**: Security questions are displayed with visual distinction in admin dashboard

## Future Enhancements

Potential improvements for future iterations:

1. **Copy to Clipboard**: Add button to copy answers for phone verification
2. **Question History**: Show edit history for security questions
3. **Answer Validation**: Show if answer format matches expected patterns
4. **Print View**: Optimized layout for printing verification questions
5. **Search/Filter**: Filter questions by type when many questions exist
