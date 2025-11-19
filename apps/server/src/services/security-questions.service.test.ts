import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { SecurityQuestionInput } from "@findhub/db";
import { db, lostItems, securityQuestions, users } from "@findhub/db";
import { eq } from "@findhub/db/drizzle-orm";
import { SecurityQuestionsService } from "./security-questions.service";

// Set test encryption key before running tests
process.env.ENCRYPTION_KEY =
	"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("SecurityQuestionsService", () => {
	const service = new SecurityQuestionsService();
	let testUserId: string;
	let testItemId: number;

	// Setup: Create test user and item before each test
	beforeEach(async () => {
		// Create test user
		const [user] = await db
			.insert(users)
			.values({
				id: `test-user-${Date.now()}-${Math.random()}`,
				email: `test-${Date.now()}@example.com`,
				name: "Test User",
				emailVerified: false,
			})
			.returning();
		testUserId = user.id;

		// Create test item
		const [item] = await db
			.insert(lostItems)
			.values({
				name: "Test Item",
				description: "Test Description",
				location: "Test Location",
				dateFound: new Date(),
				status: "unclaimed",
				createdById: testUserId,
			})
			.returning();
		testItemId = item.id;
	});

	// Cleanup: Delete test data after each test
	afterEach(async () => {
		// Delete security questions (cascade will handle this, but explicit for clarity)
		await db
			.delete(securityQuestions)
			.where(eq(securityQuestions.itemId, testItemId));

		// Delete test item
		await db.delete(lostItems).where(eq(lostItems.id, testItemId));

		// Delete test user
		await db.delete(users).where(eq(users.id, testUserId));
	});

	describe("createQuestions", () => {
		it("should create security questions with encryption", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "What brand is the laptop?",
					questionType: "free_text",
					answer: "Dell",
					displayOrder: 0,
				},
				{
					questionText: "What color is the keychain?",
					questionType: "multiple_choice",
					options: ["Red", "Blue", "Green"],
					answer: "Red",
					displayOrder: 1,
				},
			];

			const created = await service.createQuestions(
				testItemId,
				questions,
				testUserId,
			);

			expect(created).toHaveLength(2);
			expect(created[0].questionText).toBe("What brand is the laptop?");
			expect(created[0].questionType).toBe("free_text");
			expect(created[0].encryptedAnswer).toBeDefined();
			expect(created[0].iv).toBeDefined();
			expect(created[0].authTag).toBeDefined();
			expect(created[0].displayOrder).toBe(0);

			expect(created[1].questionText).toBe("What color is the keychain?");
			expect(created[1].questionType).toBe("multiple_choice");
			expect(created[1].options).toEqual(["Red", "Blue", "Green"]);
			expect(created[1].displayOrder).toBe(1);
		});

		it("should return empty array when no questions provided", async () => {
			const created = await service.createQuestions(testItemId, [], testUserId);
			expect(created).toHaveLength(0);
		});

		it("should use index as displayOrder when not provided", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Question 1",
					questionType: "free_text",
					answer: "Answer 1",
				},
				{
					questionText: "Question 2",
					questionType: "free_text",
					answer: "Answer 2",
				},
			];

			const created = await service.createQuestions(
				testItemId,
				questions,
				testUserId,
			);

			expect(created[0].displayOrder).toBe(0);
			expect(created[1].displayOrder).toBe(1);
		});

		it("should store null options for free text questions", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Free text question",
					questionType: "free_text",
					answer: "Answer",
				},
			];

			const created = await service.createQuestions(
				testItemId,
				questions,
				testUserId,
			);

			expect(created[0].options).toBeNull();
		});
	});

	describe("getQuestionsWithAnswers", () => {
		it("should retrieve questions with decrypted answers", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "What's inside?",
					questionType: "free_text",
					answer: "Laptop and books",
				},
			];

			await service.createQuestions(testItemId, questions, testUserId);

			const retrieved = await service.getQuestionsWithAnswers(testItemId);

			expect(retrieved).toHaveLength(1);
			expect(retrieved[0].questionText).toBe("What's inside?");
			expect(retrieved[0].answer).toBe("Laptop and books");
			// Encrypted fields should not be present
			expect(retrieved[0]).not.toHaveProperty("encryptedAnswer");
			expect(retrieved[0]).not.toHaveProperty("iv");
			expect(retrieved[0]).not.toHaveProperty("authTag");
		});

		it("should return questions in display order", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Question 3",
					questionType: "free_text",
					answer: "Answer 3",
					displayOrder: 2,
				},
				{
					questionText: "Question 1",
					questionType: "free_text",
					answer: "Answer 1",
					displayOrder: 0,
				},
				{
					questionText: "Question 2",
					questionType: "free_text",
					answer: "Answer 2",
					displayOrder: 1,
				},
			];

			await service.createQuestions(testItemId, questions, testUserId);

			const retrieved = await service.getQuestionsWithAnswers(testItemId);

			expect(retrieved).toHaveLength(3);
			expect(retrieved[0].questionText).toBe("Question 1");
			expect(retrieved[1].questionText).toBe("Question 2");
			expect(retrieved[2].questionText).toBe("Question 3");
		});

		it("should return empty array when no questions exist", async () => {
			const retrieved = await service.getQuestionsWithAnswers(testItemId);
			expect(retrieved).toHaveLength(0);
		});

		it("should decrypt multiple choice answers correctly", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Pick a color",
					questionType: "multiple_choice",
					options: ["Red", "Blue", "Green"],
					answer: "Blue",
				},
			];

			await service.createQuestions(testItemId, questions, testUserId);

			const retrieved = await service.getQuestionsWithAnswers(testItemId);

			expect(retrieved[0].answer).toBe("Blue");
			expect(retrieved[0].options).toEqual(["Red", "Blue", "Green"]);
		});
	});

	describe("getQuestions", () => {
		it("should retrieve questions without decrypting answers", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Test question",
					questionType: "free_text",
					answer: "Test answer",
				},
			];

			await service.createQuestions(testItemId, questions, testUserId);

			const retrieved = await service.getQuestions(testItemId);

			expect(retrieved).toHaveLength(1);
			expect(retrieved[0].questionText).toBe("Test question");
			expect(retrieved[0].encryptedAnswer).toBeDefined();
			expect(retrieved[0].iv).toBeDefined();
			expect(retrieved[0].authTag).toBeDefined();
			// Should not have decrypted answer
			expect(retrieved[0]).not.toHaveProperty("answer");
		});
	});

	describe("updateQuestions", () => {
		it("should delete existing questions and create new ones", async () => {
			// Create initial questions
			const initialQuestions: SecurityQuestionInput[] = [
				{
					questionText: "Old question 1",
					questionType: "free_text",
					answer: "Old answer 1",
				},
				{
					questionText: "Old question 2",
					questionType: "free_text",
					answer: "Old answer 2",
				},
			];

			await service.createQuestions(testItemId, initialQuestions, testUserId);

			// Update with new questions
			const newQuestions: SecurityQuestionInput[] = [
				{
					questionText: "New question",
					questionType: "free_text",
					answer: "New answer",
				},
			];

			const updated = await service.updateQuestions(
				testItemId,
				newQuestions,
				testUserId,
			);

			expect(updated).toHaveLength(1);
			expect(updated[0].questionText).toBe("New question");

			// Verify old questions are gone
			const all = await service.getQuestionsWithAnswers(testItemId);
			expect(all).toHaveLength(1);
			expect(all[0].questionText).toBe("New question");
		});

		it("should delete all questions when empty array provided", async () => {
			// Create initial questions
			const initialQuestions: SecurityQuestionInput[] = [
				{
					questionText: "Question to delete",
					questionType: "free_text",
					answer: "Answer",
				},
			];

			await service.createQuestions(testItemId, initialQuestions, testUserId);

			// Update with empty array
			const updated = await service.updateQuestions(testItemId, [], testUserId);

			expect(updated).toHaveLength(0);

			// Verify all questions are deleted
			const all = await service.getQuestionsWithAnswers(testItemId);
			expect(all).toHaveLength(0);
		});
	});

	describe("deleteQuestions", () => {
		it("should delete all security questions for an item", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Question 1",
					questionType: "free_text",
					answer: "Answer 1",
				},
				{
					questionText: "Question 2",
					questionType: "free_text",
					answer: "Answer 2",
				},
			];

			await service.createQuestions(testItemId, questions, testUserId);

			await service.deleteQuestions(testItemId);

			const remaining = await service.getQuestionsWithAnswers(testItemId);
			expect(remaining).toHaveLength(0);
		});

		it("should not throw error when deleting from item with no questions", async () => {
			await expect(service.deleteQuestions(testItemId)).resolves.not.toThrow();
		});
	});

	describe("deleteQuestion", () => {
		it("should delete a specific security question by ID", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Question 1",
					questionType: "free_text",
					answer: "Answer 1",
				},
				{
					questionText: "Question 2",
					questionType: "free_text",
					answer: "Answer 2",
				},
			];

			const created = await service.createQuestions(
				testItemId,
				questions,
				testUserId,
			);

			const deleted = await service.deleteQuestion(created[0].id);

			expect(deleted).toBe(true);

			const remaining = await service.getQuestionsWithAnswers(testItemId);
			expect(remaining).toHaveLength(1);
			expect(remaining[0].questionText).toBe("Question 2");
		});

		it("should return false when deleting non-existent question", async () => {
			const deleted = await service.deleteQuestion(99999);
			expect(deleted).toBe(false);
		});
	});

	describe("hasSecurityQuestions", () => {
		it("should return true when item has security questions", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Test question",
					questionType: "free_text",
					answer: "Test answer",
				},
			];

			await service.createQuestions(testItemId, questions, testUserId);

			const hasQuestions = await service.hasSecurityQuestions(testItemId);
			expect(hasQuestions).toBe(true);
		});

		it("should return false when item has no security questions", async () => {
			const hasQuestions = await service.hasSecurityQuestions(testItemId);
			expect(hasQuestions).toBe(false);
		});
	});

	describe("cascade deletion", () => {
		it("should delete security questions when item is deleted", async () => {
			const questions: SecurityQuestionInput[] = [
				{
					questionText: "Question to cascade delete",
					questionType: "free_text",
					answer: "Answer",
				},
			];

			await service.createQuestions(testItemId, questions, testUserId);

			// Verify question exists
			const before = await service.getQuestionsWithAnswers(testItemId);
			expect(before).toHaveLength(1);

			// Delete the item (should cascade to security questions)
			await db.delete(lostItems).where(eq(lostItems.id, testItemId));

			// Verify questions are deleted
			const after = await db
				.select()
				.from(securityQuestions)
				.where(eq(securityQuestions.itemId, testItemId));
			expect(after).toHaveLength(0);
		});
	});
});
