"use client";

import { Badge } from "@findhub/ui/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@findhub/ui/components/ui/tooltip";
import { cn } from "@findhub/ui/lib/utils";
import { CalendarIcon, EyeOffIcon, MapPinIcon } from "lucide-react";

interface PrivacyStatusBadgeProps {
	hideLocation: boolean;
	hideDateFound: boolean;
	className?: string;
	variant?: "default" | "compact";
}

export function PrivacyStatusBadge({
	hideLocation,
	hideDateFound,
	className,
	variant = "default",
}: PrivacyStatusBadgeProps) {
	// If no privacy controls are active, don't render anything
	if (!hideLocation && !hideDateFound) {
		return null;
	}

	const hiddenFields: string[] = [];
	if (hideLocation) hiddenFields.push("Location");
	if (hideDateFound) hiddenFields.push("Date found");

	const tooltipContent = (
		<div className="space-y-1">
			<p className="font-medium text-xs">Hidden from public:</p>
			<ul className="space-y-0.5 text-xs">
				{hideLocation && (
					<li className="flex items-center gap-1.5">
						<MapPinIcon className="size-3" />
						<span>Location</span>
					</li>
				)}
				{hideDateFound && (
					<li className="flex items-center gap-1.5">
						<CalendarIcon className="size-3" />
						<span>Date found</span>
					</li>
				)}
			</ul>
		</div>
	);

	if (variant === "compact") {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge
							variant="secondary"
							className={cn(
								"flex items-center gap-1 text-muted-foreground",
								className,
							)}
						>
							<EyeOffIcon className="size-3" />
							<span className="sr-only">
								Privacy controls active: {hiddenFields.join(", ")}
							</span>
						</Badge>
					</TooltipTrigger>
					<TooltipContent side="top" align="center">
						{tooltipContent}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Badge
						variant="secondary"
						className={cn(
							"flex items-center gap-1.5 text-muted-foreground",
							className,
						)}
					>
						<EyeOffIcon className="size-3.5" />
						<span className="text-xs">
							{hideLocation && hideDateFound
								? "Privacy active"
								: hiddenFields[0]}
						</span>
					</Badge>
				</TooltipTrigger>
				<TooltipContent side="top" align="center">
					{tooltipContent}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
