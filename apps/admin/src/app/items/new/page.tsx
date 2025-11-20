"use client";

import type { NewItem } from "@findhub/shared/types/item";
import { Button } from "@findhub/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@findhub/ui/components/ui/card";
import { getErrorMessage } from "@findhub/ui/lib/api-client";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { ItemForm } from "@/features/items/components/item-form";
import { useCreateItem } from "@/features/items/hooks/use-item-mutations";

export default function NewItemPage() {
	const router = useRouter();
	const createMutation = useCreateItem();

	const handleSubmit = async (data: NewItem) => {
		try {
			await createMutation.mutateAsync(data);
			toast.success("Item created successfully");
			router.push("/dashboard" as Route);
		} catch (error) {
			toast.error(getErrorMessage(error));
			console.error("Create item error:", error);
		}
	};

	const handleCancel = () => {
		router.push("/dashboard" as Route);
	};

	return (
		<div className="flex flex-1 flex-col">
			<PageHeader
				title="Create New Item"
				description="Add a new lost item to the system"
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
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="mx-auto max-w-3xl"
				>
					<Card>
						<CardHeader>
							<CardTitle>Item Details</CardTitle>
						</CardHeader>
						<CardContent>
							<ItemForm
								onSubmit={handleSubmit}
								isLoading={createMutation.isPending}
								submitLabel="Create Item"
								onCancel={handleCancel}
							/>
						</CardContent>
					</Card>
				</motion.div>
			</main>
		</div>
	);
}
