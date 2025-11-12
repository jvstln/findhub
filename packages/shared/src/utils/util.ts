export const capitalize = (
	str: string,
	_lowerCaseWords: string | string[] = [],
) => {
	const lowerCaseWords = ["of", "and", "the", "a", "an"].concat(
		_lowerCaseWords,
	);

	return str
		.trim()
		.split(/\s+|-/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
		.replace(new RegExp(`\\b(${lowerCaseWords.join("|")})\\b`, "gi"), (match) =>
			match.toLowerCase(),
		);
};

export const statuses = [
	{
		aliases: ["neutral"],
		"--background": "var(--color-neutral-600)",
		"--foreground": "var(--color-neutral-100)",
	},
	{
		aliases: ["primary"],
		"--background": "var(--color-primary)",
		"--foreground": "var(--color-primary-foreground)",
	},
	{
		aliases: ["ongoing", "success", "completed"],
		"--background": "var(--color-green-600)",
		"--foreground": "var(--color-green-100)",
	},
] as const;

export type Status = (typeof statuses)[number]["aliases"][number];

export const getStatusStyles = (status: Status | string) => {
	const { aliases: _, ...statusWithoutAliases } =
		statuses.find((s) => s.aliases.find((a) => a === status)) || statuses[0];
	return statusWithoutAliases as React.CSSProperties;
};
