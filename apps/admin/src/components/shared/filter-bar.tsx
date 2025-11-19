"use client";

import { Button } from "@findhub/ui/components/ui/button";
import { Card, CardContent } from "@findhub/ui/components/ui/card";
import { Input } from "@findhub/ui/components/ui/input";
import { cn } from "@findhub/ui/lib/utils";
import { Search, X } from "lucide-react";

interface FilterBarProps {
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;
	children?: React.ReactNode;
	onClear?: () => void;
	hasActiveFilters?: boolean;
	className?: string;
}

export function FilterBar({
	searchValue = "",
	onSearchChange,
	searchPlaceholder = "Search...",
	children,
	onClear,
	hasActiveFilters = false,
	className,
}: FilterBarProps) {
	return (
		<Card className={cn("", className)}>
			<CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
				{onSearchChange && (
					<div className="relative flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
						<Input
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-9"
						/>
					</div>
				)}
				{children}
				{hasActiveFilters && onClear && (
					<Button variant="outline" onClick={onClear} size="sm">
						<X className="mr-2 size-4" />
						Clear Filters
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
