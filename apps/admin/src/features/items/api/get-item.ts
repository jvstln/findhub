import type { LostItemWithDecryptedSecurity } from "@findhub/shared/types/item";
import { get } from "@findhub/ui/lib/api-client";

/**
 * Fetch a single lost item by ID (admin endpoint with decrypted security questions)
 * @param id - The item ID
 * @returns The lost item details with images and decrypted security questions
 */
export async function getItem(
	id: number,
): Promise<LostItemWithDecryptedSecurity> {
	return get<LostItemWithDecryptedSecurity>(`/api/admin/items/${id}`);
}
