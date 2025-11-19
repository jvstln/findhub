/**
 * Example usage of SecurityQuestionsDisplay component
 *
 * This file demonstrates how to use the SecurityQuestionsDisplay component
 * in different scenarios within the admin application.
 */

import type { SecurityQuestionWithDecryptedAnswer } from "@findhub/db";
import { SecurityQuestionsDisplay } from "./security-questions-display";

// Example 1: Multiple choice question
const multipleChoiceExample: SecurityQuestionWithDecryptedAnswer = {
	id: 1,
	itemId: 123,
	questionText: "What color is the keychain attached to the backpack?",
	questionType: "multiple_choice",
	options: ["Red", "Blue", "Green", "Black"],
	answer: "Red", // This is the correct answer
	displayOrder: 0,
	createdById: "admin-user-123",
	createdAt: new Date("2025-11-15T10:00:00Z"),
	updatedAt: new Date("2025-11-15T10:00:00Z"),
};

// Example 2: Free text question
const freeTextExample: SecurityQuestionWithDecryptedAnswer = {
	id: 2,
	itemId: 123,
	questionText: "What brand is the laptop inside the backpack?",
	questionType: "free_text",
	options: null,
	answer: "Dell", // This is the expected answer
	displayOrder: 1,
	createdById: "admin-user-123",
	createdAt: new Date("2025-11-15T10:00:00Z"),
	updatedAt: new Date("2025-11-15T10:00:00Z"),
};

// Example 3: Item with multiple security questions
export function ItemWithSecurityQuestionsExample() {
	const questions: SecurityQuestionWithDecryptedAnswer[] = [
		multipleChoiceExample,
		freeTextExample,
	];

	return (
		<div className="space-y-6 p-6">
			<h2 className="font-bold text-2xl">
				Item Detail with Security Questions
			</h2>

			{/* Other item details would go here */}

			<SecurityQuestionsDisplay questions={questions} />
		</div>
	);
}

// Example 4: Item with no security questions (component returns null)
export function ItemWithoutSecurityQuestionsExample() {
	const questions: SecurityQuestionWithDecryptedAnswer[] = [];

	return (
		<div className="space-y-6 p-6">
			<h2 className="font-bold text-2xl">
				Item Detail without Security Questions
			</h2>

			{/* Other item details would go here */}

			{/* This will render nothing since there are no questions */}
			<SecurityQuestionsDisplay questions={questions} />
		</div>
	);
}

// Example 5: Integration in admin item detail page
export function AdminItemDetailPageExample() {
	// In a real scenario, this would come from an API call
	const item = {
		id: 123,
		name: "Blue Backpack",
		description: "Blue backpack with laptop compartment",
		location: "Library 3rd Floor",
		dateFound: new Date("2025-11-15T10:30:00Z"),
		status: "unclaimed" as const,
		securityQuestions: [multipleChoiceExample, freeTextExample],
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-6">
			<h1 className="font-bold text-3xl">{item.name}</h1>

			{/* Item details card */}
			<div className="rounded-lg border bg-card p-6">
				<p className="text-muted-foreground">{item.description}</p>
			</div>

			{/* Security questions display */}
			<SecurityQuestionsDisplay questions={item.securityQuestions} />
		</div>
	);
}

// Example 6: Integration in admin item edit page
export function AdminItemEditPageExample() {
	const item = {
		id: 123,
		name: "Blue Backpack",
		securityQuestions: [multipleChoiceExample, freeTextExample],
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-6">
			<h1 className="font-bold text-3xl">Edit Item: {item.name}</h1>

			{/* Show current security questions before editing */}
			<div className="space-y-4">
				<h2 className="font-semibold text-xl">Current Security Questions</h2>
				<SecurityQuestionsDisplay questions={item.securityQuestions} />
			</div>

			{/* Edit form would go here */}
		</div>
	);
}
