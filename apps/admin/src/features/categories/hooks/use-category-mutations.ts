import type {
	CreateCategoryInput,
	UpdateCategoryInput,
} from "@findhub/shared/types/category";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "../api/create-category";
import { deleteCategory } from "../api/delete-category";
import { updateCategory } from "../api/update-category";
import { categoriesKeys } from "./use-categories";

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateCategoryInput) => createCategory(input),
		onSuccess: () => {
			// Invalidate categories list to refetch
			queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
		},
	});
}

/**
 * Hook to update an existing category
 */
export function useUpdateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: number; input: UpdateCategoryInput }) =>
			updateCategory(id, input),
		onSuccess: () => {
			// Invalidate categories list to refetch
			queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
		},
	});
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => deleteCategory(id),
		onSuccess: () => {
			// Invalidate categories list to refetch
			queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
		},
	});
}
