"use client";

import { Button } from "@findhub/ui/components/ui/button";
import { SidebarTrigger } from "@findhub/ui/components/ui/sidebar";
import { ArrowLeft, Edit, Loader2Icon } from "lucide-react";
import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { use } from "react";
import { ItemDetail } from "@/features/items/components/item-detail";
import { useItemWithSecurity } from "@/features/items/hooks/use-item-with-security";

interface ItemDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
	const resolvedParams = use(params);
	const itemId = Number.parseInt(resolvedParams.id, 10);

	// Fetch item data with security questions
	const { data: item, isLoading, error } = useItemWithSecurity(itemId);

	// Loading state
	if (isLoading) {
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
							<h1 className="font-bold text-2xl">Item Details</h1>
						</div>
					</div>
				</header>

				{/* Loading Content */}
				<main className="flex flex-1 items-center justify-center p-6">
					<div className="flex flex-col items-center gap-3">
						<Loader2Icon className="size-8 animate-spin text-muted-foreground" />
						<p className="text-muted-foreground text-sm">Loading item...</p>
					</div>
				</main>
			</div>
		);
	}

	// Error state
	if (error || !item) {
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
							<h1 className="font-bold text-2xl">Item Not Found</h1>
						</div>
					</div>
				</header>

				{/* Error Content */}
				<main className="flex flex-1 items-center justify-center p-6">
					<div className="text-center">
						<h2 className="mb-2 font-semibold text-lg">Item Not Found</h2>
						<p className="mb-4 text-muted-foreground text-sm">
							The item you're looking for doesn't exist or has been deleted.
						</p>
						<Button asChild>
							<Link href={"/dashboard" as Route}>Back to Dashboard</Link>
						</Button>
					</div>
				</main>
			</div>
		);
	}

	// Success state
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
					<div className="flex flex-1 items-center justify-between">
						<div>
							<h1 className="font-bold text-2xl">{item.name}</h1>
							<p className="text-muted-foreground text-sm">
								View item details and information
							</p>
						</div>
						<Button asChild>
							<Link href={`/items/${item.id}/edit` as Route}>
								<Edit />
								<span>Edit Item</span>
							</Link>
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 p-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="mx-auto max-w-4xl"
				>
					<ItemDetail item={item} showClaimInstructions={false} />
				</motion.div>
			</main>
		</div>
	);
}
