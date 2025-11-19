"use client";

import { Badge } from "@findhub/ui/components/ui/badge";
import { Database } from "lucide-react";

interface CachedDataBadgeProps {
	show: boolean;
}

/**
 * Badge to indicate data is being served from cache (offline mode)
 */
export function CachedDataBadge({ show }: CachedDataBadgeProps) {
	if (!show) return null;

	return (
		<Badge
			variant="outline"
			className="gap-1.5 border-yellow-500/50 text-yellow-700"
		>
			<Database className="h-3 w-3" />
			Cached Data
		</Badge>
	);
}
