"use client";

import type { ItemCategory } from "@findhub/shared/types/category";
import { Button } from "@findhub/ui/components/ui/button";
import { Skeleton } from "@findhub/ui/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@findhub/ui/components/ui/table";
import { Edit2Icon, Trash2Icon } from "lucide-react";

interface CategoryTableProps {
	/**
	 * List of categories to display
	 */
	categories: ItemCategory[];
	/**
	 * Callback when edit button is clicked
	 */
	onEdit: (category: ItemCategory) => void;
	/**
	 * Callback when delete button is clicked
	 */
	onDelete: (category: ItemCategory) => void;
	/**
	 * Whether the table is in a loading state
	 */
	isLoading?: boolean;
	/**
	 * Message to display when no categories exist
	 */
	emptyMessage?: string;
}

export function CategoryTable({
	categories,
	onEdit,
	onDelete,
	isLoading = false,
	emptyMessage = "No categories found. Create your first category to get started.",
}: CategoryTableProps) {
	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 5 }, (_, i) => (
					<Skeleton key={`skeleton-${i}`} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (categories.length === 0) {
		return (
			<div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
				<p className="text-center text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[80px]">ID</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Description</TableHead>
						<TableHead className="w-[120px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{categories.map((category) => (
						<TableRow key={category.id}>
							<TableCell className="font-medium">{category.id}</TableCell>
							<TableCell className="font-medium">{category.name}</TableCell>
							<TableCell className="text-muted-foreground">
								{category.description || "—"}
							</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => onEdit(category)}
										title="Edit category"
									>
										<Edit2Icon className="size-4" />
										<span className="sr-only">Edit {category.name}</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => onDelete(category)}
										title="Delete category"
									>
										<Trash2Icon className="size-4" />
										<span className="sr-only">Delete {category.name}</span>
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
