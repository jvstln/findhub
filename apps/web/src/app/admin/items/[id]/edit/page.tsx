"use client";

import type { ItemStatus, NewItem } from "@findhub/shared/types/item";
import { Loader2Icon, TrashIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ItemForm } from "@/features/items/components/item-form";
import { StatusBadge } from "@/features/items/components/status-badge";
import { useItem } from "@/features/items/hooks/use-item";
import {
	useDeleteItem,
	useUpdateItem,
} from "@/features/items/hooks/use-item-mutations";

interface EditItemPageProps {
	params: Promise<{
		id: string;
	}>;
}

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
	{ value: "unclaimed", label: "Unclaimed" },
	{ value: "claimed", label: "Claimed" },
	{ value: "returned", label: "Returned" },
	{ value: "archived", label: "Archived" },
];

export default function EditItemPage({ params }: EditItemPageProps) {
	const router = useRouter();
	const resolvedParams = use(params);
	const itemId = Number.parseInt(resolvedParams.id, 10);

	const [selectedStatus, setSelectedStatus] = useState<ItemStatus | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// Fetch item data
	const { data: item, isLoading: isLoadingItem, error } = useItem(itemId);

	// Mutations
	const updateMutation = useUpdateItem();
	const deleteMutation = useDeleteItem();

	// Handle form submission
	const handleSubmit = async (data: NewItem) => {
		try {
			await updateMutation.mutateAsync({
				id: itemId,
				data: {
					name: data.name,
					description: data.description,
					category: data.category,
					keywords: data.keywords,
					location: data.location,
					dateFound: data.dateFound,
					image: data.image,
					// Include status if it was changed
					status: selectedStatus || undefined,
				},
			});

			toast.success("Item updated successfully");
			router.push("/admin/dashboard" as Route);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update item";
			toast.error(errorMessage);
		}
	};

	// Handle status change
	const handleStatusChange = (newStatus: ItemStatus) => {
		setSelectedStatus(newStatus);
		toast.info(`Status will be updated to "${newStatus}" when you save`);
	};

	// Handle delete
	const handleDelete = async () => {
		try {
			await deleteMutation.mutateAsync(itemId);
			toast.success("Item deleted successfully");
			router.push("/admin/dashboard" as Route);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to delete item";
			toast.error(errorMessage);
			setIsDeleteDialogOpen(false);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		router.push("/admin/dashboard" as Route);
	};

	// Loading state
	if (isLoadingItem) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2Icon className="size-8 animate-spin text-muted-foreground" />
					<p className="text-muted-foreground text-sm">Loading item...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !item) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-lg">Item Not Found</h2>
					<p className="mb-4 text-muted-foreground text-sm">
						The item you're looking for doesn't exist or has been deleted.
					</p>
					<Button onClick={() => router.push("/admin/dashboard" as Route)}>
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	const currentStatus = selectedStatus || item.status;

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">Edit Item</h1>
					<p className="text-muted-foreground text-sm">
						Update item details, change status, or delete the item
					</p>
				</div>
				<AlertDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
				>
					<AlertDialogTrigger asChild>
						<Button variant="destructive" size="sm">
							<TrashIcon />
							<span>Delete</span>
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Item</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete "{item.name}"? This action
								cannot be undone. The item and its associated image will be
								permanently removed from the system.
								{item.status === "claimed" && (
									<span className="mt-2 block font-medium text-destructive">
										Warning: This item is currently marked as claimed.
									</span>
								)}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={deleteMutation.isPending}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								disabled={deleteMutation.isPending}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{deleteMutation.isPending ? (
									<>
										<Loader2Icon className="animate-spin" />
										<span>Deleting...</span>
									</>
								) : (
									"Delete Item"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			{/* Status Change Section */}
			<div className="rounded-lg border bg-card p-6">
				<div className="space-y-4">
					<div>
						<h2 className="mb-1 font-semibold text-lg">Item Status</h2>
						<p className="text-muted-foreground text-sm">
							Change the status of this item to track its lifecycle
						</p>
					</div>

					<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
						<Field className="flex-1">
							<FieldLabel htmlFor="status">Current Status</FieldLabel>
							<div className="flex items-center gap-3">
								<StatusBadge status={currentStatus} />
								<Select
									value={currentStatus}
									onValueChange={handleStatusChange}
									disabled={updateMutation.isPending}
								>
									<SelectTrigger id="status" className="w-[200px]">
										<SelectValue placeholder="Change status" />
									</SelectTrigger>
									<SelectContent>
										{STATUS_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<FieldDescription>
								Status changes will be saved when you update the item
							</FieldDescription>
						</Field>
					</div>
				</div>
			</div>

			{/* Item Form */}
			<div className="rounded-lg border bg-card p-6">
				<div className="mb-6">
					<h2 className="mb-1 font-semibold text-lg">Item Details</h2>
					<p className="text-muted-foreground text-sm">
						Update the item information below
					</p>
				</div>

				<ItemForm
					defaultValues={item}
					onSubmit={handleSubmit}
					isLoading={updateMutation.isPending}
					submitLabel="Update Item"
					onCancel={handleCancel}
				/>
			</div>
		</div>
	);
}
