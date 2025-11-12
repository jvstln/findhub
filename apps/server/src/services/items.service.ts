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

export interface CreateItemInput {
	name: string;
	description: string;
	category: string;
	keywords?: string;
	location: string;
	dateFound: Date;
	imageUrl?: string;
	imageKey?: string;
	createdById: string;
}

export interface UpdateItemInput {
	name?: string;
	description?: string;
	category?: string;
	keywords?: string;
	location?: string;
	dateFound?: Date;
	imageUrl?: string;
	imageKey?: string;
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
			conditions.push(eq(lostItem.category, category));
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
	 * Create a new lost item
	 */
	async createItem(input: CreateItemInput): Promise<LostItem> {
		const [item] = await db
			.insert(lostItem)
			.values({
				name: input.name,
				description: input.description,
				category: input.category,
				keywords: input.keywords,
				location: input.location,
				dateFound: input.dateFound,
				imageUrl: input.imageUrl,
				imageKey: input.imageKey,
				createdById: input.createdById,
				status: "unclaimed",
			})
			.returning();

		if (!item) {
			throw new Error("Failed to create item");
		}

		return item;
	}

	/**
	 * Update an existing item
	 */
	async updateItem(
		id: number,
		input: UpdateItemInput,
	): Promise<LostItem | null> {
		const [item] = await db
			.update(lostItem)
			.set({
				...input,
				updatedAt: new Date(),
			})
			.where(eq(lostItem.id, id))
			.returning();

		return item || null;
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
	 * Soft delete an item (mark as archived)
	 */
	async deleteItem(id: number, userId: string): Promise<boolean> {
		const result = await this.updateItemStatus(id, {
			status: "archived",
			notes: "Item deleted by admin",
			changedById: userId,
		});

		return result !== null;
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
