"use client";

import type React from "react";
import { SidebarTrigger } from "../../ui/sidebar";
import { cn } from "../../../lib/utils";

interface PageHeaderProps {
	title: string;
	description?: string;
	action?: React.ReactNode;
	backButton?: React.ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	description,
	action,
	backButton,
	className,
}: PageHeaderProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6",
				className,
			)}
		>
			<SidebarTrigger />
			{backButton}
			<div className="flex flex-1 items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl">{title}</h1>
					{description && (
						<p className="text-muted-foreground text-sm">{description}</p>
					)}
				</div>
				{action && <div className="flex items-center gap-2">{action}</div>}
			</div>
		</header>
	);
}
