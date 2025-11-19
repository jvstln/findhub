"use client";

import type { ItemCategory } from "@findhub/shared/types/category";
import { Plus, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@findhub/ui/components/layout/admin";
import { ErrorState } from "@/components/shared/error-state";
import { StatsCard } from "@/components/shared/stats-card";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { StatsCardSkeleton } from "@/components/ui/stats-card-skeleton";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryTable } from "@/features/categories/components/category-table";
import { useCategories } from "@/features/categories/hooks/use-categories";
import {
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "@/features/categories/hooks/use-category-mutations";
import { getErrorMessage } from "@findhub/ui/lib/api-client";

type DialogMode = "create" | "edit" | null;

export default function CategoriesPage() {
	const [dialogMode, setDialogMode] = useState<DialogMode>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(
		null,
	);

	const { data: categories, isLoading, error } = useCategories();
	const createMutation = useCreateCategory();
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	const handleCreate = () => {
		setSelectedCategory(null);
		setDialogMode("create");
	};

	const handleEdit = (category: ItemCategory) => {
		setSelectedCategory(category);
		setDialogMode("edit");
	};

	const handleDelete = (category: ItemCategory) => {
		setSelectedCategory(category);
		setDeleteDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogMode(null);
		setSelectedCategory(null);
	};

	const handleCloseDeleteDialog = () => {
		setDeleteDialogOpen(false);
		setSelectedCategory(null);
	};

	const handleSubmitCreate = async (data: {
		name: string;
		description?: string;
	}) => {
		try {
			await createMutation.mutateAsync(data);
			toast.success("Category created successfully");
			handleCloseDialog();
		} catch (error) {
			toast.error(getErrorMessage(error));
		}
	};

	const handleSubmitEdit = async (data: {
		name: string;
		description?: string;
	}) => {
		if (!selectedCategory) return;

		try {
			await updateMutation.mutateAsync({
				id: selectedCategory.id,
				input: data,
			});
			toast.success("Category updated successfully");
			handleCloseDialog();
		} catch (error) {
			toast.error(getErrorMessage(error));
		}
	};

	const handleConfirmDelete = async () => {
		if (!selectedCategory) return;

		try {
			await deleteMutation.mutateAsync(selectedCategory.id);
			toast.success(`"${selectedCategory.name}" has been deleted`);
			handleCloseDeleteDialog();
		} catch (error) {
			toast.error(getErrorMessage(error));
		}
	};

	if (error) {
		return (
			<>
				<PageHeader title="Categories" description="Manage item categories" />
				<main className="flex-1 p-6">
					<ErrorState
						title="Failed to load categories"
						message={
							error instanceof Error ? error.message : "Unknown error occurred"
						}
						onRetry={() => window.location.reload()}
					/>
				</main>
			</>
		);
	}

	const totalCategories = categories?.length || 0;

	return (
		<div className="flex flex-1 flex-col">
			<PageHeader
				title="Categories"
				description="Manage item categories"
				action={
					<Button onClick={handleCreate}>
						<Plus className="mr-2 size-4" />
						Add Category
					</Button>
				}
			/>

			<main className="flex-1 space-y-6 p-6">
				{/* Statistics Card */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{isLoading ? (
						<StatsCardSkeleton />
					) : (
						<StatsCard
							title="Total Categories"
							value={totalCategories}
							description="Active categories"
							icon={Tag}
						/>
					)}
				</div>

				{/* Categories Table */}
				<Card>
					<CardHeader>
						<CardTitle>All Categories</CardTitle>
					</CardHeader>
					<CardContent>
						<CategoryTable
							categories={categories || []}
							onEdit={handleEdit}
							onDelete={handleDelete}
							isLoading={isLoading}
						/>
					</CardContent>
				</Card>
			</main>

			{/* Create/Edit Dialog */}
			<Dialog open={dialogMode !== null} onOpenChange={handleCloseDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{dialogMode === "create" ? "Create Category" : "Edit Category"}
						</DialogTitle>
						<DialogDescription>
							{dialogMode === "create"
								? "Add a new category for organizing lost items."
								: "Update the category name or description."}
						</DialogDescription>
					</DialogHeader>
					{dialogMode === "create" ? (
						<CategoryForm
							onSubmit={handleSubmitCreate}
							isLoading={createMutation.isPending}
							submitLabel="Create Category"
							onCancel={handleCloseDialog}
						/>
					) : (
						selectedCategory && (
							<CategoryForm
								defaultValues={selectedCategory}
								onSubmit={handleSubmitEdit}
								isLoading={updateMutation.isPending}
								submitLabel="Update Category"
								onCancel={handleCloseDialog}
							/>
						)
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Category</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{selectedCategory?.name}"? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={handleCloseDeleteDialog}
							disabled={deleteMutation.isPending}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
