import { del } from "@/lib/api-client";

/**
 * Delete a category
 * @param id - Category ID
 */
export async function deleteCategory(id: number): Promise<void> {
	return del<void>(`/api/categories/${id}`);
}
