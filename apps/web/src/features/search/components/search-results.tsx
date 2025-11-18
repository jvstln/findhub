"use client";

import type { PaginatedResponse } from "@findhub/shared/types";
import type { LostItem } from "@findhub/shared/types/item";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemCardSkeleton } from "@/components/ui/item-card-skeleton";
import { ItemGrid } from "@/features/items/components/item-grid";

interface SearchResultsProps {
	data: PaginatedResponse<LostItem>;
	isLoading?: boolean;
	hasActiveFilters?: boolean;
	onPageChange: (page: number) => void;
}

interface EmptyStateMessageProps {
	isLoading: boolean;
	hasActiveFilters: boolean;
	total: number;
}

/**
 * Determines the appropriate empty state message based on loading state,
 * filter state, and data availability
 */
function getEmptyStateMessage({
	isLoading,
	hasActiveFilters,
	total,
}: EmptyStateMessageProps): string {
	if (isLoading) {
		return "Loading results...";
	}

	if (total === 0 && !hasActiveFilters) {
		return "No items in database";
	}

	if (total === 0 && hasActiveFilters) {
		return "No matches found";
	}

	return "Type to search for items";
}

/**
 * Search results component with pagination
 * Displays items in a grid and provides pagination controls
 */
export function SearchResults({
	data,
	isLoading = false,
	hasActiveFilters = false,
	onPageChange,
}: SearchResultsProps) {
	const { data: items, page, totalPages, total } = data;

	const handlePreviousPage = () => {
		if (page > 1) {
			onPageChange(page - 1);
		}
	};

	const handleNextPage = () => {
		if (page < totalPages) {
			onPageChange(page + 1);
		}
	};

	const startItem = (page - 1) * data.pageSize + 1;
	const endItem = Math.min(page * data.pageSize, total);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="text-muted-foreground text-sm">Loading results...</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((id) => (
						<ItemCardSkeleton key={`skeleton-${id}`} />
					))}
				</div>
			</div>
		);
	}

	if (items.length === 0) {
		const message = getEmptyStateMessage({
			isLoading,
			hasActiveFilters,
			total,
		});

		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="font-medium text-lg text-muted-foreground">{message}</p>
				{hasActiveFilters && total === 0 && (
					<p className="mt-2 text-muted-foreground text-sm">
						Try adjusting your search filters or keywords
					</p>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Results count */}
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-sm">
					Showing {startItem}-{endItem} of {total} results
				</p>
			</div>

			{/* Items grid */}
			<ItemGrid items={items} />

			{/* Pagination controls */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handlePreviousPage}
						disabled={page === 1}
					>
						<ChevronLeft className="h-4 w-4" />
						<span className="ml-1">Previous</span>
					</Button>

					<div className="flex items-center gap-1">
						{/* Show page numbers */}
						{Array.from({ length: totalPages }, (_, i) => i + 1)
							.filter((pageNum) => {
								// Show first page, last page, current page, and pages around current
								return (
									pageNum === 1 ||
									pageNum === totalPages ||
									Math.abs(pageNum - page) <= 1
								);
							})
							.map((pageNum, index, array) => {
								// Add ellipsis if there's a gap
								const prevPageNum = array[index - 1];
								const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

								return (
									<div key={pageNum} className="flex items-center gap-1">
										{showEllipsis && (
											<span className="px-2 text-muted-foreground">...</span>
										)}
										<Button
											variant={page === pageNum ? "default" : "outline"}
											size="sm"
											onClick={() => onPageChange(pageNum)}
											className="min-w-10"
										>
											{pageNum}
										</Button>
									</div>
								);
							})}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={handleNextPage}
						disabled={page === totalPages}
					>
						<span className="mr-1">Next</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
