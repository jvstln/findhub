import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ItemCardSkeleton() {
	return (
		<Card>
			<Skeleton className="aspect-video w-full rounded-t-xl rounded-b-none" />
			<CardHeader>
				<div className="flex items-start justify-between gap-2">
					<Skeleton className="h-6 w-3/4" />
					<Skeleton className="h-5 w-20" />
				</div>
			</CardHeader>
			<CardContent className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
				<div className="flex flex-col gap-1 pt-2">
					<Skeleton className="h-3 w-1/2" />
					<Skeleton className="h-3 w-1/3" />
				</div>
				<Skeleton className="mt-2 h-6 w-20" />
			</CardContent>
		</Card>
	);
}
