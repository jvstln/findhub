"use client";

import type {
	ItemStatus,
	NewItemWithSecurity,
} from "@findhub/shared/types/item";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@findhub/ui/components/layout/admin";
import { ErrorState } from "@/components/shared/error-state";
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
import { Card, CardContent } from "@/components/ui/card";
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
import { getErrorMessage } from "@findhub/ui/lib/api-client";

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
	const handleSubmit = async (data: NewItemWithSecurity) => {
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
					images: data.images,
					status: selectedStatus || undefined,
					hideLocation: data.hideLocation,
					hideDateFound: data.hideDateFound,
					securityQuestions: data.securityQuestions,
				},
			});

			toast.success("Item updated successfully");
			router.push("/dashboard" as Route);
		} catch (error) {
			toast.error(getErrorMessage(error));
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
			router.push("/dashboard" as Route);
		} catch (error) {
			toast.error(getErrorMessage(error));
			setIsDeleteDialogOpen(false);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		router.push("/dashboard" as Route);
	};

	// Loading state
	if (isLoadingItem) {
		return (
			<>
				<PageHeader
					title="Edit Item"
					description="Update item details, change status, or delete the item"
				/>
				<main className="flex min-h-[400px] items-center justify-center p-6">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="size-8 animate-spin text-muted-foreground" />
						<p className="text-muted-foreground text-sm">Loading item...</p>
					</div>
				</main>
			</>
		);
	}

	// Error state
	if (error || !item) {
		return (
			<>
				<PageHeader
					title="Edit Item"
					description="Update item details, change status, or delete the item"
					backButton={
						<Button variant="ghost" size="icon" asChild>
							<Link href={"/dashboard" as Route}>
								<ArrowLeft />
								<span className="sr-only">Back to dashboard</span>
							</Link>
						</Button>
					}
				/>
				<main className="flex-1 p-6">
					<ErrorState
						title="Item Not Found"
						message="The item you're looking for doesn't exist or has been deleted."
						onRetry={() => router.push("/dashboard" as Route)}
					/>
				</main>
			</>
		);
	}

	const currentStatus = selectedStatus || item.status;

	return (
		<div className="flex flex-1 flex-col">
			<PageHeader
				title="Edit Item"
				description="Update item details, change status, or delete the item"
				action={
					<>
						<AlertDialog
							open={isDeleteDialogOpen}
							onOpenChange={setIsDeleteDialogOpen}
						>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Item</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete "{item.name}"? This action
										cannot be undone. The item and its associated images will be
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
												<Loader2 className="mr-2 size-4 animate-spin" />
												Deleting...
											</>
										) : (
											"Delete Item"
										)}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setIsDeleteDialogOpen(true)}
						>
							<Trash2 className="mr-2 size-4" />
							Delete
						</Button>
					</>
				}
				backButton={
					<Button variant="ghost" size="icon" asChild>
						<Link href={"/dashboard" as Route}>
							<ArrowLeft />
							<span className="sr-only">Back to dashboard</span>
						</Link>
					</Button>
				}
			/>

			<main className="flex-1 space-y-6 p-6">
				<div className="mx-auto max-w-4xl space-y-6">
					{/* Status Change Section */}
					<Card>
						<CardContent className="space-y-4 pt-6">
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
						</CardContent>
					</Card>

					{/* Item Form */}
					<Card>
						<CardContent className="space-y-6 pt-6">
							<div>
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
								isEditMode={true}
							/>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
