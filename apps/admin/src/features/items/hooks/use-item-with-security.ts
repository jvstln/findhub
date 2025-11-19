import { useQuery } from "@tanstack/react-query";
import { getItemWithSecurity } from "../api/get-item-with-security";

/**
 * Query key factory for item with security queries
 */
export const itemWithSecurityKeys = {
	all: ["item-with-security"] as const,
	details: () => [...itemWithSecurityKeys.all, "detail"] as const,
	detail: (id: number) => [...itemWithSecurityKeys.details(), id] as const,
};

/**
 * Hook to fetch a single lost item by ID with security questions (admin only)
 * @param id - The item ID
 * @param options - Additional query options
 * @returns Query result with item data including security questions
 */
export function useItemWithSecurity(
	id: number,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: itemWithSecurityKeys.detail(id),
		queryFn: () => getItemWithSecurity(id),
		enabled: options?.enabled ?? true,
		// Longer stale time for better offline experience
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Keep data in cache longer for offline access
		gcTime: 60 * 60 * 1000, // 1 hour
		// Refetch when coming back online
		refetchOnReconnect: true,
	});
}
