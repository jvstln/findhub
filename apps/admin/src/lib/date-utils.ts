/**
 * Format a date for display in item cards (short format)
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatItemDate(date: Date | string): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateObj.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Format a date for detailed display (long format)
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Monday, January 15, 2024")
 */
export function formatItemDateLong(date: Date | string): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateObj.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Format a date with time for timestamps
 * @param date - Date to format
 * @returns Formatted date string with time (e.g., "Jan 15, 2024, 2:30 PM")
 */
export function formatItemDateTime(date: Date | string): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateObj.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Format a date for relative display (e.g., "2 days ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffInMs = now.getTime() - dateObj.getTime();
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInDays === 0) {
		return "Today";
	}
	if (diffInDays === 1) {
		return "Yesterday";
	}
	if (diffInDays < 7) {
		return `${diffInDays} days ago`;
	}
	if (diffInDays < 30) {
		const weeks = Math.floor(diffInDays / 7);
		return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
	}
	if (diffInDays < 365) {
		const months = Math.floor(diffInDays / 30);
		return `${months} ${months === 1 ? "month" : "months"} ago`;
	}

	const years = Math.floor(diffInDays / 365);
	return `${years} ${years === 1 ? "year" : "years"} ago`;
}
