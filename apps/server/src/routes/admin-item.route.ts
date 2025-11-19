import {
	createItemWithSecuritySchema,
	itemIdSchema,
	securityQuestionsArraySchema,
	updateItemWithSecuritySchema,
} from "@findhub/shared/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { authMiddleware, getAuthUser } from "../middleware/auth.middleware";
import { itemsService } from "../services/item.service";
import { securityQuestionsService } from "../services/security-questions.service";

const adminItems = new Hono();

// All routes require authentication
adminItems.use("*", authMiddleware);

/**
 * POST /api/admin/items
 * Create a new lost item with security questions and privacy controls
 * Requires authentication
 */
adminItems.post("/", async (c) => {
	try {
		const user = getAuthUser(c);
		const formData = await c.req.formData();

		// Extract form fields
		const name = formData.get("name") as string;
		const description = formData.get("description") as string;
		const category = formData.get("category") as string;
		const keywords = formData.get("keywords") as string | undefined;
		const location = formData.get("location") as string;
		const dateFound = formData.get("dateFound") as string;
		const hideLocation = formData.get("hideLocation") === "true";
		const hideDateFound = formData.get("hideDateFound") === "true";

		// Extract security questions (JSON string)
		const securityQuestionsJson = formData.get("securityQuestions") as
			| string
			| null;
		let securityQuestions: unknown;
		if (securityQuestionsJson) {
			try {
				securityQuestions = JSON.parse(securityQuestionsJson);
			} catch {
				return c.json(
					{
						success: false,
						error: {
							code: "VALIDATION_ERROR",
							message: "Invalid security questions format",
						},
					},
					400,
				);
			}
		}

		// Extract images (multiple files)
		const images: File[] = [];
		for (const [key, value] of formData.entries()) {
			if (
				key.startsWith("image") &&
				typeof value === "object" &&
				value !== null &&
				"size" in value &&
				(value as File).size > 0
			) {
				images.push(value as File);
			}
		}

		// Validate input data
		const validationResult = createItemWithSecuritySchema.safeParse({
			name,
			description,
			category,
			keywords,
			location,
			dateFound,
			images: images.length > 0 ? images : undefined,
			securityQuestions,
			hideLocation,
			hideDateFound,
		});

		if (!validationResult.success) {
			return c.json(
				{
					success: false,
					error: {
						code: "VALIDATION_ERROR",
						message: "Invalid input data",
						details: validationResult.error.issues,
					},
				},
				400,
			);
		}

		// Create item with security questions and privacy controls
		const item = await itemsService.createItem({
			name: validationResult.data.name,
			description: validationResult.data.description,
			categoryId: validationResult.data.category
				? Number.parseInt(validationResult.data.category, 10)
				: null,
			keywords: validationResult.data.keywords,
			location: validationResult.data.location,
			dateFound: validationResult.data.dateFound,
			images: validationResult.data.images,
			securityQuestions: validationResult.data.securityQuestions,
			hideLocation: validationResult.data.hideLocation,
			hideDateFound: validationResult.data.hideDateFound,
			createdById: user.id,
		});

		// Get item with decrypted security questions for response
		const itemWithSecurity = await itemsService.getItemWithDecryptedSecurity(
			item.id,
		);

		return c.json(
			{
				success: true,
				data: itemWithSecurity,
				message: "Item created successfully",
			},
			201,
		);
	} catch (error) {
		console.error("Error creating item:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to create item";
		const isStorageError =
			errorMessage.includes("upload") ||
			errorMessage.includes("storage") ||
			errorMessage.includes("Supabase");

		return c.json(
			{
				success: false,
				error: {
					code: isStorageError ? "STORAGE_ERROR" : "CREATE_ERROR",
					message: errorMessage,
				},
			},
			isStorageError ? 400 : 500,
		);
	}
});

/**
 * GET /api/admin/items/:id
 * Get single item with decrypted security questions
 * Requires authentication
 */
adminItems.get("/:id", zValidator("param", itemIdSchema), async (c) => {
	try {
		const { id } = c.req.valid("param");
		const item = await itemsService.getItemWithDecryptedSecurity(id);

		if (!item) {
			return c.json(
				{
					success: false,
					error: {
						code: "NOT_FOUND",
						message: "Item not found",
					},
				},
				404,
			);
		}

		return c.json({
			success: true,
			data: item,
		});
	} catch (error) {
		console.error("Error fetching item:", error);

		// Handle decryption errors
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch item";
		const isDecryptionError = errorMessage.includes("decrypt");

		return c.json(
			{
				success: false,
				error: {
					code: isDecryptionError ? "DECRYPTION_ERROR" : "FETCH_ERROR",
					message: errorMessage,
				},
			},
			500,
		);
	}
});

/**
 * PATCH /api/admin/items/:id
 * Update an existing item including security questions and privacy controls
 * Requires authentication
 */
adminItems.patch("/:id", zValidator("param", itemIdSchema), async (c) => {
	try {
		const user = getAuthUser(c);
		const { id } = c.req.valid("param");

		// Check if item exists
		const existingItem = await itemsService.getItemById(id);
		if (!existingItem) {
			return c.json(
				{
					success: false,
					error: {
						code: "NOT_FOUND",
						message: "Item not found",
					},
				},
				404,
			);
		}

		const formData = await c.req.formData();

		// Extract form fields (all optional for PATCH)
		const name = formData.get("name") as string | null;
		const description = formData.get("description") as string | null;
		const category = formData.get("category") as string | null;
		const keywords = formData.get("keywords") as string | null;
		const location = formData.get("location") as string | null;
		const dateFound = formData.get("dateFound") as string | null;
		const status = formData.get("status") as string | null;
		const hideLocationStr = formData.get("hideLocation") as string | null;
		const hideDateFoundStr = formData.get("hideDateFound") as string | null;

		// Extract security questions (JSON string)
		const securityQuestionsJson = formData.get("securityQuestions") as
			| string
			| null;
		let securityQuestions: unknown;
		if (securityQuestionsJson) {
			try {
				securityQuestions = JSON.parse(securityQuestionsJson);
			} catch {
				return c.json(
					{
						success: false,
						error: {
							code: "VALIDATION_ERROR",
							message: "Invalid security questions format",
						},
					},
					400,
				);
			}
		}

		// Extract images (multiple files)
		const images: File[] = [];
		for (const [key, value] of formData.entries()) {
			if (
				key.startsWith("image") &&
				typeof value === "object" &&
				value !== null &&
				"size" in value &&
				(value as File).size > 0
			) {
				images.push(value as File);
			}
		}

		// Build update object with only provided fields
		const updateData: Record<string, unknown> = {};
		if (name) updateData.name = name;
		if (description) updateData.description = description;
		if (category) updateData.category = category;
		if (keywords) updateData.keywords = keywords;
		if (location) updateData.location = location;
		if (dateFound) updateData.dateFound = dateFound;
		if (status) updateData.status = status;
		if (images.length > 0) updateData.images = images;
		if (securityQuestionsJson) updateData.securityQuestions = securityQuestions;
		if (hideLocationStr !== null)
			updateData.hideLocation = hideLocationStr === "true";
		if (hideDateFoundStr !== null)
			updateData.hideDateFound = hideDateFoundStr === "true";

		// Validate update data
		const validationResult = updateItemWithSecuritySchema.safeParse(updateData);

		if (!validationResult.success) {
			return c.json(
				{
					success: false,
					error: {
						code: "VALIDATION_ERROR",
						message: "Invalid input data",
						details: validationResult.error.issues,
					},
				},
				400,
			);
		}

		// Build update input with proper typing
		const updateInput: {
			name?: string;
			description?: string;
			categoryId?: number | null;
			keywords?: string;
			location?: string;
			dateFound?: Date;
			status?: "unclaimed" | "claimed" | "returned" | "archived";
			images?: File[];
			securityQuestions?: Array<{
				questionText: string;
				questionType: "multiple_choice" | "free_text";
				options?: string[];
				answer: string;
				displayOrder?: number;
			}>;
			hideLocation?: boolean;
			hideDateFound?: boolean;
		} = {};

		// Add validated fields
		if (validationResult.data.name)
			updateInput.name = validationResult.data.name;
		if (validationResult.data.description)
			updateInput.description = validationResult.data.description;
		if (validationResult.data.keywords)
			updateInput.keywords = validationResult.data.keywords;
		if (validationResult.data.location)
			updateInput.location = validationResult.data.location;
		if (validationResult.data.dateFound)
			updateInput.dateFound = validationResult.data.dateFound;
		if (validationResult.data.status)
			updateInput.status = validationResult.data.status as
				| "unclaimed"
				| "claimed"
				| "returned"
				| "archived";
		if (validationResult.data.category) {
			updateInput.categoryId = Number.parseInt(
				validationResult.data.category,
				10,
			);
		}
		if (validationResult.data.images)
			updateInput.images = validationResult.data.images;
		if (validationResult.data.securityQuestions !== undefined)
			updateInput.securityQuestions = validationResult.data.securityQuestions;
		if (validationResult.data.hideLocation !== undefined)
			updateInput.hideLocation = validationResult.data.hideLocation;
		if (validationResult.data.hideDateFound !== undefined)
			updateInput.hideDateFound = validationResult.data.hideDateFound;

		// If status is being updated, use the status update method to track history
		if (updateInput.status && updateInput.status !== existingItem.status) {
			await itemsService.updateItemStatus(id, {
				status: updateInput.status,
				notes: `Status updated to ${updateInput.status}`,
				changedById: user.id,
			});

			// Update other fields if provided
			const { status: _, ...otherFields } = updateInput;
			if (Object.keys(otherFields).length > 0) {
				await itemsService.updateItem(id, otherFields);
			}
		} else {
			// Update item without status change
			await itemsService.updateItem(id, updateInput);
		}

		// Fetch the final updated item with decrypted security questions
		const finalItem = await itemsService.getItemWithDecryptedSecurity(id);

		return c.json({
			success: true,
			data: finalItem,
			message: "Item updated successfully",
		});
	} catch (error) {
		console.error("Error updating item:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Failed to update item";
		const isStorageError =
			errorMessage.includes("upload") ||
			errorMessage.includes("storage") ||
			errorMessage.includes("Supabase") ||
			errorMessage.includes("delete");

		return c.json(
			{
				success: false,
				error: {
					code: isStorageError ? "STORAGE_ERROR" : "UPDATE_ERROR",
					message: errorMessage,
				},
			},
			isStorageError ? 400 : 500,
		);
	}
});

/**
 * GET /api/admin/items/:id/security-questions
 * Get security questions with decrypted answers for an item
 * Requires authentication
 */
adminItems.get(
	"/:id/security-questions",
	zValidator("param", itemIdSchema),
	async (c) => {
		try {
			const { id } = c.req.valid("param");

			// Check if item exists
			const existingItem = await itemsService.getItemById(id);
			if (!existingItem) {
				return c.json(
					{
						success: false,
						error: {
							code: "NOT_FOUND",
							message: "Item not found",
						},
					},
					404,
				);
			}

			// Get security questions with decrypted answers
			const questions =
				await securityQuestionsService.getQuestionsWithAnswers(id);

			return c.json({
				success: true,
				data: questions,
			});
		} catch (error) {
			console.error("Error fetching security questions:", error);

			// Handle decryption errors
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to fetch security questions";
			const isDecryptionError = errorMessage.includes("decrypt");

			return c.json(
				{
					success: false,
					error: {
						code: isDecryptionError ? "DECRYPTION_ERROR" : "FETCH_ERROR",
						message: errorMessage,
					},
				},
				500,
			);
		}
	},
);

/**
 * PUT /api/admin/items/:id/security-questions
 * Replace all security questions for an item
 * Requires authentication
 */
adminItems.put(
	"/:id/security-questions",
	zValidator("param", itemIdSchema),
	async (c) => {
		try {
			const user = getAuthUser(c);
			const { id } = c.req.valid("param");

			// Check if item exists
			const existingItem = await itemsService.getItemById(id);
			if (!existingItem) {
				return c.json(
					{
						success: false,
						error: {
							code: "NOT_FOUND",
							message: "Item not found",
						},
					},
					404,
				);
			}

			// Parse request body
			const body = await c.req.json();

			// Validate security questions
			const validationResult = securityQuestionsArraySchema.safeParse(
				body.securityQuestions || body,
			);

			if (!validationResult.success) {
				return c.json(
					{
						success: false,
						error: {
							code: "VALIDATION_ERROR",
							message: "Invalid security questions data",
							details: validationResult.error.issues,
						},
					},
					400,
				);
			}

			// Update security questions
			await securityQuestionsService.updateQuestions(
				id,
				validationResult.data,
				user.id,
			);

			// Get updated questions with decrypted answers
			const updatedQuestions =
				await securityQuestionsService.getQuestionsWithAnswers(id);

			return c.json({
				success: true,
				data: updatedQuestions,
				message: "Security questions updated successfully",
			});
		} catch (error) {
			console.error("Error updating security questions:", error);

			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update security questions";
			const isEncryptionError = errorMessage.includes("encrypt");

			return c.json(
				{
					success: false,
					error: {
						code: isEncryptionError ? "ENCRYPTION_ERROR" : "UPDATE_ERROR",
						message: errorMessage,
					},
				},
				500,
			);
		}
	},
);

export default adminItems;
