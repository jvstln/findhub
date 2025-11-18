import type { LostItemWithImages } from "@findhub/shared/types/item";
import { get } from "@/lib/api-client";

/**
 * Fetch a single lost item by ID
 * @param id - The item ID
 * @returns The lost item details with images
 */
export async function getItem(id: number): Promise<LostItemWithImages> {
	return get<LostItemWithImages>(`/api/items/${id}`);
}
