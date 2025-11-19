import { describe, expect, test } from "bun:test";
import {
	freeTextQuestionSchema,
	multipleChoiceQuestionSchema,
	privacyControlsSchema,
	questionTypeSchema,
	securityQuestionInputSchema,
	securityQuestionsArraySchema,
} from "./security-questions.schema";

describe("questionTypeSchema", () => {
	test("should accept valid question types", () => {
		expect(questionTypeSchema.parse("multiple_choice")).toBe("multiple_choice");
		expect(questionTypeSchema.parse("free_text")).toBe("free_text");
	});

	test("should reject invalid question types", () => {
		expect(() => questionTypeSchema.parse("invalid")).toThrow();
		expect(() => questionTypeSchema.parse("")).toThrow();
		expect(() => questionTypeSchema.parse(null)).toThrow();
	});
});

describe("multipleChoiceQuestionSchema", () => {
	const validMultipleChoice = {
		questionText: "What color is the keychain?",
		questionType: "multiple_choice" as const,
		options: ["Red", "Blue", "Green"],
		answer: "Blue",
	};

	test("should accept valid multiple choice question", () => {
		const result = multipleChoiceQuestionSchema.parse(validMultipleChoice);
		expect(result.questionText).toBe("What color is the keychain?");
		expect(result.questionType).toBe("multiple_choice");
		expect(result.options).toEqual(["Red", "Blue", "Green"]);
		expect(result.answer).toBe("Blue");
	});

	test("should accept optional displayOrder", () => {
		const withOrder = { ...validMultipleChoice, displayOrder: 1 };
		const result = multipleChoiceQuestionSchema.parse(withOrder);
		expect(result.displayOrder).toBe(1);
	});

	test("should reject question text shorter than 5 characters", () => {
		const invalid = { ...validMultipleChoice, questionText: "What" };
		expect(() => multipleChoiceQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject question text longer than 500 characters", () => {
		const invalid = { ...validMultipleChoice, questionText: "A".repeat(501) };
		expect(() => multipleChoiceQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject less than 2 options", () => {
		const invalid = { ...validMultipleChoice, options: ["Red"] };
		expect(() => multipleChoiceQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject more than 6 options", () => {
		const invalid = {
			...validMultipleChoice,
			options: ["A", "B", "C", "D", "E", "F", "G"],
		};
		expect(() => multipleChoiceQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject empty option strings", () => {
		const invalid = { ...validMultipleChoice, options: ["Red", "", "Blue"] };
		expect(() => multipleChoiceQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject option longer than 200 characters", () => {
		const invalid = {
			...validMultipleChoice,
			options: ["Red", "A".repeat(201), "Blue"],
		};
		expect(() => multipleChoiceQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject empty answer", () => {
		const invalid = { ...validMultipleChoice, answer: "" };
		expect(() => multipleChoiceQuestionSchema.parse(invalid)).toThrow();
	});

	test("should accept exactly 2 options", () => {
		const valid = { ...validMultipleChoice, options: ["Yes", "No"] };
		const result = multipleChoiceQuestionSchema.parse(valid);
		expect(result.options).toEqual(["Yes", "No"]);
	});

	test("should accept exactly 6 options", () => {
		const valid = {
			...validMultipleChoice,
			options: ["A", "B", "C", "D", "E", "F"],
		};
		const result = multipleChoiceQuestionSchema.parse(valid);
		expect(result.options).toHaveLength(6);
	});
});

describe("freeTextQuestionSchema", () => {
	const validFreeText = {
		questionText: "What brand is the laptop inside?",
		questionType: "free_text" as const,
		options: undefined,
		answer: "Dell",
	};

	test("should accept valid free text question", () => {
		const result = freeTextQuestionSchema.parse(validFreeText);
		expect(result.questionText).toBe("What brand is the laptop inside?");
		expect(result.questionType).toBe("free_text");
		expect(result.options).toBeUndefined();
		expect(result.answer).toBe("Dell");
	});

	test("should accept optional displayOrder", () => {
		const withOrder = { ...validFreeText, displayOrder: 2 };
		const result = freeTextQuestionSchema.parse(withOrder);
		expect(result.displayOrder).toBe(2);
	});

	test("should reject question text shorter than 5 characters", () => {
		const invalid = { ...validFreeText, questionText: "What" };
		expect(() => freeTextQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject question text longer than 500 characters", () => {
		const invalid = { ...validFreeText, questionText: "A".repeat(501) };
		expect(() => freeTextQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject empty answer", () => {
		const invalid = { ...validFreeText, answer: "" };
		expect(() => freeTextQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject answer longer than 500 characters", () => {
		const invalid = { ...validFreeText, answer: "A".repeat(501) };
		expect(() => freeTextQuestionSchema.parse(invalid)).toThrow();
	});

	test("should reject if options are provided", () => {
		const invalid = { ...validFreeText, options: ["A", "B"] };
		expect(() => freeTextQuestionSchema.parse(invalid)).toThrow();
	});
});

describe("securityQuestionInputSchema", () => {
	test("should accept multiple choice question", () => {
		const multipleChoice = {
			questionText: "What color?",
			questionType: "multiple_choice" as const,
			options: ["Red", "Blue"],
			answer: "Red",
		};
		const result = securityQuestionInputSchema.parse(multipleChoice);
		expect(result.questionType).toBe("multiple_choice");
	});

	test("should accept free text question", () => {
		const freeText = {
			questionText: "What's inside?",
			questionType: "free_text" as const,
			options: undefined,
			answer: "Laptop",
		};
		const result = securityQuestionInputSchema.parse(freeText);
		expect(result.questionType).toBe("free_text");
	});

	test("should reject invalid question type", () => {
		const invalid = {
			questionText: "What?",
			questionType: "invalid",
			answer: "Answer",
		};
		expect(() => securityQuestionInputSchema.parse(invalid)).toThrow();
	});

	test("should reject multiple choice without options", () => {
		const invalid = {
			questionText: "What color?",
			questionType: "multiple_choice",
			answer: "Red",
		};
		expect(() => securityQuestionInputSchema.parse(invalid)).toThrow();
	});

	test("should reject free text with options", () => {
		const invalid = {
			questionText: "What's inside?",
			questionType: "free_text",
			options: ["A", "B"],
			answer: "Laptop",
		};
		expect(() => securityQuestionInputSchema.parse(invalid)).toThrow();
	});
});

describe("securityQuestionsArraySchema", () => {
	const validQuestion = {
		questionText: "What color?",
		questionType: "free_text" as const,
		options: undefined,
		answer: "Blue",
	};

	test("should accept empty array", () => {
		const result = securityQuestionsArraySchema.parse([]);
		expect(result).toEqual([]);
	});

	test("should accept single question", () => {
		const result = securityQuestionsArraySchema.parse([validQuestion]);
		expect(result).toHaveLength(1);
	});

	test("should accept multiple questions", () => {
		const questions = [
			validQuestion,
			{
				questionText: "What brand?",
				questionType: "multiple_choice" as const,
				options: ["Dell", "HP", "Apple"],
				answer: "Dell",
			},
		];
		const result = securityQuestionsArraySchema.parse(questions);
		expect(result).toHaveLength(2);
	});

	test("should accept up to 10 questions", () => {
		const questions = Array.from({ length: 10 }, (_, i) => ({
			...validQuestion,
			questionText: `Question ${i + 1}?`,
		}));
		const result = securityQuestionsArraySchema.parse(questions);
		expect(result).toHaveLength(10);
	});

	test("should reject more than 10 questions", () => {
		const questions = Array.from({ length: 11 }, (_, i) => ({
			...validQuestion,
			questionText: `Question ${i + 1}?`,
		}));
		expect(() => securityQuestionsArraySchema.parse(questions)).toThrow();
	});

	test("should reject array with invalid question", () => {
		const invalid = [
			validQuestion,
			{
				questionText: "Bad",
				questionType: "free_text",
				answer: "",
			},
		];
		expect(() => securityQuestionsArraySchema.parse(invalid)).toThrow();
	});
});

describe("privacyControlsSchema", () => {
	test("should accept both privacy controls as false", () => {
		const result = privacyControlsSchema.parse({
			hideLocation: false,
			hideDateFound: false,
		});
		expect(result.hideLocation).toBe(false);
		expect(result.hideDateFound).toBe(false);
	});

	test("should accept both privacy controls as true", () => {
		const result = privacyControlsSchema.parse({
			hideLocation: true,
			hideDateFound: true,
		});
		expect(result.hideLocation).toBe(true);
		expect(result.hideDateFound).toBe(true);
	});

	test("should accept hideLocation only", () => {
		const result = privacyControlsSchema.parse({
			hideLocation: true,
			hideDateFound: false,
		});
		expect(result.hideLocation).toBe(true);
		expect(result.hideDateFound).toBe(false);
	});

	test("should accept hideDateFound only", () => {
		const result = privacyControlsSchema.parse({
			hideLocation: false,
			hideDateFound: true,
		});
		expect(result.hideLocation).toBe(false);
		expect(result.hideDateFound).toBe(true);
	});

	test("should default to false when not provided", () => {
		const result = privacyControlsSchema.parse({});
		expect(result.hideLocation).toBe(false);
		expect(result.hideDateFound).toBe(false);
	});

	test("should reject non-boolean values", () => {
		expect(() =>
			privacyControlsSchema.parse({
				hideLocation: "true",
				hideDateFound: false,
			}),
		).toThrow();
	});
});
