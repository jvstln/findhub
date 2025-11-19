import { describe, expect, test } from "bun:test";
import {
	createItemWithSecuritySchema,
	updateItemWithSecuritySchema,
} from "./item.schema";

describe("createItemWithSecuritySchema", () => {
	const validItemData = {
		name: "Lost Wallet",
		description: "Black leather wallet found near library",
		category: "accessories",
		location: "Main Library",
		dateFound: new Date("2024-01-15"),
	};

	test("should accept item without security questions", () => {
		const result = createItemWithSecuritySchema.parse(validItemData);
		expect(result.name).toBe("Lost Wallet");
		expect(result.hideLocation).toBe(false);
		expect(result.hideDateFound).toBe(false);
		expect(result.securityQuestions).toBeUndefined();
	});

	test("should accept item with security questions", () => {
		const withSecurity = {
			...validItemData,
			securityQuestions: [
				{
					questionText: "What color is it?",
					questionType: "free_text" as const,
					options: undefined,
					answer: "Black",
				},
			],
		};
		const result = createItemWithSecuritySchema.parse(withSecurity);
		expect(result.securityQuestions).toHaveLength(1);
		expect(result.securityQuestions?.[0].questionText).toBe(
			"What color is it?",
		);
	});

	test("should accept item with privacy controls", () => {
		const withPrivacy = {
			...validItemData,
			hideLocation: true,
			hideDateFound: false,
		};
		const result = createItemWithSecuritySchema.parse(withPrivacy);
		expect(result.hideLocation).toBe(true);
		expect(result.hideDateFound).toBe(false);
	});

	test("should accept item with both security questions and privacy controls", () => {
		const complete = {
			...validItemData,
			hideLocation: true,
			hideDateFound: true,
			securityQuestions: [
				{
					questionText: "What brand?",
					questionType: "multiple_choice" as const,
					options: ["Dell", "HP", "Apple"],
					answer: "Dell",
				},
				{
					questionText: "What's inside?",
					questionType: "free_text" as const,
					options: undefined,
					answer: "Laptop and charger",
				},
			],
		};
		const result = createItemWithSecuritySchema.parse(complete);
		expect(result.hideLocation).toBe(true);
		expect(result.hideDateFound).toBe(true);
		expect(result.securityQuestions).toHaveLength(2);
	});

	test("should reject invalid security questions", () => {
		const invalid = {
			...validItemData,
			securityQuestions: [
				{
					questionText: "Bad",
					questionType: "free_text",
					answer: "",
				},
			],
		};
		expect(() => createItemWithSecuritySchema.parse(invalid)).toThrow();
	});

	test("should reject more than 10 security questions", () => {
		const tooMany = {
			...validItemData,
			securityQuestions: Array.from({ length: 11 }, (_, i) => ({
				questionText: `Question ${i + 1}?`,
				questionType: "free_text" as const,
				options: undefined,
				answer: "Answer",
			})),
		};
		expect(() => createItemWithSecuritySchema.parse(tooMany)).toThrow();
	});

	test("should validate base item fields", () => {
		const invalid = {
			...validItemData,
			name: "AB",
			securityQuestions: [],
		};
		expect(() => createItemWithSecuritySchema.parse(invalid)).toThrow();
	});
});

describe("updateItemWithSecuritySchema", () => {
	test("should accept partial updates", () => {
		const partial = {
			name: "Updated Name",
		};
		const result = updateItemWithSecuritySchema.parse(partial);
		expect(result.name).toBe("Updated Name");
	});

	test("should accept security questions update", () => {
		const update = {
			securityQuestions: [
				{
					questionText: "New question?",
					questionType: "free_text" as const,
					options: undefined,
					answer: "New answer",
				},
			],
		};
		const result = updateItemWithSecuritySchema.parse(update);
		expect(result.securityQuestions).toHaveLength(1);
	});

	test("should accept privacy controls update", () => {
		const update = {
			hideLocation: true,
		};
		const result = updateItemWithSecuritySchema.parse(update);
		expect(result.hideLocation).toBe(true);
	});

	test("should accept empty object with default privacy controls", () => {
		const result = updateItemWithSecuritySchema.parse({});
		expect(result.hideLocation).toBe(false);
		expect(result.hideDateFound).toBe(false);
	});

	test("should still validate provided fields", () => {
		const invalid = {
			securityQuestions: [
				{
					questionText: "Bad",
					questionType: "free_text",
					answer: "",
				},
			],
		};
		expect(() => updateItemWithSecuritySchema.parse(invalid)).toThrow();
	});
});
