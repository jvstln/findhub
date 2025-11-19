import type {
	ItemCategory,
	UpdateCategoryInput,
} from "@findhub/shared/types/category";
import { patch } from "@findhub/ui/lib/api-client";

/**
 * Update an existing category
 * @param id - Category ID
 * @param input - Updated category data
 * @returns Updated category
 */
export async function updateCategory(
	id: number,
	input: UpdateCategoryInput,
): Promise<ItemCategory> {
	return patch<ItemCategory>(`/api/categories/${id}`, input);
}
