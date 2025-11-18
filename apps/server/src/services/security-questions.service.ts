import type {
	SecurityQuestion,
	SecurityQuestionInput,
	SecurityQuestionWithDecryptedAnswer,
} from "@findhub/db";
import { db, securityQuestions } from "@findhub/db";
import { eq } from "@findhub/db/drizzle-orm";
import { decrypt, encrypt } from "./encryption.service";

export class SecurityQuestionsService {
	/**
	 * Create security questions for an item
	 * Encrypts answers before storing in database
	 */
	async createQuestions(
		itemId: number,
		questions: SecurityQuestionInput[],
		createdById: string,
	): Promise<SecurityQuestion[]> {
		if (questions.length === 0) {
			return [];
		}

		const questionsToInsert = questions.map((q, index) => {
			// Encrypt the answer
			const { encryptedText, iv, authTag } = encrypt(q.answer);

			return {
				itemId,
				questionText: q.questionText,
				questionType: q.questionType,
				options: q.questionType === "multiple_choice" ? q.options : null,
				encryptedAnswer: encryptedText,
				iv,
				authTag,
				displayOrder: q.displayOrder ?? index,
				createdById,
			};
		});

		const insertedQuestions = await db
			.insert(securityQuestions)
			.values(questionsToInsert)
			.returning();

		return insertedQuestions;
	}

	/**
	 * Get security questions for an item (admin only - with decrypted answers)
	 * Decrypts answers for admin viewing
	 */
	async getQuestionsWithAnswers(
		itemId: number,
	): Promise<SecurityQuestionWithDecryptedAnswer[]> {
		const questions = await db
			.select()
			.from(securityQuestions)
			.where(eq(securityQuestions.itemId, itemId))
			.orderBy(securityQuestions.displayOrder);

		return questions.map((q) => {
			try {
				const answer = decrypt(q.encryptedAnswer, q.iv, q.authTag);

				return {
					id: q.id,
					itemId: q.itemId,
					questionText: q.questionText,
					questionType: q.questionType,
					options: q.options,
					answer, // Decrypted
					displayOrder: q.displayOrder,
					createdById: q.createdById,
					createdAt: q.createdAt,
					updatedAt: q.updatedAt,
				};
			} catch (error) {
				// Log decryption error but don't expose details to caller
				console.error(
					`Failed to decrypt security question ${q.id} for item ${itemId}:`,
					error instanceof Error ? error.message : "Unknown error",
				);
				throw new Error(
					"Failed to retrieve security questions. Please contact system administrator.",
				);
			}
		});
	}

	/**
	 * Get security questions for an item without decrypted answers
	 * Returns encrypted data only (for internal use)
	 */
	async getQuestions(itemId: number): Promise<SecurityQuestion[]> {
		const questions = await db
			.select()
			.from(securityQuestions)
			.where(eq(securityQuestions.itemId, itemId))
			.orderBy(securityQuestions.displayOrder);

		return questions;
	}

	/**
	 * Update security questions for an item
	 * Replaces all existing questions with new ones
	 */
	async updateQuestions(
		itemId: number,
		questions: SecurityQuestionInput[],
		userId: string,
	): Promise<SecurityQuestion[]> {
		// Delete existing questions
		await db
			.delete(securityQuestions)
			.where(eq(securityQuestions.itemId, itemId));

		// Create new questions if provided
		if (questions.length > 0) {
			return await this.createQuestions(itemId, questions, userId);
		}

		return [];
	}

	/**
	 * Delete all security questions for an item
	 */
	async deleteQuestions(itemId: number): Promise<void> {
		await db
			.delete(securityQuestions)
			.where(eq(securityQuestions.itemId, itemId));
	}

	/**
	 * Delete a specific security question by ID
	 */
	async deleteQuestion(questionId: number): Promise<boolean> {
		const result = await db
			.delete(securityQuestions)
			.where(eq(securityQuestions.id, questionId))
			.returning();

		return result.length > 0;
	}

	/**
	 * Check if an item has security questions
	 */
	async hasSecurityQuestions(itemId: number): Promise<boolean> {
		const questions = await db
			.select({ id: securityQuestions.id })
			.from(securityQuestions)
			.where(eq(securityQuestions.itemId, itemId))
			.limit(1);

		return questions.length > 0;
	}
}

// Export singleton instance
export const securityQuestionsService = new SecurityQuestionsService();
