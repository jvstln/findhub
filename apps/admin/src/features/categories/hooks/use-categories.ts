import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/get-categories";

/**
 * Query key factory for categories queries
 */
export const categoriesKeys = {
	all: ["categories"] as const,
	lists: () => [...categoriesKeys.all, "list"] as const,
	list: () => [...categoriesKeys.lists()] as const,
};

/**
 * Hook to fetch all item categories
 * @returns Query result with categories data
 */
export function useCategories() {
	return useQuery({
		queryKey: categoriesKeys.list(),
		queryFn: getCategories,
		// Categories don't change often, so we can cache them longer
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Keep data in cache for offline access
		gcTime: 60 * 60 * 1000, // 1 hour
		// Refetch when coming back online
		refetchOnReconnect: true,
	});
}
