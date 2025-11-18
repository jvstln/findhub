import type { SearchFilters } from "@findhub/shared/types/item";
import { useCallback, useMemo, useState } from "react";

export interface UseSearchReturn {
	filters: SearchFilters;
	setKeyword: (keyword: string) => void;
	setCategory: (category: string | undefined) => void;
	setLocation: (location: string | undefined) => void;
	setStatus: (status: SearchFilters["status"]) => void;
	setDateFrom: (date: Date | undefined) => void;
	setDateTo: (date: Date | undefined) => void;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	resetFilters: () => void;
	hasActiveFilters: boolean;
}

const defaultFilters: SearchFilters = {
	page: 1,
	pageSize: 20,
};

/**
 * Hook for managing search state and filters
 * Provides setters for individual filter fields and computed state
 */
export function useSearch(
	initialFilters?: Partial<SearchFilters>,
): UseSearchReturn {
	const [filters, setFilters] = useState<SearchFilters>({
		...defaultFilters,
		...initialFilters,
	});

	const setKeyword = useCallback((keyword: string) => {
		setFilters((prev) => ({
			...prev,
			query: keyword.trim() || undefined,
			page: 1, // Reset to first page on filter change
		}));
	}, []);

	const setCategory = useCallback((category: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			categoryId: category,
			page: 1,
		}));
	}, []);

	const setLocation = useCallback((location: string | undefined) => {
		setFilters((prev) => ({
			...prev,
			location,
			page: 1,
		}));
	}, []);

	const setStatus = useCallback((status: SearchFilters["status"]) => {
		setFilters((prev) => ({
			...prev,
			status,
			page: 1,
		}));
	}, []);

	const setDateFrom = useCallback((dateFrom: Date | undefined) => {
		setFilters((prev) => ({
			...prev,
			dateFrom,
			page: 1,
		}));
	}, []);

	const setDateTo = useCallback((dateTo: Date | undefined) => {
		setFilters((prev) => ({
			...prev,
			dateTo,
			page: 1,
		}));
	}, []);

	const setPage = useCallback((page: number) => {
		setFilters((prev) => ({
			...prev,
			page,
		}));
	}, []);

	const setPageSize = useCallback((pageSize: number) => {
		setFilters((prev) => ({
			...prev,
			pageSize,
			page: 1, // Reset to first page when changing page size
		}));
	}, []);

	const resetFilters = useCallback(() => {
		setFilters(defaultFilters);
	}, []);

	const hasActiveFilters = useMemo(() => {
		return !!(
			filters.query ||
			filters.categoryId ||
			filters.location ||
			filters.status ||
			filters.dateFrom ||
			filters.dateTo
		);
	}, [filters]);

	return {
		filters,
		setKeyword,
		setCategory,
		setLocation,
		setStatus,
		setDateFrom,
		setDateTo,
		setPage,
		setPageSize,
		resetFilters,
		hasActiveFilters,
	};
}
