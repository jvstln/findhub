import type { PaginatedResponse } from "@findhub/shared/types";
import type { LostItem, SearchFilters } from "@findhub/shared/types/item";
import { get } from "@/lib/api-client";

/**
 * Fetch lost items with optional search filters and pagination
 * @param filters - Search filters including keyword, category, location, status, date range, and pagination
 * @returns Paginated list of lost items
 */
export async function getItems(
	filters?: SearchFilters,
): Promise<PaginatedResponse<LostItem>> {
	const params = new URLSearchParams();

	if (filters?.query) params.append("keyword", filters.query);
	if (filters?.categoryId) params.append("category", filters.categoryId);
	if (filters?.location) params.append("location", filters.location);
	if (filters?.status) params.append("status", filters.status);
	if (filters?.dateFrom)
		params.append("dateFrom", filters.dateFrom.toISOString());
	if (filters?.dateTo) params.append("dateTo", filters.dateTo.toISOString());
	if (filters?.page) params.append("page", filters.page.toString());
	if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString());

	const queryString = params.toString();
	const url = `/api/items${queryString ? `?${queryString}` : ""}`;

	return get<PaginatedResponse<LostItem>>(url);
}
