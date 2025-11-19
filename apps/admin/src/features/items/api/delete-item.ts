import { del } from "@findhub/ui/lib/api-client";

/**
 * Response type for delete operation
 */
export interface DeleteResponse {
	success: boolean;
	message?: string;
}

/**
 * Delete a lost item (soft delete)
 * @param id - The item ID to delete
 * @returns Success response
 */
export async function deleteItem(id: number): Promise<DeleteResponse> {
	return del<DeleteResponse>(`/api/items/${id}`);
}
