import { db, itemImages, itemStatusHistories, lostItems } from "@findhub/db";
import {
	and,
	desc,
	eq,
	gte,
	ilike,
	lte,
	or,
	sql,
} from "@findhub/db/drizzle-orm";
import type { PaginatedResponse } from "@findhub/shared/types";
import type {
	ItemImage,
	ItemStatus,
	LostItem,
	LostItemWithImages,
	SearchFilters,
	StatusHistoryEntry,
} from "@findhub/shared/types/item";
import { categoryService } from "./category.service";
import { deleteItemImage, uploadItemImage } from "./upload.service";

export interface CreateItemInput {
	name: string;
	description: string;
	categoryId?: number | null;
	keywords?: string;
	location: string;
	dateFound: Date;
	images?: File[];
	createdById: string;
}

export interface UpdateItemInput {
	name?: string;
	description?: string;
	categoryId?: number | null;
	keywords?: string;
	location?: string;
	dateFound?: Date;
	images?: File[];
	status?: ItemStatus;
}

export interface ImageUploadInput {
	file: File;
	displayOrder?: number;
}

export interface StatusUpdateInput {
	status: ItemStatus;
	notes?: string;
	changedById: string;
}

export class ItemsService {
	/**
	 * Search and filter lost items with pagination
	 */
	async searchItems(
		filters: SearchFilters,
	): Promise<PaginatedResponse<LostItemWithImages>> {
		const {
			keyword,
			category,
			location,
			status,
			dateFrom,
			dateTo,
			page = 1,
			pageSize = 20,
		} = filters;

		// Build WHERE conditions
		const conditions = [];

		// Keyword search (name, description, or keywords)
		if (keyword) {
			const keywordPattern = `%${keyword}%`;
			conditions.push(
				or(
					ilike(lostItems.name, keywordPattern),
					ilike(lostItems.description, keywordPattern),
					ilike(lostItems.keywords, keywordPattern),
				),
			);
		}

		// Category filter
		if (category) {
			// Convert string to number if needed (category can be ID or name)
			const categoryId =
				typeof category === "string" ? Number.parseInt(category, 10) : category;
			if (!Number.isNaN(categoryId)) {
				conditions.push(eq(lostItems.categoryId, categoryId));
			}
		}

		// Location filter
		if (location) {
			conditions.push(ilike(lostItems.location, `%${location}%`));
		}

		// Status filter
		if (status) {
			conditions.push(eq(lostItems.status, status));
		}

		// Date range filters
		if (dateFrom) {
			conditions.push(gte(lostItems.dateFound, dateFrom));
		}

		if (dateTo) {
			conditions.push(lte(lostItems.dateFound, dateTo));
		}

		// Combine all conditions
		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Calculate offset
		const offset = (page - 1) * pageSize;

		// Execute query with pagination
		const [items, countResult] = await Promise.all([
			db
				.select()
				.from(lostItems)
				.where(whereClause)
				.orderBy(desc(lostItems.createdAt))
				.limit(pageSize)
				.offset(offset),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(lostItems)
				.where(whereClause),
		]);

		// Get images for all items
		const itemIds = items.map((item) => item.id);
		const images =
			itemIds.length > 0
				? await db
						.select()
						.from(itemImages)
						.where(sql`${itemImages.itemId} = ANY(${itemIds})`)
						.orderBy(itemImages.displayOrder)
				: [];

		// Group images by item ID
		const imagesByItemId = images.reduce(
			(acc, image) => {
				const itemImages = acc[image.itemId] || [];
				itemImages.push(image);
				acc[image.itemId] = itemImages;
				return acc;
			},
			{} as Record<number, ItemImage[]>,
		);

		// Combine items with their images
		const itemsWithImages: LostItemWithImages[] = items.map((item) => ({
			...item,
			images: imagesByItemId[item.id] || [],
		}));

		const total = countResult[0]?.count || 0;
		const totalPages = Math.ceil(total / pageSize);

		return {
			data: itemsWithImages,
			total,
			page,
			pageSize,
			totalPages,
		};
	}

	/**
	 * Get a single item by ID
	 */
	async getItemById(id: number): Promise<LostItem | null> {
		const items = await db
			.select()
			.from(lostItems)
			.where(eq(lostItems.id, id))
			.limit(1);

		return items[0] || null;
	}

	/**
	 * Get a single item by ID with images
	 */
	async getItemByIdWithImages(id: number): Promise<LostItemWithImages | null> {
		const item = await this.getItemById(id);

		if (!item) {
			return null;
		}

		const images = await db
			.select()
			.from(itemImages)
			.where(eq(itemImages.itemId, id))
			.orderBy(itemImages.displayOrder);

		return {
			...item,
			images,
		};
	}

