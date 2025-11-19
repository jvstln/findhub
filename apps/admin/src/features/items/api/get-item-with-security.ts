import type { LostItemWithDecryptedSecurity } from "@findhub/db/schemas/items";
import { get } from "@findhub/ui/lib/api-client";

/**
 * Fetch a single lost item by ID with security questions (admin only)
 * @param id - The item ID
 * @returns The lost item details with images and decrypted security questions
 */
export async function getItemWithSecurity(
	id: number,
): Promise<LostItemWithDecryptedSecurity> {
	return get<LostItemWithDecryptedSecurity>(`/api/admin/items/${id}`);
}
