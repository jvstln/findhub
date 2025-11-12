import type { StatusHistoryEntry } from "@findhub/shared/types/item";
import { get } from "@/lib/api-client";

/**
 * Fetch the status change history for a lost item
 * @param id - The item ID
 * @returns Array of status history entries
 */
export async function getItemHistory(
	id: number,
): Promise<StatusHistoryEntry[]> {
	return get<StatusHistoryEntry[]>(`/api/items/${id}/history`);
}
