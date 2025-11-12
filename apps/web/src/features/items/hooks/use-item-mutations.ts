import type { ItemUpdate, NewItem } from "@findhub/shared/types/item";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createItem } from "../api/create-item";
import { deleteItem } from "../api/delete-item";
import { updateItem } from "../api/update-item";
import { itemKeys } from "./use-item";
import { itemsKeys } from "./use-items";

/**
 * Hook to create a new lost item
 * @returns Mutation object with mutate function and state
 */
export function useCreateItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: NewItem) => createItem(data),
		onSuccess: () => {
			// Invalidate items list to refetch with new item
			queryClient.invalidateQueries({ queryKey: itemsKeys.lists() });
		},
	});
}

/**
 * Hook to update an existing lost item
 * @returns Mutation object with mutate function and state
 */
export function useUpdateItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: ItemUpdate }) =>
			updateItem(id, data),
		onSuccess: (updatedItem) => {
			// Invalidate the specific item query
			queryClient.invalidateQueries({
				queryKey: itemKeys.detail(updatedItem.id),
			});
			// Invalidate items list to reflect changes
			queryClient.invalidateQueries({ queryKey: itemsKeys.lists() });
			// Invalidate history if status was changed
			queryClient.invalidateQueries({
				queryKey: itemKeys.history(updatedItem.id),
			});
		},
	});
}

/**
 * Hook to delete a lost item
 * @returns Mutation object with mutate function and state
 */
export function useDeleteItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => deleteItem(id),
		onSuccess: (_data, id) => {
			// Remove the specific item from cache
			queryClient.removeQueries({ queryKey: itemKeys.detail(id) });
			// Invalidate items list to refetch without deleted item
			queryClient.invalidateQueries({ queryKey: itemsKeys.lists() });
		},
	});
}
