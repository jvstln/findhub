"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CachedDataBadge } from "@/components/cached-data-badge";
import { Button } from "@/components/ui/button";
import { ItemDetail } from "@/features/items/components/item-detail";
import { useItem } from "@/features/items/hooks/use-item";
import { useOnlineStatus } from "@findhub/ui/hooks";

export default function ItemDetailPage({ params }: { params: { id: string } }) {
	const itemId = Number.parseInt(params.id, 10);

	// Validate ID
	if (Number.isNaN(itemId) || itemId <= 0) {
		notFound();
	}

	const { data: item, isLoading, isError, error, isFetching } = useItem(itemId);
	const { isOnline } = useOnlineStatus();

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto min-h-screen px-4 py-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8">
						<Button variant="ghost" asChild>
							<Link href={"/search" as Route}>
								<ArrowLeft className="size-4" />
								Back to Search
							</Link>
						</Button>
					</div>
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<Loader2 className="mx-auto mb-4 size-12 animate-spin text-primary" />
							<p className="text-muted-foreground">Loading item details...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (isError || !item) {
		return (
			<div className="container mx-auto min-h-screen px-4 py-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8">
						<Button variant="ghost" asChild>
							<Link href={"/search" as Route}>
								<ArrowLeft className="size-4" />
								Back to Search
							</Link>
						</Button>
					</div>
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<h1 className="mb-2 font-bold text-2xl">Item Not Found</h1>
							<p className="mb-6 text-muted-foreground">
								{error instanceof Error
									? error.message
									: "The item you're looking for doesn't exist or has been removed."}
							</p>
							<Button asChild>
								<Link href={"/search" as Route}>Return to Search</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Success state - display item details
	return (
		<div className="container mx-auto min-h-screen px-4 py-8">
			<div className="mx-auto max-w-4xl">
				{/* Back Navigation */}
				<motion.div
					className="mb-8 flex items-center justify-between"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<Button variant="ghost" asChild>
						<Link href={"/search" as Route}>
							<ArrowLeft className="size-4" />
							Back to Search
						</Link>
					</Button>
					<CachedDataBadge show={!isOnline && !isFetching && !!item} />
				</motion.div>

				{/* Item Details */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<ItemDetail item={item} showClaimInstructions={true} />
				</motion.div>

				{/* Additional Contact CTA */}
				<motion.div
					className="mt-8 rounded-xl border bg-muted/30 p-6 text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
				>
					<h3 className="mb-2 font-semibold text-lg">Have Questions?</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						Visit our about page for contact information, office hours, and
						detailed claim instructions.
					</p>
					<Button variant="outline" asChild>
						<Link href={"/about" as Route}>View Contact Information</Link>
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
