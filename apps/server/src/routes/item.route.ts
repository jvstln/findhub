import {
	createItemSchema,
	itemIdSchema,
	searchFiltersSchema,
	updateItemSchema,
} from "@findhub/shared/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { authMiddleware, getAuthUser } from "../middleware/auth.middleware";
import { itemsService } from "../services/item.service";

const items = new Hono();

/**
 * GET /api/items
 * Public endpoint - Search and filter lost items with pagination
 * Query params: keyword, category, location, status, dateFrom, dateTo, page, pageSize
 * Applies privacy filtering: excludes items from location/date filters when those fields are hidden
 */
items.get("/", zValidator("query", searchFiltersSchema), async (c) => {
	try {
		const filters = c.req.valid("query");
		const result = await itemsService.getPublicItems(filters);

		return c.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("Error searching items:", error);
		return c.json(
			{
				success: false,
				error: {
					code: "SEARCH_ERROR",
					message: "Failed to search items",
				},
			},
			500,
		);
	}
});

/**
 * GET /api/items/:id
 * Public endpoint - Get single item details by ID
 * Applies privacy filtering: hides location/date if privacy controls are enabled
 * Security questions are never included in public responses
 */
items.get("/:id", zValidator("param", itemIdSchema), async (c) => {
	try {
		const { id } = c.req.valid("param");
		const item = await itemsService.getPublicItem(id);

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
		return c.json(
			{
				success: false,
				error: {
					code: "FETCH_ERROR",
					message: "Failed to fetch item",
				},
			},
			500,
		);
	}
});

// ============================================================================
// PROTECTED ROUTES - Require authentication
// ============================================================================

/**
 * POST /api/items
 * Protected endpoint - Create a new lost item with optional image upload
 * Requires authentication
 */
items.post("/", authMiddleware, async (c) => {
	try {
		const user = getAuthUser(c);
		const body = await c.req.parseBody({ all: true });

		const validatedData = createItemSchema.parse(body);

		// Create item with image upload handled by service
		const item = await itemsService.createItem({
			...validatedData,
			createdById: user.id,
		});

		return c.json(
			{
				success: true,
				data: item,
				message: "Item created successfully",
			},
			201,
		);
	} catch (error) {
		console.error("Error creating item:", error);

		// Handle Supabase Storage errors specifically
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
 * PATCH /api/items/:id
 * Protected endpoint - Update an existing item (including status)
 * Requires authentication
 */
items.patch(
	"/:id",
	authMiddleware,
	zValidator("param", itemIdSchema),
	async (c) => {
		try {
			const user = getAuthUser(c);
			const { id } = c.req.valid("param");
			const formData = await c.req.formData();

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

			// Extract form fields (all optional for PATCH)
			const name = formData.get("name") as string | null;
			const description = formData.get("description") as string | null;
			const category = formData.get("category") as string | null;
			const keywords = formData.get("keywords") as string | null;
			const location = formData.get("location") as string | null;
			const dateFound = formData.get("dateFound") as string | null;
			const status = formData.get("status") as string | null;
			const image = formData.get("image") as File | null;

			// Build update object with only provided fields
			const updateData: {
				name?: string;
				description?: string;
				category?: string;
				keywords?: string;
				location?: string;
				dateFound?: string;
				status?: string;
			} = {};
			if (name) updateData.name = name;
			if (description) updateData.description = description;
			if (category) updateData.category = category;
			if (keywords) updateData.keywords = keywords;
			if (location) updateData.location = location;
			if (dateFound) updateData.dateFound = dateFound;
			if (status) updateData.status = status;

			// Validate update data
			const validationResult = updateItemSchema.safeParse(updateData);

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
				image?: File;
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
			if (validationResult.data.categoryId) {
				updateInput.categoryId = Number.parseInt(
					validationResult.data.categoryId,
					10,
				);
			}

			// Add image if provided
			if (image && image.size > 0) {
				updateInput.image = image;
			}

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

				// Fetch the final updated item
				const finalItem = await itemsService.getItemById(id);

				return c.json({
					success: true,
					data: finalItem,
					message: "Item updated successfully",
				});
			}

			// Update item without status change
			const result = await itemsService.updateItem(id, updateInput);

			return c.json({
				success: true,
				data: result,
				message: "Item updated successfully",
			});
		} catch (error) {
			console.error("Error updating item:", error);

			// Handle Supabase Storage errors specifically
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
	},
);

/**
 * DELETE /api/items/:id
 * Protected endpoint - Soft delete an item (mark as archived)
 * Requires authentication
 */
items.delete(
	"/:id",
	authMiddleware,
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

			// Soft delete (mark as archived)
			const success = await itemsService.deleteItem(id, user.id);

			if (!success) {
				return c.json(
					{
						success: false,
						error: {
							code: "DELETE_ERROR",
							message: "Failed to delete item",
						},
					},
					500,
				);
			}

			return c.json({
				success: true,
				message: "Item deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting item:", error);

			// Handle Supabase Storage errors specifically
			const errorMessage =
				error instanceof Error ? error.message : "Failed to delete item";
			const isStorageError =
				errorMessage.includes("storage") || errorMessage.includes("Supabase");

			return c.json(
				{
					success: false,
					error: {
						code: isStorageError ? "STORAGE_ERROR" : "DELETE_ERROR",
						message: errorMessage,
					},
				},
				500,
			);
		}
	},
);

/**
 * GET /api/items/:id/history
 * Protected endpoint - Get status change history for an item
 * Requires authentication
 */
items.get(
	"/:id/history",
	authMiddleware,
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

			// Get status history
			const history = await itemsService.getItemStatusHistory(id);

			return c.json({
				success: true,
				data: history,
			});
		} catch (error) {
			console.error("Error fetching item history:", error);
			return c.json(
				{
					success: false,
					error: {
						code: "FETCH_ERROR",
						message: "Failed to fetch item history",
					},
				},
				500,
			);
		}
	},
);

export default items;
