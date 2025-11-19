import type { PublicLostItem } from "@findhub/shared/types/item";
import { get } from "@findhub/ui/lib/api-client";

/**
 * Fetch a single lost item by ID (public view with privacy filtering)
 * @param id - The item ID
 * @returns The lost item details with privacy filtering applied
 */
export async function getItem(id: number): Promise<PublicLostItem> {
	return get<PublicLostItem>(`/api/items/${id}`);
}
