import type { LostItem } from "@findhub/shared/types/item";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatItemDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

interface ItemCardProps {
	item: LostItem;
	onClick?: () => void;
	className?: string;
}

export function ItemCard({ item, onClick, className }: ItemCardProps) {
	const formattedDate = formatItemDate(item.dateFound);

	return (
		<motion.div
			whileHover={{ y: -4 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			<Card
				className={cn(
					"cursor-pointer transition-all duration-200 hover:shadow-lg",
					className,
				)}
				onClick={onClick}
			>
				{item.imageUrl && (
					<div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
						<motion.div
							whileHover={{ scale: 1.05 }}
							transition={{ duration: 0.3 }}
							className="size-full"
						>
							<Image
								src={item.imageUrl}
								alt={item.name}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
							/>
						</motion.div>
					</div>
				)}

				<CardHeader>
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="line-clamp-1 text-lg">{item.name}</CardTitle>
						<StatusBadge status={item.status} />
					</div>
				</CardHeader>

				<CardContent className="space-y-2">
					<p className="line-clamp-2 text-muted-foreground text-sm">
						{item.description}
					</p>

					<div className="flex flex-col gap-1 text-muted-foreground text-xs">
						<div className="flex items-center gap-1.5">
							<MapPin className="size-3.5" />
							<span className="line-clamp-1">{item.location}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Calendar className="size-3.5" />
							<span>{formattedDate}</span>
						</div>
					</div>

					<div className="pt-1">
						<span className="inline-flex rounded-md bg-secondary px-2 py-1 font-medium text-secondary-foreground text-xs capitalize">
							{item.category}
						</span>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
