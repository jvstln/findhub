"use client";

import type { SearchFilters as SearchFiltersType } from "@findhub/shared/types/item";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
	filters: SearchFiltersType;
	onCategoryChange: (category: string | undefined) => void;
	onLocationChange: (location: string | undefined) => void;
	onStatusChange: (status: SearchFiltersType["status"]) => void;
	onDateFromChange: (date: Date | undefined) => void;
	onDateToChange: (date: Date | undefined) => void;
	onReset: () => void;
	hasActiveFilters: boolean;
	categories?: string[];
	locations?: string[];
}

const STATUS_OPTIONS = [
	{ value: "unclaimed", label: "Unclaimed" },
	{ value: "claimed", label: "Claimed" },
	{ value: "returned", label: "Returned" },
	{ value: "archived", label: "Archived" },
] as const;

/**
 * Search filters component for filtering lost items
 * Provides filters for category, location, status, and date range
 */
export function SearchFilters({
	filters,
	onCategoryChange,
	onLocationChange,
	onStatusChange,
	onDateFromChange,
	onDateToChange,
	onReset,
	hasActiveFilters,
	categories = [],
	locations = [],
}: SearchFiltersProps) {
	const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		onDateFromChange(value ? new Date(value) : undefined);
	};

	const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		onDateToChange(value ? new Date(value) : undefined);
	};

	const formatDateForInput = (date: Date | undefined) => {
		if (!date) return "";
		return date.toISOString().split("T")[0];
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="flex items-center gap-2 font-semibold text-base">
					<Filter className="h-4 w-4" />
					Filters
				</CardTitle>
				{hasActiveFilters && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onReset}
						className="h-8 px-2 text-xs"
					>
						<X className="mr-1 h-3 w-3" />
						Clear all
					</Button>
				)}
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Category Filter */}
				<div className="space-y-2">
					<Label htmlFor="category-filter">Category</Label>
					<Select
						value={filters.category || "all"}
						onValueChange={(value) =>
							onCategoryChange(value === "all" ? undefined : value)
						}
					>
						<SelectTrigger id="category-filter" className="w-full">
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{categories.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Location Filter */}
				<div className="space-y-2">
					<Label htmlFor="location-filter">Location</Label>
					{locations.length > 0 ? (
						<Select
							value={filters.location || "all"}
							onValueChange={(value) =>
								onLocationChange(value === "all" ? undefined : value)
							}
						>
							<SelectTrigger id="location-filter" className="w-full">
								<SelectValue placeholder="All locations" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All locations</SelectItem>
								{locations.map((location) => (
									<SelectItem key={location} value={location}>
										{location}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<Input
							id="location-filter"
							type="text"
							value={filters.location || ""}
							onChange={(e) => onLocationChange(e.target.value || undefined)}
							placeholder="Enter location"
							className="w-full"
						/>
					)}
				</div>

				{/* Status Filter */}
				<div className="space-y-2">
					<Label htmlFor="status-filter">Status</Label>
					<Select
						value={filters.status || "all"}
						onValueChange={(value) =>
							onStatusChange(
								value === "all"
									? undefined
									: (value as SearchFiltersType["status"]),
							)
						}
					>
						<SelectTrigger id="status-filter" className="w-full">
							<SelectValue placeholder="All statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
							{STATUS_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Date Range Filters */}
				<div className="space-y-2">
					<Label htmlFor="date-from-filter">Date Found (From)</Label>
					<Input
						id="date-from-filter"
						type="date"
						value={formatDateForInput(filters.dateFrom)}
						onChange={handleDateFromChange}
						max={formatDateForInput(filters.dateTo || new Date())}
						className="w-full"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="date-to-filter">Date Found (To)</Label>
					<Input
						id="date-to-filter"
						type="date"
						value={formatDateForInput(filters.dateTo)}
						onChange={handleDateToChange}
						min={formatDateForInput(filters.dateFrom)}
						max={formatDateForInput(new Date())}
						className="w-full"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
