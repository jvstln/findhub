"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	title?: string;
	message: string;
	icon?: LucideIcon;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export function EmptyState({
	title,
	message,
	icon: Icon,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex min-h-[400px] items-center justify-center rounded-lg border border-dashed",
				className,
			)}
		>
			<div className="flex flex-col items-center justify-center space-y-4 text-center">
				{Icon && <Icon className="size-12 text-muted-foreground" />}
				<div className="space-y-2">
					{title && (
						<h3 className="font-semibold text-foreground text-lg">{title}</h3>
					)}
					<p className="text-muted-foreground text-sm">{message}</p>
				</div>
				{action && (
					<Button onClick={action.onClick} variant="outline">
						{action.label}
					</Button>
				)}
			</div>
		</div>
	);
}
