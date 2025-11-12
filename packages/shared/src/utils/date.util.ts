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
