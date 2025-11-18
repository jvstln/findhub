"use client";

import type { NewItem } from "@findhub/shared/types/item";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
			// Handle different types of errors
			if (error instanceof Error) {
				// Check for Supabase Storage specific errors
				if (error.message.includes("storage")) {
					toast.error(`Storage error: ${error.message}`);
				} else if (error.message.includes("upload")) {
					toast.error(`Upload failed: ${error.message}`);
				} else {
					toast.error(`Failed to create item: ${error.message}`);
				}
			} else {
				toast.error("Failed to create item. Please try again.");
			}
			console.error("Create item error:", error);
		}
	};

	const handleCancel = () => {
		router.push("/dashboard" as Route);
	};

	return (
		<div className="flex flex-1 flex-col">
			{/* Header */}
			<header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
				<SidebarTrigger />
				<div className="flex flex-1 items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href={"/dashboard" as Route}>
							<ArrowLeft />
							<span className="sr-only">Back to dashboard</span>
						</Link>
					</Button>
					<div className="flex-1">
						<h1 className="font-bold text-2xl">Create New Item</h1>
						<p className="text-muted-foreground text-sm">
							Add a new lost item to the system
						</p>
					</div>
				</div>
			</header>

			{/* Main Content */}
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
