"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
}

/**
 * Search bar component with debounced input
 * Delays onChange callback until user stops typing
 */
export function SearchBar({
	value = "",
	onChange,
	placeholder = "Search by name, description, or keywords...",
	debounceMs = 300,
}: SearchBarProps) {
	const [localValue, setLocalValue] = useState(value);

	// Sync local value with prop value
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	// Debounce the onChange callback
	useEffect(() => {
		const timer = setTimeout(() => {
			if (localValue !== value) {
				onChange(localValue);
			}
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [localValue, value, onChange, debounceMs]);

	const handleClear = () => {
		setLocalValue("");
		onChange("");
	};

	return (
		<div className="relative w-full">
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				value={localValue}
				onChange={(e) => setLocalValue(e.target.value)}
				placeholder={placeholder}
				className="pr-10 pl-10"
			/>
			{localValue && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleClear}
					className="-translate-y-1/2 absolute top-1/2 right-1 h-7 w-7 p-0"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Clear search</span>
				</Button>
			)}
		</div>
	);
}
