import { useQuery } from "@tanstack/react-query";
import { getItem } from "../api/get-item";
import { getItemHistory } from "../api/get-item-history";

/**
 * Query key factory for single item queries
 */
export const itemKeys = {
	all: ["item"] as const,
	details: () => [...itemKeys.all, "detail"] as const,
	detail: (id: number) => [...itemKeys.details(), id] as const,
	history: (id: number) => [...itemKeys.detail(id), "history"] as const,
};

/**
 * Hook to fetch a single lost item by ID
 * @param id - The item ID
 * @param options - Additional query options
 * @returns Query result with item data
 */
export function useItem(id: number, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: itemKeys.detail(id),
		queryFn: () => getItem(id),
		enabled: options?.enabled ?? true,
		// Longer stale time for better offline experience
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Keep data in cache longer for offline access
		gcTime: 60 * 60 * 1000, // 1 hour
		// Refetch when coming back online
		refetchOnReconnect: true,
	});
}

/**
 * Hook to fetch status change history for a lost item
 * @param id - The item ID
 * @param options - Additional query options
 * @returns Query result with status history data
 */
export function useItemHistory(id: number, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: itemKeys.history(id),
		queryFn: () => getItemHistory(id),
		enabled: options?.enabled ?? true,
		// Longer stale time for better offline experience
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Keep data in cache longer for offline access
		gcTime: 60 * 60 * 1000, // 1 hour
		// Refetch when coming back online
		refetchOnReconnect: true,
	});
}
