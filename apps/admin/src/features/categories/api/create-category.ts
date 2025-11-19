import type {
	CreateCategoryInput,
	ItemCategory,
} from "@findhub/shared/types/category";
import { post } from "@findhub/ui/lib/api-client";

/**
 * Create a new category
 * @param input - Category data
 * @returns Created category
 */
export async function createCategory(
	input: CreateCategoryInput,
): Promise<ItemCategory> {
	return post<ItemCategory>("/api/categories", input);
}
