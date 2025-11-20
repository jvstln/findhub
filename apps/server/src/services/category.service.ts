import { client, db, itemCategories } from "@findhub/db";
import { eq } from "@findhub/db/drizzle-orm";

export interface ItemCategory {
	id: number;
	name: string;
	description: string | null;
}

export interface CreateCategoryInput {
	name: string;
	description?: string;
}

export interface UpdateCategoryInput {
	name?: string;
	description?: string;
}

export class CategoryService {
	/**
	 * Get all categories
	 */
	async getAllCategories(): Promise<ItemCategory[]> {
		const result = await client<ItemCategory[]>`
			SELECT id, name, description 
			FROM item_categories 
			ORDER BY name
		`;

		return result;
	}

	/**
	 * Get a single category by ID
	 */
	async getCategoryById(id: number): Promise<ItemCategory | null> {
		const result = await client<ItemCategory[]>`
			SELECT id, name, description 
			FROM item_categories 
			WHERE id = ${id}
		`;

		return result[0] || null;
	}

	/**
	 * Create a new category
	 */
	async createCategory(input: CreateCategoryInput): Promise<ItemCategory> {
		const result = await client<ItemCategory[]>`
			INSERT INTO item_categories (name, description)
			VALUES (${input.name}, ${input.description || null})
			RETURNING id, name, description
		`;

		const category = result[0];
		if (!category) {
			throw new Error("Failed to create category");
		}

		return category;
	}

	/**
	 * Update an existing category
	 */
	async updateCategory(
		id: number,
		input: UpdateCategoryInput,
	): Promise<ItemCategory | null> {
		// If no updates provided, just return the existing category
		if (input.name === undefined && input.description === undefined) {
			return this.getCategoryById(id);
		}

		// Handle different update scenarios
		let result: ItemCategory[];

		if (input.name !== undefined && input.description !== undefined) {
			result = await client<ItemCategory[]>`
				UPDATE item_categories 
				SET name = ${input.name}, description = ${input.description}
				WHERE id = ${id}
				RETURNING id, name, description
			`;
		} else if (input.name !== undefined) {
			result = await client<ItemCategory[]>`
				UPDATE item_categories 
				SET name = ${input.name}
				WHERE id = ${id}
				RETURNING id, name, description
			`;
		} else if (input.description !== undefined) {
			result = await client<ItemCategory[]>`
				UPDATE item_categories 
				SET description = ${input.description}
				WHERE id = ${id}
				RETURNING id, name, description
			`;
		} else {
			// This shouldn't happen due to the check above, but TypeScript needs it
			return this.getCategoryById(id);
		}

		return result[0] || null;
	}

	/**
	 * Delete a category
	 */
	async deleteCategory(id: number): Promise<boolean> {
		const deletedCategory = await db
			.delete(itemCategories)
			.where(eq(itemCategories.id, id))
			.returning();
		return deletedCategory.length > 0;
	}

	/**
	 * Check if a category is referenced by any items
	 */
	async isCategoryInUse(id: number): Promise<boolean> {
		const item = await db.query.lostItems.findFirst({
			where: (table, { eq }) => eq(table.categoryId, id),
		});

		return !!item;
	}
}

// Export singleton instance
export const categoryService = new CategoryService();
