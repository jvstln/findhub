// Shared Zod validation schemas for security questions feature
import { z } from "zod";

// Question type enum schema
export const questionTypeSchema = z.enum(["multiple_choice", "free_text"]);

// Multiple choice question schema
export const multipleChoiceQuestionSchema = z.object({
	questionText: z
		.string()
		.min(5, "Question must be at least 5 characters")
		.max(500, "Question must be less than 500 characters"),
	questionType: z.literal("multiple_choice"),
	options: z
		.array(
			z
				.string()
				.min(1, "Option cannot be empty")
				.max(200, "Option must be less than 200 characters"),
		)
		.min(2, "Multiple choice questions must have at least 2 options")
		.max(6, "Maximum 6 options allowed"),
	answer: z.string().min(1, "Must select a correct answer"),
	displayOrder: z.number().int().min(0).optional(),
});

// Free text question schema
export const freeTextQuestionSchema = z.object({
	questionText: z
		.string()
		.min(5, "Question must be at least 5 characters")
		.max(500, "Question must be less than 500 characters"),
	questionType: z.literal("free_text"),
	options: z.undefined(),
	answer: z
		.string()
		.min(1, "Answer is required")
		.max(500, "Answer must be less than 500 characters"),
	displayOrder: z.number().int().min(0).optional(),
});

// Discriminated union for security question input
export const securityQuestionInputSchema = z.discriminatedUnion(
	"questionType",
	[multipleChoiceQuestionSchema, freeTextQuestionSchema],
);

// Array of security questions with max limit
export const securityQuestionsArraySchema = z
	.array(securityQuestionInputSchema)
	.max(10, "Maximum 10 security questions allowed");

// Type exports for TypeScript
export type QuestionTypeSchema = z.infer<typeof questionTypeSchema>;
export type MultipleChoiceQuestion = z.infer<
	typeof multipleChoiceQuestionSchema
>;
export type FreeTextQuestion = z.infer<typeof freeTextQuestionSchema>;
export type SecurityQuestionInput = z.infer<typeof securityQuestionInputSchema>;
export type SecurityQuestionsArray = z.infer<
	typeof securityQuestionsArraySchema
>;
