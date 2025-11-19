"use client";

import type {
	ItemStatus,
	LostItemWithImages,
} from "@findhub/shared/types/item";
import { Package, PackageCheck, PackageX, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@findhub/ui/components/layout/admin";
import { ErrorState } from "@/components/shared/error-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatsCard } from "@/components/shared/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatsCardSkeleton } from "@/components/ui/stats-card-skeleton";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { ItemTable } from "@/features/items/components/item-table";
import {
	useDeleteItem,
	useUpdateItem,
} from "@/features/items/hooks/use-item-mutations";
import { useItems } from "@/features/items/hooks/use-items";

export default function ItemsPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<ItemStatus | "all">("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");

	// Build filters
	const filters = useMemo(
		() => ({
			query: searchQuery || undefined,
			status: statusFilter !== "all" ? statusFilter : undefined,
			categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
			page: 1,
			pageSize: 50,
		}),
		[searchQuery, statusFilter, categoryFilter],
	);

	const { data, isLoading, error } = useItems(filters);
	const { data: categories } = useCategories();
	const deleteItemMutation = useDeleteItem();
	const updateItemMutation = useUpdateItem();

	const handleEdit = (item: LostItemWithImages) => {
		router.push(`/items/${item.id}/edit`);
	};

	const handleDelete = async (item: LostItemWithImages) => {
		try {
			await deleteItemMutation.mutateAsync(item.id);
			toast.success(`"${item.name}" has been deleted`);
		} catch (error) {
			toast.error("Failed to delete item");
			console.error(error);
		}
	};

	const handleStatusChange = async (
		item: LostItemWithImages,
		newStatus: ItemStatus,
	) => {
		try {
			await updateItemMutation.mutateAsync({
				id: item.id,
				data: { status: newStatus },
			});
			toast.success(`Status updated to ${newStatus}`);
		} catch (error) {
			toast.error("Failed to update status");
			console.error(error);
		}
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
		setCategoryFilter("all");
	};

	const hasActiveFilters =
		searchQuery !== "" || statusFilter !== "all" || categoryFilter !== "all";

	// Calculate stats from current filtered data
	const stats = useMemo(() => {
		if (!data?.data) {
			return { total: 0, unclaimed: 0, claimed: 0, returned: 0 };
		}
		return {
			total: data.total,
			unclaimed: data.data.filter((item) => item.status === "unclaimed").length,
			claimed: data.data.filter((item) => item.status === "claimed").length,
			returned: data.data.filter((item) => item.status === "returned").length,
		};
	}, [data]);

	const emptyMessage = hasActiveFilters
		? "No items match your filters"
		: "No items found. Create your first item to get started.";

	return (
		<div className="flex flex-1 flex-col">
			<PageHeader
				title="Items Management"
				description="Manage all lost and found items"
				action={
					<Button asChild>
						<Link href="/items/new">
							<Plus className="mr-2 size-4" />
							Add New Item
						</Link>
					</Button>
				}
			/>

			<main className="flex-1 space-y-6 p-6">
				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{isLoading ? (
						<>
							<StatsCardSkeleton />
							<StatsCardSkeleton />
							<StatsCardSkeleton />
							<StatsCardSkeleton />
						</>
					) : (
						<>
							<StatsCard
								title="Total Items"
								value={stats.total}
								icon={Package}
							/>
							<StatsCard
								title="Unclaimed"
								value={stats.unclaimed}
								icon={PackageX}
							/>
							<StatsCard
								title="Claimed"
								value={stats.claimed}
								icon={PackageCheck}
							/>
							<StatsCard
								title="Returned"
								value={stats.returned}
								icon={Package}
							/>
						</>
					)}
				</div>

				{/* Filters */}
				<FilterBar
					searchValue={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Search items by name, description, or keywords..."
					hasActiveFilters={hasActiveFilters}
					onClear={handleClearFilters}
				>
					<Select
						value={statusFilter}
						onValueChange={(value) =>
							setStatusFilter(value as ItemStatus | "all")
						}
					>
						<SelectTrigger className="w-full sm:w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="unclaimed">Unclaimed</SelectItem>
							<SelectItem value="claimed">Claimed</SelectItem>
							<SelectItem value="returned">Returned</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>

					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger className="w-full sm:w-[180px]">
							<SelectValue placeholder="Filter by category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{categories?.map((category) => (
								<SelectItem key={category.id} value={category.id.toString()}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FilterBar>

				{/* Items Table */}
				<Card>
					<CardContent className="p-0">
						{error ? (
							<ErrorState
								title="Failed to load items"
								message={
									error instanceof Error
										? error.message
										: "Unknown error occurred"
								}
								onRetry={() => window.location.reload()}
							/>
						) : (
							<ItemTable
								items={data?.data || []}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onStatusChange={handleStatusChange}
								isLoading={isLoading}
								emptyMessage={emptyMessage}
							/>
						)}
					</CardContent>
				</Card>

				{/* Pagination Info */}
				{data && data.total > 0 && (
					<Card>
						<CardContent className="flex items-center justify-between p-4">
							<p className="text-muted-foreground text-sm">
								Showing {data.data.length} of {data.total} items
							</p>
							{data.totalPages > 1 && (
								<p className="text-muted-foreground text-sm">
									Page {data.page} of {data.totalPages}
								</p>
							)}
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
