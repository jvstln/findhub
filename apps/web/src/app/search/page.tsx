"use client";

import { motion } from "motion/react";
import { CachedDataBadge } from "@/components/cached-data-badge";
import { ErrorState } from "@/components/error-state";
import { QueryErrorBoundary } from "@/components/query-error-boundary";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useItems } from "@/features/items/hooks/use-items";
import { SearchBar } from "@/features/search/components/search-bar";
import { SearchFilters } from "@/features/search/components/search-filters";
import { SearchResults } from "@/features/search/components/search-results";
import { useSearch } from "@/features/search/hooks/use-search";
import { useOnlineStatus } from "@findhub/ui/hooks";

// Common locations for filtering
const COMMON_LOCATIONS = [
	"Library",
	"Cafeteria",
	"Gym",
	"Classroom",
	"Parking Lot",
	"Student Center",
	"Dormitory",
	"Other",
];

export default function SearchPage() {
	const {
		filters,
		setKeyword,
		setCategory,
		setLocation,
		setStatus,
		setDateFrom,
		setDateTo,
		setPage,
		resetFilters,
		hasActiveFilters,
	} = useSearch();

	const { data, isLoading, error, isFetching, refetch } = useItems(filters);
	const { isOnline } = useOnlineStatus();
	const { data: categories } = useCategories();

	// Default empty response for loading/error states
	const defaultResponse = {
		data: [],
		total: 0,
		page: 1,
		pageSize: 20,
		totalPages: 0,
		offset: 0,
	};

	return (
		<QueryErrorBoundary>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<motion.div
					className="mb-8"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<h1 className="mb-2 font-bold text-3xl">Search Lost Items</h1>
							<p className="text-muted-foreground">
								Find your lost belongings by searching through our database of
								found items
							</p>
						</div>
						<CachedDataBadge show={!isOnline && !isFetching && !!data} />
					</div>
				</motion.div>

				{/* Search Bar */}
				<motion.div
					className="mb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<SearchBar value={filters.query} onChange={setKeyword} />
				</motion.div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
					{/* Filters Sidebar */}
					<motion.aside
						className="lg:col-span-1"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.2 }}
					>
						<SearchFilters
							filters={filters}
							onCategoryChange={setCategory}
							onLocationChange={setLocation}
							onStatusChange={setStatus}
							onDateFromChange={setDateFrom}
							onDateToChange={setDateTo}
							onReset={resetFilters}
							hasActiveFilters={hasActiveFilters}
							categories={categories || []}
							locations={COMMON_LOCATIONS}
						/>
					</motion.aside>

					{/* Results */}
					<motion.main
						className="lg:col-span-3"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.3 }}
					>
						{error ? (
							<ErrorState
								error={error}
								onRetry={() => refetch()}
								title="Failed to load items"
								description="We couldn't load the search results. Please try again."
							/>
						) : (
							<SearchResults
								data={data || defaultResponse}
								isLoading={isLoading}
								isFetching={isFetching}
								hasActiveFilters={hasActiveFilters}
								onPageChange={setPage}
							/>
						)}
					</motion.main>
				</div>
			</div>
		</QueryErrorBoundary>
	);
}
