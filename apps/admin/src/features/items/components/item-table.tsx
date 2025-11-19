"use client";

import type {
	ItemStatus,
	LostItemWithImages,
} from "@findhub/shared/types/item";
import {
	ArrowUpDown,
	Calendar,
	Edit,
	Grid3x3,
	MapPin,
	MoreVertical,
	Table as TableIcon,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemCardSkeleton } from "@/components/ui/item-card-skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { cn } from "@/lib/utils";
import { ItemGrid } from "./item-grid";
import { PrivacyStatusBadge } from "./privacy-status-badge";
import { StatusBadge } from "./status-badge";

type SortField = "name" | "category" | "dateFound" | "location" | "status";
type SortDirection = "asc" | "desc";

interface ItemTableProps {
	items: LostItemWithImages[];
	onEdit?: (item: LostItemWithImages) => void;
	onDelete?: (item: LostItemWithImages) => void;
	onStatusChange?: (item: LostItemWithImages, newStatus: ItemStatus) => void;
	className?: string;
	emptyMessage?: string;
	isLoading?: boolean;
}

export function ItemTable({
	items,
	onEdit,
	onDelete,
	onStatusChange,
	className,
	emptyMessage = "No items found",
	isLoading = false,
}: ItemTableProps) {
	const [viewMode, setViewMode] = useState<"table" | "card">("table");
	const [sortField, setSortField] = useState<SortField>("dateFound");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<LostItemWithImages | null>(
		null,
	);

	// Sort items
	const sortedItems = [...items].sort((a, b) => {
		let aValue: string | number | Date;
		let bValue: string | number | Date;

		switch (sortField) {
			case "name":
				aValue = a.name.toLowerCase();
				bValue = b.name.toLowerCase();
				break;
			case "category":
				aValue = a.categoryId?.toString() || "";
				bValue = b.categoryId?.toString() || "";
				break;
			case "dateFound":
				aValue = new Date(a.dateFound).getTime();
				bValue = new Date(b.dateFound).getTime();
				break;
			case "location":
				aValue = a.location.toLowerCase();
				bValue = b.location.toLowerCase();
				break;
			case "status":
				aValue = a.status;
				bValue = b.status;
				break;
			default:
				return 0;
		}

		if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
		if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleDeleteClick = (item: LostItemWithImages) => {
		setItemToDelete(item);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (itemToDelete && onDelete) {
			onDelete(itemToDelete);
		}
		setDeleteDialogOpen(false);
		setItemToDelete(null);
	};

	const handleStatusChange = (item: LostItemWithImages, newStatus: string) => {
		if (onStatusChange) {
			onStatusChange(item, newStatus as ItemStatus);
		}
	};

	if (isLoading) {
		return (
			<div className={cn("space-y-4", className)}>
				{/* View Toggle */}
				<div className="flex items-center justify-end gap-2">
					<Button
						variant={viewMode === "table" ? "default" : "outline"}
						size="sm"
						disabled
					>
						<TableIcon />
						Table
					</Button>
					<Button
						variant={viewMode === "card" ? "default" : "outline"}
						size="sm"
						disabled
					>
						<Grid3x3 />
						Cards
					</Button>
				</div>

				{/* Loading State */}
				{viewMode === "card" ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }, (_, i) => i).map((i) => (
							<ItemCardSkeleton key={`skeleton-${i}`} />
						))}
					</div>
				) : (
					<TableSkeleton rows={5} columns={7} />
				)}
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
				<div className="text-center">
					<p className="text-lg text-muted-foreground">{emptyMessage}</p>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("space-y-4", className)}>
			{/* View Toggle */}
			<div className="flex items-center justify-end gap-2">
				<Button
					variant={viewMode === "table" ? "default" : "outline"}
					size="sm"
					onClick={() => setViewMode("table")}
				>
					<TableIcon />
					Table
				</Button>
				<Button
					variant={viewMode === "card" ? "default" : "outline"}
					size="sm"
					onClick={() => setViewMode("card")}
				>
					<Grid3x3 />
					Cards
				</Button>
			</div>

			{/* Card View */}
			{viewMode === "card" && (
				<ItemGrid
					items={sortedItems}
					onItemClick={onEdit}
					emptyMessage={emptyMessage}
				/>
			)}

			{/* Table View */}
			{viewMode === "table" && (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[80px]">Image</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleSort("name")}
										className="h-8 px-2"
									>
										Name
										<ArrowUpDown className="ml-2 size-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleSort("category")}
										className="h-8 px-2"
									>
										Category
										<ArrowUpDown className="ml-2 size-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleSort("dateFound")}
										className="h-8 px-2"
									>
										Date Found
										<ArrowUpDown className="ml-2 size-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleSort("location")}
										className="h-8 px-2"
									>
										Location
										<ArrowUpDown className="ml-2 size-4" />
									</Button>
								</TableHead>
								<TableHead>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleSort("status")}
										className="h-8 px-2"
									>
										Status
										<ArrowUpDown className="ml-2 size-4" />
									</Button>
								</TableHead>
								<TableHead className="w-[80px]">Privacy</TableHead>
								<TableHead className="w-[100px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedItems.map((item) => (
								<TableRow key={item.id}>
									<TableCell>
										{item.images && item.images.length > 0 ? (
											<div className="relative size-16 overflow-hidden rounded-md">
												<Image
													src={item.images[0].url}
													alt={item.name}
													fill
													className="object-cover"
													sizes="64px"
												/>
												{item.images.length > 1 && (
													<div className="absolute right-0 bottom-0 rounded-tl-md bg-black/50 px-1 text-white text-xs">
														+{item.images.length - 1}
													</div>
												)}
											</div>
										) : (
											<div className="flex size-16 items-center justify-center rounded-md bg-muted">
												<span className="text-muted-foreground text-xs">
													No image
												</span>
											</div>
										)}
									</TableCell>
									<TableCell className="font-medium">
										<div className="max-w-[200px]">
											<p className="truncate">{item.name}</p>
											<p className="truncate text-muted-foreground text-xs">
												{item.description}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="secondary" className="capitalize">
											{item.categoryId
												? `Category ${item.categoryId}`
												: "Uncategorized"}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1.5 text-sm">
											<Calendar className="size-4 text-muted-foreground" />
											{new Date(item.dateFound).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1.5 text-sm">
											<MapPin className="size-4 text-muted-foreground" />
											<span className="max-w-[150px] truncate">
												{item.location}
											</span>
										</div>
									</TableCell>
									<TableCell>
										{onStatusChange ? (
											<Select
												value={item.status}
												onValueChange={(value) =>
													handleStatusChange(item, value)
												}
											>
												<SelectTrigger size="sm" className="w-[130px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="unclaimed">Unclaimed</SelectItem>
													<SelectItem value="claimed">Claimed</SelectItem>
													<SelectItem value="returned">Returned</SelectItem>
													<SelectItem value="archived">Archived</SelectItem>
												</SelectContent>
											</Select>
										) : (
											<StatusBadge status={item.status} />
										)}
									</TableCell>
									<TableCell>
										<PrivacyStatusBadge
											hideLocation={item.hideLocation}
											hideDateFound={item.hideDateFound}
											variant="compact"
										/>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreVertical className="size-4" />
													<span className="sr-only">Open menu</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												{onEdit && (
													<DropdownMenuItem onClick={() => onEdit(item)}>
														<Edit />
														Edit
													</DropdownMenuItem>
												)}
												{onStatusChange && (
													<>
														<DropdownMenuItem
															onClick={() =>
																handleStatusChange(item, "unclaimed")
															}
														>
															Mark as Unclaimed
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusChange(item, "claimed")
															}
														>
															Mark as Claimed
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusChange(item, "returned")
															}
														>
															Mark as Returned
														</DropdownMenuItem>
													</>
												)}
												{onDelete && (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant="destructive"
															onClick={() => handleDeleteClick(item)}
														>
															<Trash2 />
															Delete
														</DropdownMenuItem>
													</>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Item</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{itemToDelete?.name}"? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteConfirm}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
