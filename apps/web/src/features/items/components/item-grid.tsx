import type { PublicLostItem } from "@findhub/shared/types/item";
import { cn } from "@findhub/ui/lib/utils";
import { motion } from "motion/react";
import { ItemCard } from "./item-card";

interface ItemGridProps {
	items: PublicLostItem[];
	onItemClick?: (item: PublicLostItem) => void;
	className?: string;
	emptyMessage?: string;
}

export function ItemGrid({
	items,
	onItemClick,
	className,
	emptyMessage = "No items found",
}: ItemGridProps) {
	if (items.length === 0) {
		return (
			<div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
				<div className="text-center">
					<p className="text-lg text-muted-foreground">{emptyMessage}</p>
				</div>
			</div>
		);
	}

	return (
		<motion.div
			className={cn(
				"grid gap-6",
				"grid-cols-1",
				"md:grid-cols-2",
				"lg:grid-cols-3",
				className,
			)}
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: 0.05,
					},
				},
			}}
		>
			{items.map((item) => (
				<motion.div
					key={item.id}
					variants={{
						hidden: { opacity: 0, y: 20 },
						visible: { opacity: 1, y: 0 },
					}}
					transition={{ duration: 0.3 }}
				>
					<ItemCard
						item={item}
						onClick={onItemClick ? () => onItemClick(item) : undefined}
					/>
				</motion.div>
			))}
		</motion.div>
	);
}
