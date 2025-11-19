"use client";

import type { ItemStatus, LostItem } from "@findhub/shared/types/item";
import { Archive, Package, PackageCheck, PackageX } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@findhub/ui/components/layout/admin";
import { ErrorState } from "@/components/shared/error-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatsCardSkeleton } from "@/components/ui/stats-card-skeleton";
import { ItemTable } from "@/features/items/components/item-table";
import {
	useDeleteItem,
	useUpdateItem,
} from "@/features/items/hooks/use-item-mutations";
import { useItems } from "@/features/items/hooks/use-items";

export default function AdminDashboardPage() {
	const router = useRouter();
	const [statusFilter, setStatusFilter] = useState<ItemStatus | "all">("all");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");

	// Fetch items with filters
	const filters = useMemo(() => {
		const f: {
			status?: ItemStatus;
			category?: string;
			page: number;
			pageSize: number;
		} = {
			page: 1,
			pageSize: 100,
		};
		if (statusFilter !== "all") f.status = statusFilter;
		if (categoryFilter !== "all") f.category = categoryFilter;
		return f;
	}, [statusFilter, categoryFilter]);

	const { data, isLoading, error } = useItems(filters);
	const updateMutation = useUpdateItem();
	const deleteMutation = useDeleteItem();

	// Calculate statistics
	const stats = useMemo(() => {
		const items = data?.data || [];
		return {
			total: items.length,
			unclaimed: items.filter((item) => item.status === "unclaimed").length,
			claimed: items.filter((item) => item.status === "claimed").length,
			returned: items.filter((item) => item.status === "returned").length,
			archived: items.filter((item) => item.status === "archived").length,
		};
	}, [data]);

	// Get unique category IDs
	const categoryIds = useMemo(() => {
		const items = data?.data || [];
		const uniqueCategoryIds = new Set(
			items
				.map((item) => item.categoryId)
				.filter((id): id is number => id !== null),
		);
		return Array.from(uniqueCategoryIds).sort((a, b) => a - b);
	}, [data]);

	const handleEdit = (item: LostItem) => {
		router.push(`/items/${item.id}/edit` as Route);
	};

	const handleDelete = async (item: LostItem) => {
		try {
			await deleteMutation.mutateAsync(item.id);
			toast.success(`"${item.name}" has been deleted`);
		} catch (error) {
			toast.error("Failed to delete item");
			console.error(error);
		}
	};

	const handleStatusChange = async (item: LostItem, newStatus: ItemStatus) => {
		try {
			await updateMutation.mutateAsync({
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
		setStatusFilter("all");
		setCategoryFilter("all");
	};

	const hasActiveFilters = statusFilter !== "all" || categoryFilter !== "all";

	if (error) {
		return (
			<>
				<PageHeader
					title="Dashboard"
					description="Manage lost and found items"
				/>
				<main className="flex-1 p-6">
					<ErrorState
						title="Failed to load items"
						message={
							error instanceof Error ? error.message : "Unknown error occurred"
						}
						onRetry={() => window.location.reload()}
					/>
				</main>
			</>
		);
	}

	return (
		<div className="flex flex-1 flex-col">
			<PageHeader title="Dashboard" description="Manage lost and found items" />

			<main className="flex-1 space-y-6 p-6">
				{/* Statistics Cards */}
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
								description="All items in system"
								icon={Package}
								delay={0}
							/>
							<StatsCard
								title="Unclaimed"
								value={stats.unclaimed}
								description="Awaiting claim"
								icon={PackageX}
								delay={0.1}
							/>
							<StatsCard
								title="Claimed"
								value={stats.claimed}
								description="Being processed"
								icon={PackageCheck}
								delay={0.2}
							/>
							<StatsCard
								title="Returned"
								value={stats.returned}
								description="Successfully returned"
								icon={Archive}
								delay={0.3}
							/>
						</>
					)}
				</div>

				{/* Filters */}
				<FilterBar
					hasActiveFilters={hasActiveFilters}
					onClear={handleClearFilters}
				>
					<div className="flex items-center gap-2">
						<label htmlFor="status-filter" className="font-medium text-sm">
							Status:
						</label>
						<Select
							value={statusFilter}
							onValueChange={(value) =>
								setStatusFilter(value as ItemStatus | "all")
							}
						>
							<SelectTrigger id="status-filter" className="w-[180px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="unclaimed">Unclaimed</SelectItem>
								<SelectItem value="claimed">Claimed</SelectItem>
								<SelectItem value="returned">Returned</SelectItem>
								<SelectItem value="archived">Archived</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center gap-2">
						<label htmlFor="category-filter" className="font-medium text-sm">
							Category ID:
						</label>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger id="category-filter" className="w-[180px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categoryIds.map((categoryId) => (
									<SelectItem key={categoryId} value={categoryId.toString()}>
										Category {categoryId}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</FilterBar>

				{/* Items Table */}
				<Card>
					<CardHeader>
						<CardTitle>Items</CardTitle>
					</CardHeader>
					<CardContent>
						<ItemTable
							items={data?.data || []}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onStatusChange={handleStatusChange}
							emptyMessage="No items found. Add your first item to get started."
							isLoading={isLoading}
						/>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
