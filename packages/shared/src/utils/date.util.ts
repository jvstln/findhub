export const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

export const monthsShort = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
] as const;

export const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
] as const;

export const daysShort = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
] as const;

export function formatDate(date: Date | string, format?: string) {
	const d = new Date(date);
	if (!format) {
		return d.toLocaleDateString();
	}

	const tokens = {
		YYYY: d.getFullYear(),
		YY: String(d.getFullYear()).slice(-2),
		MMMM: months[d.getMonth()],
		MMM: monthsShort[d.getMonth()],
		MM: String(d.getMonth() + 1).padStart(2, "0"),
		M: d.getMonth() + 1,
		DD: String(d.getDate()).padStart(2, "0"),
		D: d.getDate(),
		dddd: days[d.getDay()],
		ddd: daysShort[d.getDay()],
		HH: String(d.getHours()).padStart(2, "0"),
		H: d.getHours(),
		hh: String(d.getHours() % 12 || 12).padStart(2, "0"),
		h: d.getHours() % 12 || 12,
		mm: String(d.getMinutes()).padStart(2, "0"),
		m: d.getMinutes(),
		ss: String(d.getSeconds()).padStart(2, "0"),
		s: d.getSeconds(),
		A: d.getHours() >= 12 ? "PM" : "AM",
		a: d.getHours() >= 12 ? "pm" : "am",
	} as const;

	return format.replace(
		new RegExp(Object.keys(tokens).join("|"), "g"),
		(match) => String(tokens[match as keyof typeof tokens]) || match,
	);
}

/**
 * Format a date for display in item cards (short format)
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Jan 15, 2024") or "N/A" if date is null/undefined
 */
export function formatItemDate(date: Date | string | null | undefined): string {
	if (!date) return "N/A";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	if (!dateObj || Number.isNaN(dateObj.getTime())) return "N/A";
	return dateObj.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Format a date for detailed display (long format)
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Monday, January 15, 2024") or "N/A" if date is null/undefined
 */
export function formatItemDateLong(
	date: Date | string | null | undefined,
): string {
	if (!date) return "N/A";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	if (!dateObj || Number.isNaN(dateObj.getTime())) return "N/A";
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
 * @returns Formatted date string with time (e.g., "Jan 15, 2024, 2:30 PM") or "N/A" if date is null/undefined
 */
export function formatItemDateTime(
	date: Date | string | null | undefined,
): string {
	if (!date) return "N/A";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	if (!dateObj || Number.isNaN(dateObj.getTime())) return "N/A";
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
 * @returns Relative time string or "N/A" if date is null/undefined
 */
export function formatRelativeTime(
	date: Date | string | null | undefined,
): string {
	if (!date) return "N/A";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	if (!dateObj || Number.isNaN(dateObj.getTime())) return "N/A";

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
