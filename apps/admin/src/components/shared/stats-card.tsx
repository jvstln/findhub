"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon?: LucideIcon;
	iconClassName?: string;
	delay?: number;
	className?: string;
}

export function StatsCard({
	title,
	value,
	description,
	icon: Icon,
	iconClassName,
	delay = 0,
	className,
}: StatsCardProps) {
	const content = (
		<Card className={cn("transition-all hover:shadow-md", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				{Icon && (
					<Icon className={cn("size-4 text-muted-foreground", iconClassName)} />
				)}
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value}</div>
				{description && (
					<p className="text-muted-foreground text-xs">{description}</p>
				)}
			</CardContent>
		</Card>
	);

	if (delay > 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay }}
			>
				{content}
			</motion.div>
		);
	}

	return content;
}
