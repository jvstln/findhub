"use client";

import type { ItemStatus, LostItem } from "@findhub/shared/types/item";
import { Archive, Package, PackageCheck, PackageX } from "lucide-react";
import { motion } from "motion/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
		router.push(`/admin/items/${item.id}/edit` as Route);
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

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-destructive text-lg">Failed to load items</p>
					<p className="text-muted-foreground text-sm">
						{error instanceof Error ? error.message : "Unknown error"}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col">
			{/* Header */}
			<header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
				<SidebarTrigger />
				<div className="flex-1">
					<h1 className="font-bold text-2xl">Dashboard</h1>
					<p className="text-muted-foreground text-sm">
						Manage lost and found items
					</p>
				</div>
			</header>

			{/* Main Content */}
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
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0 }}
							>
								<Card className="transition-all hover:shadow-md">
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Total Items
										</CardTitle>
										<Package className="size-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">{stats.total}</div>
										<p className="text-muted-foreground text-xs">
											All items in system
										</p>
									</CardContent>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.1 }}
							>
								<Card className="transition-all hover:shadow-md">
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Unclaimed
										</CardTitle>
										<PackageX className="size-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">{stats.unclaimed}</div>
										<p className="text-muted-foreground text-xs">
											Awaiting claim
										</p>
									</CardContent>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.2 }}
							>
								<Card className="transition-all hover:shadow-md">
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Claimed
										</CardTitle>
										<PackageCheck className="size-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">{stats.claimed}</div>
										<p className="text-muted-foreground text-xs">
											Being processed
										</p>
									</CardContent>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.3 }}
							>
								<Card className="transition-all hover:shadow-md">
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="font-medium text-sm">
											Returned
										</CardTitle>
										<Archive className="size-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="font-bold text-2xl">{stats.returned}</div>
										<p className="text-muted-foreground text-xs">
											Successfully returned
										</p>
									</CardContent>
								</Card>
							</motion.div>
						</>
					)}
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<CardTitle>Filters</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-4">
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
					</CardContent>
				</Card>

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
