"use client";

import type {
	ItemStatus,
	ItemUpdate,
	NewItem,
} from "@findhub/shared/types/item";
import { Loader2Icon, TrashIcon } from "lucide-react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ItemForm } from "@/features/items/components/item-form";
import { useItem } from "@/features/items/hooks/use-item";
import {
	useDeleteItem,
	useUpdateItem,
} from "@/features/items/hooks/use-item-mutations";

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
	{ value: "unclaimed", label: "Unclaimed" },
	{ value: "claimed", label: "Claimed" },
	{ value: "returned", label: "Returned" },
	{ value: "archived", label: "Archived" },
];

export default function EditItemPage() {
	const params = useParams();
	const router = useRouter();
	const itemId = Number(params.id);

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<ItemStatus | null>(null);

	const { data: item, isLoading, error } = useItem(itemId);
	const updateItemMutation = useUpdateItem();
	const deleteItemMutation = useDeleteItem();

	// Initialize selected status when item loads
	if (item && selectedStatus === null) {
		setSelectedStatus(item.status);
	}

	const handleSubmit = async (data: NewItem) => {
		try {
			const updateData: ItemUpdate = {
				...data,
				status: selectedStatus || item?.status,
			};

			await updateItemMutation.mutateAsync({
				id: itemId,
				data: updateData,
			});

			toast.success("Item updated successfully");
			router.push("/dashboard");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update item";
			toast.error(errorMessage);
		}
	};

	const handleStatusChange = async (newStatus: ItemStatus) => {
		setSelectedStatus(newStatus);

		// Optionally, auto-save status change
		try {
			await updateItemMutation.mutateAsync({
				id: itemId,
				data: { status: newStatus },
			});
			toast.success("Status updated successfully");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update status";
			toast.error(errorMessage);
			// Revert status on error
			setSelectedStatus(item?.status || null);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteItemMutation.mutateAsync(itemId);
			toast.success("Item deleted successfully");
			router.push("/dashboard");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to delete item";
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		router.push("/dashboard");
	};

	if (isLoading) {
		return (
			<div className="container mx-auto flex min-h-[400px] max-w-3xl items-center justify-center px-4 py-8">
				<div className="flex flex-col items-center gap-3">
					<Spinner className="size-8" />
					<p className="text-muted-foreground text-sm">Loading item...</p>
				</div>
			</div>
		);
	}

	if (error || !item) {
		return (
			<div className="container mx-auto max-w-3xl px-4 py-8">
				<div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
					<h2 className="mb-2 font-semibold text-lg">Item Not Found</h2>
					<p className="mb-4 text-muted-foreground text-sm">
						The item you're looking for doesn't exist or has been deleted.
					</p>
					<Button onClick={() => router.push("/dashboard")} variant="outline">
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-3xl px-4 py-8">
			<motion.div
				className="mb-8 flex items-start justify-between"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div>
					<h1 className="font-bold text-3xl">Edit Lost Item</h1>
					<p className="mt-2 text-muted-foreground">
						Update item details or change its status.
					</p>
				</div>
				<Button
					variant="destructive"
					size="sm"
					onClick={() => setShowDeleteDialog(true)}
					disabled={deleteItemMutation.isPending}
				>
					<TrashIcon />
					Delete
				</Button>
			</motion.div>

			<div className="space-y-6">
				{/* Status Change Section */}
				<motion.div
					className="rounded-lg border bg-card p-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<div className="mb-4">
						<h2 className="font-semibold text-lg">Item Status</h2>
						<p className="text-muted-foreground text-sm">
							Update the current status of this item
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<Select
							value={selectedStatus || item.status}
							onValueChange={handleStatusChange}
							disabled={updateItemMutation.isPending}
						>
							<SelectTrigger id="status" className="w-full max-w-xs">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								{STATUS_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{updateItemMutation.isPending && (
							<p className="flex items-center gap-2 text-muted-foreground text-xs">
								<Loader2Icon className="size-3 animate-spin" />
								Updating status...
							</p>
						)}
					</div>
				</motion.div>

				<Separator />

				{/* Item Details Form */}
				<motion.div
					className="rounded-lg border bg-card p-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
				>
					<div className="mb-4">
						<h2 className="font-semibold text-lg">Item Details</h2>
						<p className="text-muted-foreground text-sm">
							Update the item information
						</p>
					</div>
					<ItemForm
						defaultValues={item}
						onSubmit={handleSubmit}
						isLoading={updateItemMutation.isPending}
						submitLabel="Save Changes"
						onCancel={handleCancel}
					/>
				</motion.div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							item "{item.name}" from the system.
							{item.status === "claimed" && (
								<span className="mt-2 block font-medium text-destructive">
									Warning: This item is marked as claimed. Please confirm you
									want to delete it.
								</span>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteItemMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleteItemMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteItemMutation.isPending ? (
								<>
									<Loader2Icon className="animate-spin" />
									Deleting...
								</>
							) : (
								"Delete Item"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
