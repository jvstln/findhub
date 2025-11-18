import { db, itemStatusHistory, lostItem } from "@findhub/db";
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
	ItemStatus,
	LostItem,
	SearchFilters,
	StatusHistoryEntry,
} from "@findhub/shared/types/item";
import { deleteItemImage, uploadItemImage } from "./upload.service";

export interface CreateItemInput {
	name: string;
	description: string;
	categoryId?: number | null;
	keywords?: string;
	location: string;
	dateFound: Date;
	image?: File;
	createdById: string;
}

export interface UpdateItemInput {
	name?: string;
	description?: string;
	categoryId?: number | null;
	keywords?: string;
	location?: string;
	dateFound?: Date;
	image?: File;
	status?: ItemStatus;
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
	): Promise<PaginatedResponse<LostItem>> {
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
					ilike(lostItem.name, keywordPattern),
					ilike(lostItem.description, keywordPattern),
					ilike(lostItem.keywords, keywordPattern),
				),
			);
		}

		// Category filter
		if (category) {
			// Convert string to number if needed (category can be ID or name)
			const categoryId =
				typeof category === "string" ? Number.parseInt(category, 10) : category;
			if (!Number.isNaN(categoryId)) {
				conditions.push(eq(lostItem.categoryId, categoryId));
			}
		}

		// Location filter
		if (location) {
			conditions.push(ilike(lostItem.location, `%${location}%`));
		}

		// Status filter
		if (status) {
			conditions.push(eq(lostItem.status, status));
		}

		// Date range filters
		if (dateFrom) {
			conditions.push(gte(lostItem.dateFound, dateFrom));
		}

		if (dateTo) {
			conditions.push(lte(lostItem.dateFound, dateTo));
		}

		// Combine all conditions
		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Calculate offset
		const offset = (page - 1) * pageSize;

		// Execute query with pagination
		const [items, countResult] = await Promise.all([
			db
				.select()
				.from(lostItem)
				.where(whereClause)
				.orderBy(desc(lostItem.createdAt))
				.limit(pageSize)
				.offset(offset),
			db
				.select({ count: sql<number>`count(*)::int` })
				.from(lostItem)
				.where(whereClause),
		]);

		const total = countResult[0]?.count || 0;
		const totalPages = Math.ceil(total / pageSize);

		return {
			data: items,
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
			.from(lostItem)
			.where(eq(lostItem.id, id))
			.limit(1);

		return items[0] || null;
	}

	/**
	 * Create a new lost item with optional image upload to Supabase Storage
	 */
	async createItem(input: CreateItemInput): Promise<LostItem> {
		let imageUrl: string | undefined;
		let imageKey: string | undefined;

		// Upload image to Supabase Storage if provided
		if (input.image) {
			try {
				const uploadResult = await uploadItemImage(input.image);
				imageUrl = uploadResult.url;
				imageKey = uploadResult.key;
			} catch (error) {
				// Re-throw with more context
				throw new Error(
					`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}

		try {
			const [item] = await db
				.insert(lostItem)
				.values({
					name: input.name,
					description: input.description,
					categoryId: input.categoryId,
					keywords: input.keywords,
					location: input.location,
					dateFound: input.dateFound,
					imageUrl,
					imageKey,
					createdById: input.createdById,
					status: "unclaimed",
				})
				.returning();

			if (!item) {
				throw new Error("Failed to create item");
			}

			return item;
		} catch (error) {
			// Cleanup uploaded image if database insert fails
			if (imageKey) {
				try {
					await deleteItemImage(imageKey);
				} catch (cleanupError) {
					// Log cleanup error but don't throw - the main error is more important
					console.error("Failed to cleanup uploaded image:", cleanupError);
				}
			}
			throw error;
		}
	}

	/**
	 * Update an existing item with optional image replacement
	 */
	async updateItem(
		id: number,
		input: UpdateItemInput,
	): Promise<LostItem | null> {
		// Get current item to access old image key
		const currentItem = await this.getItemById(id);

		if (!currentItem) {
			return null;
		}

		let imageUrl: string | undefined;
		let imageKey: string | undefined;
		let oldImageKey: string | undefined;

		// Handle image replacement if new image provided
		if (input.image) {
			try {
				// Upload new image
				const uploadResult = await uploadItemImage(input.image);
				imageUrl = uploadResult.url;
				imageKey = uploadResult.key;

				// Store old image key for cleanup after successful update
				oldImageKey = currentItem.imageKey || undefined;
			} catch (error) {
				throw new Error(
					`Failed to upload new image: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}

		try {
			// Prepare update data
			const updateData: Record<string, unknown> = {
				...input,
				updatedAt: new Date(),
			};

			// Remove the image field from update data (it's a File object, not a DB field)
			delete updateData.image;

			// Add new image URL and key if uploaded
			if (imageUrl && imageKey) {
				updateData.imageUrl = imageUrl;
				updateData.imageKey = imageKey;
			}

			const [item] = await db
				.update(lostItem)
				.set(updateData)
				.where(eq(lostItem.id, id))
				.returning();

			// Delete old image from Supabase Storage if update was successful and new image was uploaded
			if (item && oldImageKey) {
				try {
					await deleteItemImage(oldImageKey);
				} catch (cleanupError) {
					// Log cleanup error but don't throw - the update was successful
					console.error("Failed to delete old image:", cleanupError);
				}
			}

			return item || null;
		} catch (error) {
			// Cleanup newly uploaded image if database update fails
			if (imageKey) {
				try {
					await deleteItemImage(imageKey);
				} catch (cleanupError) {
					console.error("Failed to cleanup uploaded image:", cleanupError);
				}
			}
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
			.update(lostItem)
			.set({
				status: statusUpdate.status,
				updatedAt: new Date(),
			})
			.where(eq(lostItem.id, id))
			.returning();

		if (!updatedItem) {
			return null;
		}

		// Create status history entry
		await db.insert(itemStatusHistory).values({
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
			.from(itemStatusHistory)
			.where(eq(itemStatusHistory.itemId, itemId))
			.orderBy(desc(itemStatusHistory.changedAt));

		return history;
	}

	/**
	 * Soft delete an item (mark as archived) and cleanup Supabase Storage
	 */
	async deleteItem(id: number, userId: string): Promise<boolean> {
		// Get current item to access image key
		const currentItem = await this.getItemById(id);

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

		// Delete image from Supabase Storage if exists
		if (currentItem.imageKey) {
			try {
				await deleteItemImage(currentItem.imageKey);
			} catch (error) {
				// Log error but don't fail the delete operation
				console.error(
					`Failed to delete image for item ${id}:`,
					error instanceof Error ? error.message : "Unknown error",
				);
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
				unclaimed: sql<number>`count(*) filter (where ${lostItem.status} = 'unclaimed')::int`,
				claimed: sql<number>`count(*) filter (where ${lostItem.status} = 'claimed')::int`,
				returned: sql<number>`count(*) filter (where ${lostItem.status} = 'returned')::int`,
			})
			.from(lostItem)
			.where(sql`${lostItem.status} != 'archived'`);

		return stats;
	}
}

// Export singleton instance
export const itemsService = new ItemsService();
