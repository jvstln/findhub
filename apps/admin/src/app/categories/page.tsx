"use client";

import type { ItemCategory } from "@findhub/shared/types/category";
import { PlusIcon, TagIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatsCardSkeleton } from "@/components/ui/stats-card-skeleton";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryTable } from "@/features/categories/components/category-table";
import { useCategories } from "@/features/categories/hooks/use-categories";
import {
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "@/features/categories/hooks/use-category-mutations";
import { getErrorMessage } from "@/lib/api-client";

type DialogMode = "create" | "edit" | "delete" | null;

export default function CategoriesPage() {
	const [dialogMode, setDialogMode] = useState<DialogMode>(null);
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
		setDialogMode("delete");
	};

	const handleCloseDialog = () => {
		setDialogMode(null);
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
			handleCloseDialog();
		} catch (error) {
			toast.error(getErrorMessage(error));
		}
	};

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-destructive text-lg">Failed to load categories</p>
					<p className="text-muted-foreground text-sm">
						{error instanceof Error ? error.message : "Unknown error"}
					</p>
				</div>
			</div>
		);
	}

	const totalCategories = categories?.length || 0;

	return (
		<div className="flex flex-1 flex-col">
			{/* Header */}
			<header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
				<SidebarTrigger />
				<div className="flex flex-1 items-center justify-between">
					<div>
						<h1 className="font-bold text-2xl">Categories</h1>
						<p className="text-muted-foreground text-sm">
							Manage item categories
						</p>
					</div>
					<Button onClick={handleCreate}>
						<PlusIcon />
						<span>Add Category</span>
					</Button>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 space-y-6 p-6">
				{/* Statistics Card */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{isLoading ? (
						<StatsCardSkeleton />
					) : (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<Card className="transition-all hover:shadow-md">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="font-medium text-sm">
										Total Categories
									</CardTitle>
									<TagIcon className="size-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="font-bold text-2xl">{totalCategories}</div>
									<p className="text-muted-foreground text-xs">
										Active categories
									</p>
								</CardContent>
							</Card>
						</motion.div>
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

			{/* Create Dialog */}
			<Dialog open={dialogMode === "create"} onOpenChange={handleCloseDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Category</DialogTitle>
						<DialogDescription>
							Add a new category for organizing lost items.
						</DialogDescription>
					</DialogHeader>
					<CategoryForm
						onSubmit={handleSubmitCreate}
						isLoading={createMutation.isPending}
						submitLabel="Create Category"
						onCancel={handleCloseDialog}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={dialogMode === "edit"} onOpenChange={handleCloseDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Category</DialogTitle>
						<DialogDescription>
							Update the category name or description.
						</DialogDescription>
					</DialogHeader>
					{selectedCategory && (
						<CategoryForm
							defaultValues={selectedCategory}
							onSubmit={handleSubmitEdit}
							isLoading={updateMutation.isPending}
							submitLabel="Update Category"
							onCancel={handleCloseDialog}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={dialogMode === "delete"} onOpenChange={handleCloseDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Category</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{selectedCategory?.name}"? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-3 pt-4">
						<Button
							variant="outline"
							onClick={handleCloseDialog}
							disabled={deleteMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirmDelete}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
