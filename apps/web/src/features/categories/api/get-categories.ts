import type { ItemCategory } from "@findhub/shared/types/category";
import { get } from "@/lib/api-client";

/**
 * Fetch all categories
 * @returns List of all item categories
 */
export async function getCategories(): Promise<ItemCategory[]> {
	return get<ItemCategory[]>("/api/categories");
}
