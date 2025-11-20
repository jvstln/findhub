"use client";

import type { ItemCategory } from "@findhub/shared/types/category";
import type { SearchFilters as SearchFiltersType } from "@findhub/shared/types/item";
import { Button } from "@findhub/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@findhub/ui/components/ui/card";
import { DatePicker } from "@findhub/ui/components/ui/date-picker";
import { Input } from "@findhub/ui/components/ui/input";
import { Label } from "@findhub/ui/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@findhub/ui/components/ui/select";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
	filters: SearchFiltersType;
	onCategoryChange: (category: string | undefined) => void;
	onLocationChange: (location: string | undefined) => void;
	onStatusChange: (status: SearchFiltersType["status"]) => void;
	onDateFromChange: (date: Date | undefined) => void;
	onDateToChange: (date: Date | undefined) => void;
	onReset: () => void;
	hasActiveFilters: boolean;
	categories?: ItemCategory[];
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
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<div className="flex items-center gap-2">
					<CardTitle className="flex items-center gap-2 font-semibold text-base">
						<Filter className="h-4 w-4" />
						Filters
					</CardTitle>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
						className="h-8 px-2 md:hidden"
					>
						{isExpanded ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</Button>
				</div>
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
			<CardContent
				className={`space-y-4 md:block ${isExpanded ? "block" : "hidden"}`}
			>
				{/* First Row: Category, Location, Status */}
				<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
					{/* Category Filter */}
					<div className="min-w-[200px] flex-1 space-y-2">
						<Label htmlFor="category-filter">Category</Label>
						<Select
							value={filters.categoryId || "all"}
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
									<SelectItem key={category.id} value={category.id.toString()}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Location Filter */}
					<div className="min-w-[200px] flex-1 space-y-2">
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
					<div className="min-w-[200px] flex-1 space-y-2">
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
				</div>

				{/* Second Row: Date Range Filters */}
				<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
					<div className="min-w-[200px] flex-1 space-y-2">
						<Label htmlFor="date-from-filter">Date Found (From)</Label>
						<DatePicker
							date={filters.dateFrom}
							onDateChange={onDateFromChange}
							placeholder="Select start date"
							maxDate={filters.dateTo || new Date()}
						/>
					</div>

					<div className="min-w-[200px] flex-1 space-y-2">
						<Label htmlFor="date-to-filter">Date Found (To)</Label>
						<DatePicker
							date={filters.dateTo}
							onDateChange={onDateToChange}
							placeholder="Select end date"
							minDate={filters.dateFrom}
							maxDate={new Date()}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
