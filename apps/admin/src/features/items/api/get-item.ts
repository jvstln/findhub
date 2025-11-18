import type { LostItem } from "@findhub/shared/types/item";
import { get } from "@/lib/api-client";

/**
 * Fetch a single lost item by ID
 * @param id - The item ID
 * @returns The lost item details
 */
export async function getItem(id: number): Promise<LostItem> {
	return get<LostItem>(`/api/items/${id}`);
}
