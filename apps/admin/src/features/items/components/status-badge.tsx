import type { ItemStatus } from "@findhub/shared/types/item";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
	status: ItemStatus;
	className?: string;
}

const statusConfig: Record<
	ItemStatus,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
	}
> = {
	unclaimed: {
		label: "Unclaimed",
		variant: "default",
	},
	claimed: {
		label: "Claimed",
		variant: "secondary",
	},
	returned: {
		label: "Returned",
		variant: "outline",
	},
	archived: {
		label: "Archived",
		variant: "destructive",
	},
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<Badge variant={config.variant} className={className}>
			{config.label}
		</Badge>
	);
}
