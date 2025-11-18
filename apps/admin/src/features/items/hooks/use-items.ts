import type { SearchFilters } from "@findhub/shared/types/item";
import { useQuery } from "@tanstack/react-query";
import { getItems } from "../api/get-items";

/**
 * Query key factory for items queries
 */
export const itemsKeys = {
	all: ["items"] as const,
	lists: () => [...itemsKeys.all, "list"] as const,
	list: (filters?: SearchFilters) => [...itemsKeys.lists(), filters] as const,
};

/**
 * Hook to fetch paginated list of lost items with optional filters
 * @param filters - Search filters including keyword, category, location, status, date range, and pagination
 * @returns Query result with paginated items data
 */
export function useItems(filters?: SearchFilters) {
	return useQuery({
		queryKey: itemsKeys.list(filters),
		queryFn: () => getItems(filters),
		// Keep previous data while fetching new results for better UX
		placeholderData: (previousData) => previousData,
		// Longer stale time for better offline experience
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Keep data in cache longer for offline access
		gcTime: 60 * 60 * 1000, // 1 hour
		// Refetch when coming back online
		refetchOnReconnect: true,
	});
}
