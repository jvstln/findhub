import type { LostItemWithDecryptedSecurity } from "@findhub/db/schemas/items";
import type { LostItemWithImages } from "@findhub/shared/types/item";
import { Badge } from "@findhub/ui/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@findhub/ui/components/ui/card";
import { Separator } from "@findhub/ui/components/ui/separator";
import { Calendar, Clock, EyeOffIcon, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { formatItemDateLong, formatItemDateTime } from "@/lib/date-utils";
import { SecurityQuestionsDisplay } from "./security-questions-display";
import { StatusBadge } from "./status-badge";

interface ItemDetailProps {
	item: LostItemWithImages | LostItemWithDecryptedSecurity;
	showClaimInstructions?: boolean;
}

// Type guard to check if item has security questions
function hasSecurityQuestions(
	item: LostItemWithImages | LostItemWithDecryptedSecurity,
): item is LostItemWithDecryptedSecurity {
	return "securityQuestions" in item;
}

export function ItemDetail({
	item,
	showClaimInstructions = true,
}: ItemDetailProps) {
	const formattedDateFound = formatItemDateLong(item.dateFound);
	const formattedCreatedAt = formatItemDateTime(item.createdAt);
	const { data: categories } = useCategories();
	const categoryName = categories?.find((c) => c.id === item.categoryId)?.name;

	return (
		<div className="space-y-6">
			{/* Images Section */}
			{item.images && item.images.length > 0 && (
				<div className="space-y-4">
					<div className="relative aspect-video w-full overflow-hidden rounded-xl border">
						<Image
							src={item.images[0].url}
							alt={item.name}
							fill
							className="object-contain"
							sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
							priority
						/>
					</div>
					{item.images.length > 1 && (
						<div className="grid grid-cols-4 gap-2">
							{item.images.slice(1).map((image, index) => (
								<div
									key={image.id}
									className="relative aspect-square overflow-hidden rounded-lg border"
								>
									<Image
										src={image.url}
										alt={`${item.name} - Image ${index + 2}`}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 25vw, 150px"
									/>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Main Details Card */}
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="space-y-2">
							<CardTitle className="text-2xl">{item.name}</CardTitle>
							<div className="flex flex-wrap items-center gap-2">
								<StatusBadge status={item.status} />
								{categoryName && (
									<span className="inline-flex rounded-md bg-secondary px-3 py-1 font-medium text-secondary-foreground text-sm">
										{categoryName}
									</span>
								)}
							</div>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Description */}
					<div>
						<h3 className="mb-2 font-semibold text-sm">Description</h3>
						<p className="text-muted-foreground leading-relaxed">
							{item.description}
						</p>
					</div>

					<Separator />

					{/* Details Grid */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="flex items-start gap-3">
							<MapPin className="mt-0.5 size-5 text-muted-foreground" />
							<div className="flex-1">
								<div className="mb-1 flex items-center gap-2">
									<p className="font-medium text-sm">Location Found</p>
									{item.hideLocation && (
										<Badge
											variant="secondary"
											className="flex items-center gap-1 text-muted-foreground"
										>
											<EyeOffIcon className="size-3" />
											<span className="text-xs">Hidden from public</span>
										</Badge>
									)}
								</div>
								<p className="text-muted-foreground text-sm">{item.location}</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Calendar className="mt-0.5 size-5 text-muted-foreground" />
							<div className="flex-1">
								<div className="mb-1 flex items-center gap-2">
									<p className="font-medium text-sm">Date Found</p>
									{item.hideDateFound && (
										<Badge
											variant="secondary"
											className="flex items-center gap-1 text-muted-foreground"
										>
											<EyeOffIcon className="size-3" />
											<span className="text-xs">Hidden from public</span>
										</Badge>
									)}
								</div>
								<p className="text-muted-foreground text-sm">
									{formattedDateFound}
								</p>
							</div>
						</div>

						{item.keywords && (
							<div className="flex items-start gap-3">
								<Tag className="mt-0.5 size-5 text-muted-foreground" />
								<div>
									<p className="font-medium text-sm">Keywords</p>
									<p className="text-muted-foreground text-sm">
										{item.keywords}
									</p>
								</div>
							</div>
						)}

						<div className="flex items-start gap-3">
							<Clock className="mt-0.5 size-5 text-muted-foreground" />
							<div>
								<p className="font-medium text-sm">Reported</p>
								<p className="text-muted-foreground text-sm">
									{formattedCreatedAt}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Security Questions Section (Admin Only) */}
			{hasSecurityQuestions(item) && item.securityQuestions.length > 0 && (
				<SecurityQuestionsDisplay questions={item.securityQuestions} />
			)}

			{/* Claim Instructions */}
			{showClaimInstructions && item.status === "unclaimed" && (
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader>
						<CardTitle className="text-lg">How to Claim This Item</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-muted-foreground text-sm">
							If this item belongs to you, please visit the admin office to
							claim it. You may need to provide identification or proof of
							ownership.
						</p>
						<div className="rounded-lg bg-background p-4">
							<p className="font-medium text-sm">Contact Information</p>
							<p className="text-muted-foreground text-sm">
								Visit the Lost & Found office during business hours or contact
								us for more information.
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Status Message for Claimed/Returned Items */}
			{item.status === "claimed" && (
				<Card className="border-yellow-500/20 bg-yellow-500/5">
					<CardContent className="py-4">
						<p className="text-center text-muted-foreground text-sm">
							This item has been claimed and is awaiting pickup.
						</p>
					</CardContent>
				</Card>
			)}

			{item.status === "returned" && (
				<Card className="border-green-500/20 bg-green-500/5">
					<CardContent className="py-4">
						<p className="text-center text-muted-foreground text-sm">
							This item has been successfully returned to its owner.
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
