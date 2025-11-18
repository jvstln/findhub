"use client";

import type {
	ItemStatus,
	LostItemWithImages,
} from "@findhub/shared/types/item";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
	const filters = {
		query: searchQuery || undefined,
		status: statusFilter !== "all" ? statusFilter : undefined,
		categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
		page: 1,
		pageSize: 50,
	};

	const { data, isLoading, error } = useItems(filters);
	const { data: categories } = useCategories();
	const deleteItemMutation = useDeleteItem();
	const updateItemMutation = useUpdateItem();

	const handleEdit = (item: LostItemWithImages) => {
		router.push(`/items/${item.id}/edit`);
	};

	const handleDelete = async (item: LostItemWithImages) => {
		await deleteItemMutation.mutateAsync(item.id);
	};

	const handleStatusChange = async (
		item: LostItemWithImages,
		newStatus: ItemStatus,
	) => {
		await updateItemMutation.mutateAsync({
			id: item.id,
			data: { status: newStatus },
		});
	};

	// Calculate stats from current filtered data
	const stats = data?.data
		? {
				total: data.total,
				unclaimed: data.data.filter((item) => item.status === "unclaimed")
					.length,
				claimed: data.data.filter((item) => item.status === "claimed").length,
				returned: data.data.filter((item) => item.status === "returned").length,
			}
		: { total: 0, unclaimed: 0, claimed: 0, returned: 0 };

	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
				<SidebarTrigger />
				<div className="flex flex-1 items-center justify-between">
					<div>
						<h1 className="font-bold text-2xl">Items Management</h1>
						<p className="text-muted-foreground text-sm">
							Manage all lost and found items
						</p>
					</div>
					<Button asChild>
						<Link href="/items/new">
							<Plus className="mr-2 size-4" />
							Add New Item
						</Link>
					</Button>
				</div>
			</header>

			{/* Main Content */}
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
							<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
								<div className="flex items-center justify-between">
									<p className="font-medium text-muted-foreground text-sm">
										Total Items
									</p>
								</div>
								<div className="mt-2">
									<p className="font-bold text-3xl">{stats.total}</p>
								</div>
							</div>

							<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
								<div className="flex items-center justify-between">
									<p className="font-medium text-muted-foreground text-sm">
										Unclaimed
									</p>
								</div>
								<div className="mt-2">
									<p className="font-bold text-3xl">{stats.unclaimed}</p>
								</div>
							</div>

							<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
								<div className="flex items-center justify-between">
									<p className="font-medium text-muted-foreground text-sm">
										Claimed
									</p>
								</div>
								<div className="mt-2">
									<p className="font-bold text-3xl">{stats.claimed}</p>
								</div>
							</div>

							<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
								<div className="flex items-center justify-between">
									<p className="font-medium text-muted-foreground text-sm">
										Returned
									</p>
								</div>
								<div className="mt-2">
									<p className="font-bold text-3xl">{stats.returned}</p>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Filters */}
				<div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
						<Input
							placeholder="Search items by name, description, or keywords..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

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

					{(searchQuery ||
						statusFilter !== "all" ||
						categoryFilter !== "all") && (
						<Button
							variant="outline"
							onClick={() => {
								setSearchQuery("");
								setStatusFilter("all");
								setCategoryFilter("all");
							}}
						>
							Clear Filters
						</Button>
					)}
				</div>

				{/* Items Table */}
				<div className="rounded-lg border bg-card">
					{error ? (
						<div className="flex min-h-[400px] items-center justify-center p-6">
							<div className="text-center">
								<p className="text-destructive text-lg">Failed to load items</p>
								<p className="text-muted-foreground text-sm">
									{error instanceof Error ? error.message : "Unknown error"}
								</p>
							</div>
						</div>
					) : (
						<ItemTable
							items={data?.data || []}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onStatusChange={handleStatusChange}
							isLoading={isLoading}
							emptyMessage={
								searchQuery ||
								statusFilter !== "all" ||
								categoryFilter !== "all"
									? "No items match your filters"
									: "No items found. Create your first item to get started."
							}
						/>
					)}
				</div>

				{/* Pagination Info */}
				{data && data.total > 0 && (
					<div className="flex items-center justify-between rounded-lg border bg-card p-4">
						<p className="text-muted-foreground text-sm">
							Showing {data.data.length} of {data.total} items
						</p>
						{data.totalPages > 1 && (
							<p className="text-muted-foreground text-sm">
								Page {data.page} of {data.totalPages}
							</p>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
