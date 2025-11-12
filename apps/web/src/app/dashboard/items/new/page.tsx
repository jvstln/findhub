"use client";

import type { NewItem } from "@findhub/shared/types/item";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ItemForm } from "@/features/items/components/item-form";
import { useCreateItem } from "@/features/items/hooks/use-item-mutations";

export default function NewItemPage() {
	const router = useRouter();
	const createItemMutation = useCreateItem();

	const handleSubmit = async (data: NewItem) => {
		try {
			await createItemMutation.mutateAsync(data);
			toast.success("Item created successfully");
			router.push("/dashboard");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to create item";
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		router.push("/dashboard");
	};

	return (
		<div className="container mx-auto max-w-3xl px-4 py-8">
			<motion.div
				className="mb-8"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="font-bold text-3xl">Add New Lost Item</h1>
				<p className="mt-2 text-muted-foreground">
					Register a found item to help students locate their lost belongings.
				</p>
			</motion.div>

			<motion.div
				className="rounded-lg border bg-card p-6"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
			>
				<ItemForm
					onSubmit={handleSubmit}
					isLoading={createItemMutation.isPending}
					submitLabel="Create Item"
					onCancel={handleCancel}
				/>
			</motion.div>
		</div>
	);
}
