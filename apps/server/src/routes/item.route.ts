import {
	createItemSchema,
	itemIdSchema,
	searchFiltersSchema,
	updateItemSchema,
} from "@findhub/shared/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteFile, saveFile } from "../lib/upload";
import { authMiddleware, getAuthUser } from "../middleware/auth.middleware";
import { itemsService } from "../services/item.service";

const items = new Hono();

/**
 * GET /api/items
 * Public endpoint - Search and filter lost items with pagination
 * Query params: keyword, category, location, status, dateFrom, dateTo, page, pageSize
 */
items.get("/", zValidator("query", searchFiltersSchema), async (c) => {
	try {
		const filters = c.req.valid("query");
		const result = await itemsService.searchItems(filters);

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
 */
items.get("/:id", zValidator("param", itemIdSchema), async (c) => {
	try {
		const { id } = c.req.valid("param");
		const item = await itemsService.getItemById(id);

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
		const formData = await c.req.formData();

		// Extract form fields
		const name = formData.get("name") as string;
		const description = formData.get("description") as string;
		const category = formData.get("category") as string;
		const keywords = formData.get("keywords") as string | undefined;
		const location = formData.get("location") as string;
		const dateFound = formData.get("dateFound") as string;
		const image = formData.get("image") as File | null;

		// Validate input data
		const validationResult = createItemSchema.safeParse({
			name,
			description,
			category,
			keywords,
			location,
			dateFound,
			image: image || undefined,
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

		// Handle image upload if provided
		let imageUrl: string | undefined;
		let imageKey: string | undefined;

		if (image && image.size > 0) {
			try {
				const uploadResult = await saveFile(image);
				imageUrl = uploadResult.url;
				imageKey = uploadResult.key;
			} catch (uploadError) {
				console.error("Image upload error:", uploadError);
				return c.json(
					{
						success: false,
						error: {
							code: "UPLOAD_ERROR",
							message:
								uploadError instanceof Error
									? uploadError.message
									: "Failed to upload image",
						},
					},
					400,
				);
			}
		}

		// Create item
		const item = await itemsService.createItem({
			name: validationResult.data.name,
			description: validationResult.data.description,
			category: validationResult.data.category,
			keywords: validationResult.data.keywords,
			location: validationResult.data.location,
			dateFound: validationResult.data.dateFound,
			imageUrl,
			imageKey,
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
		return c.json(
			{
				success: false,
				error: {
					code: "CREATE_ERROR",
					message: "Failed to create item",
				},
			},
			500,
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

			// Prepare update input with proper typing
			let imageUrl: string | undefined;
			let imageKey: string | undefined;

			// Handle image upload if provided
			if (image && image.size > 0) {
				try {
					// Delete old image if exists
					if (existingItem.imageKey) {
						await deleteFile(existingItem.imageKey);
					}

					// Upload new image
					const uploadResult = await saveFile(image);
					imageUrl = uploadResult.url;
					imageKey = uploadResult.key;
				} catch (uploadError) {
					console.error("Image upload error:", uploadError);
					return c.json(
						{
							success: false,
							error: {
								code: "UPLOAD_ERROR",
								message:
									uploadError instanceof Error
										? uploadError.message
										: "Failed to upload image",
							},
						},
						400,
					);
				}
			}

			// Build final update input
			const updateInput = {
				...validationResult.data,
				...(imageUrl && { imageUrl }),
				...(imageKey && { imageKey }),
			};

			// If status is being updated, use the status update method to track history
			if (
				validationResult.data.status &&
				validationResult.data.status !== existingItem.status
			) {
				await itemsService.updateItemStatus(id, {
					status: validationResult.data.status,
					notes: `Status updated to ${validationResult.data.status}`,
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
			return c.json(
				{
					success: false,
					error: {
						code: "UPDATE_ERROR",
						message: "Failed to update item",
					},
				},
				500,
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