	/**
	 * Create a new lost item with optional multiple image uploads to Supabase Storage
	 */
	async createItem(input: CreateItemInput): Promise<LostItemWithImages> {
		// Validate category exists if provided
		if (input.categoryId) {
			const category = await categoryService.getCategoryById(input.categoryId);
			if (!category) {
				throw new Error(
					`Invalid category: Category with ID ${input.categoryId} does not exist`,
				);
			}
		}

		const uploadedImages: Array<{ url: string; key: string; file: File }> = [];

		// Upload images to Supabase Storage if provided
		if (input.images && input.images.length > 0) {
			try {
				for (const image of input.images) {
					const uploadResult = await uploadItemImage(image);
					uploadedImages.push({
						url: uploadResult.url,
						key: uploadResult.key,
						file: image,
					});
				}
			} catch (error) {
				// Cleanup any uploaded images if upload fails
				for (const uploaded of uploadedImages) {
					try {
						await deleteItemImage(uploaded.key);
					} catch (cleanupError) {
						console.error("Failed to cleanup uploaded image:", cleanupError);
					}
				}
				throw new Error(
					`Failed to upload images: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}

		try {
			// Create the item first
			const [item] = await db
				.insert(lostItems)
				.values({
					name: input.name,
					description: input.description,
					categoryId: input.categoryId,
					keywords: input.keywords,
					location: input.location,
					dateFound: input.dateFound,
					createdById: input.createdById,
					status: "unclaimed",
				})
				.returning();

			if (!item) {
				throw new Error("Failed to create item");
			}

			// Insert images if any were uploaded
			const images: ItemImage[] = [];
			if (uploadedImages.length > 0) {
				const imageInserts = uploadedImages.map((uploaded, index) => ({
					itemId: item.id,
					url: uploaded.url,
					key: uploaded.key,
					filename: uploaded.file.name,
					mimeType: uploaded.file.type,
					size: uploaded.file.size,
					displayOrder: index,
					uploadedById: input.createdById,
				}));

				const insertedImages = await db
					.insert(itemImages)
					.values(imageInserts)
					.returning();

				images.push(...insertedImages);
			}

			return {
				...item,
				images,
			};
		} catch (error) {
			// Cleanup uploaded images if database insert fails
			for (const uploaded of uploadedImages) {
				try {
					await deleteItemImage(uploaded.key);
				} catch (cleanupError) {
					console.error("Failed to cleanup uploaded image:", cleanupError);
				}
			}
			throw error;
		}
	}

	/**
	 * Add images to an existing item
	 */
	async addItemImages(
		itemId: number,
		images: File[],
		uploadedById: string,
	): Promise<ItemImage[]> {
		// Verify item exists
		const item = await this.getItemById(itemId);
		if (!item) {
			throw new Error("Item not found");
		}

		// Get current max display order
		const [maxOrderResult] = await db
			.select({ maxOrder: sql<number>`COALESCE(MAX(display_order), -1)` })
			.from(itemImages)
			.where(eq(itemImages.itemId, itemId));

		const currentMaxOrder = maxOrderResult?.maxOrder ?? -1;

		const uploadedImages: Array<{ url: string; key: string; file: File }> = [];

		try {
			// Upload all images first
			for (const image of images) {
				const uploadResult = await uploadItemImage(image);
				uploadedImages.push({
					url: uploadResult.url,
					key: uploadResult.key,
					file: image,
				});
			}

			// Insert image records
			const imageInserts = uploadedImages.map((uploaded, index) => ({
				itemId,
				url: uploaded.url,
				key: uploaded.key,
				filename: uploaded.file.name,
				mimeType: uploaded.file.type,
				size: uploaded.file.size,
				displayOrder: currentMaxOrder + index + 1,
				uploadedById,
			}));

			const insertedImages = await db
				.insert(itemImages)
				.values(imageInserts)
				.returning();

			return insertedImages;
		} catch (error) {
			// Cleanup uploaded images if database insert fails
			for (const uploaded of uploadedImages) {
				try {
					await deleteItemImage(uploaded.key);
				} catch (cleanupError) {
					console.error("Failed to cleanup uploaded image:", cleanupError);
				}
			}
			throw error;
		}
	}

	/**
	 * Delete an image from an item
	 */
	async deleteItemImage(imageId: number): Promise<boolean> {
		// Get image details for cleanup
		const [image] = await db
			.select()
			.from(itemImages)
			.where(eq(itemImages.id, imageId))
			.limit(1);

		if (!image) {
			return false;
		}

		try {
			// Delete from database first
			await db.delete(itemImages).where(eq(itemImages.id, imageId));

			// Delete from storage
			if (image.key) {
				try {
					await deleteItemImage(image.key);
				} catch (storageError) {
					console.error("Failed to delete image from storage:", storageError);
					// Don't fail the operation if storage cleanup fails
				}
			}

			return true;
		} catch (error) {
			console.error("Failed to delete image:", error);
			return false;
		}
	}

	/**
	 * Update image display order
	 */
	async updateImageOrder(
		imageId: number,
		displayOrder: number,
	): Promise<ItemImage | null> {
		const [updatedImage] = await db
			.update(itemImages)
			.set({ displayOrder, updatedAt: new Date() })
			.where(eq(itemImages.id, imageId))
			.returning();

		return updatedImage || null;
	}

	/**
	 * Update an existing item with optional image replacement
	 */
	async updateItem(
		id: number,
		input: UpdateItemInput,
	): Promise<LostItemWithImages | null> {
		// Get current item
		const currentItem = await this.getItemById(id);

		if (!currentItem) {
			return null;
		}

		// Validate category exists if provided
		if (input.categoryId !== undefined && input.categoryId !== null) {
			const category = await categoryService.getCategoryById(input.categoryId);
			if (!category) {
				throw new Error(
					`Invalid category: Category with ID ${input.categoryId} does not exist`,
				);
			}
		}

		try {
			// Prepare update data (exclude images as they're handled separately)
			const updateData: Record<string, unknown> = {
				...input,
				updatedAt: new Date(),
			};

			// Remove the images field from update data (it's a File array, not a DB field)
			delete updateData.images;

			const [item] = await db
				.update(lostItems)
				.set(updateData)
				.where(eq(lostItems.id, id))
				.returning();

			if (!item) {
				return null;
			}

			// Handle new images if provided
			if (input.images && input.images.length > 0) {
				await this.addItemImages(id, input.images, item.createdById);
			}

			// Return item with images
			return await this.getItemByIdWithImages(id);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update item status and create history entry
	 */
	async updateItemStatus(
		id: number,
		statusUpdate: StatusUpdateInput,
	): Promise<LostItem | null> {
		// Get current item to track previous status
		const currentItem = await this.getItemById(id);

		if (!currentItem) {
			return null;
		}

		// Update item status
		const [updatedItem] = await db
			.update(lostItems)
			.set({
				status: statusUpdate.status,
				updatedAt: new Date(),
			})
			.where(eq(lostItems.id, id))
			.returning();

		if (!updatedItem) {
			return null;
		}

		// Create status history entry
		await db.insert(itemStatusHistories).values({
			itemId: id,
			previousStatus: currentItem.status,
			newStatus: statusUpdate.status,
			changedById: statusUpdate.changedById,
			notes: statusUpdate.notes,
		});

		return updatedItem;
	}

	/**
	 * Get status history for an item
	 */
	async getItemStatusHistory(itemId: number): Promise<StatusHistoryEntry[]> {
		const history = await db
			.select()
			.from(itemStatusHistories)
			.where(eq(itemStatusHistories.itemId, itemId))
			.orderBy(desc(itemStatusHistories.createdAt));

		return history;
	}

	/**
	 * Soft delete an item (mark as archived) and cleanup Supabase Storage
	 */
	async deleteItem(id: number, userId: string): Promise<boolean> {
		// Get current item with images
		const currentItem = await this.getItemByIdWithImages(id);

		if (!currentItem) {
			return false;
		}

		// Update status to archived
		const result = await this.updateItemStatus(id, {
			status: "archived",
			notes: "Item deleted by admin",
			changedById: userId,
		});

		if (!result) {
			return false;
		}

		// Delete all images from Supabase Storage
		if (currentItem.images && currentItem.images.length > 0) {
			for (const image of currentItem.images) {
				try {
					await deleteItemImage(image.key);
				} catch (error) {
					// Log error but don't fail the delete operation
					console.error(
						`Failed to delete image ${image.id} for item ${id}:`,
						error instanceof Error ? error.message : "Unknown error",
					);
				}
			}
		}

		return true;
	}

	/**
	 * Get dashboard statistics
	 */
	async getDashboardStats() {
		const [stats] = await db
			.select({
				total: sql<number>`count(*)::int`,
				unclaimed: sql<number>`count(*) filter (where ${lostItems.status} = 'unclaimed')::int`,
				claimed: sql<number>`count(*) filter (where ${lostItems.status} = 'claimed')::int`,
				returned: sql<number>`count(*) filter (where ${lostItems.status} = 'returned')::int`,
			})
			.from(lostItems)
			.where(sql`${lostItems.status} != 'archived'`);

		return stats;
	}
}

// Export singleton instance
export const itemsService = new ItemsService();
