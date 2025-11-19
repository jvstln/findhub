import { LockKeyhole } from "lucide-react";

interface ObscuredFieldIndicatorProps {
	fieldName: string;
	className?: string;
}

export function ObscuredFieldIndicator({
	fieldName,
	className,
}: ObscuredFieldIndicatorProps) {
	return (
		<div
			className={`flex items-center gap-3 rounded-lg border border-muted bg-muted/30 p-4 ${className || ""}`}
		>
			<LockKeyhole className="size-5 shrink-0 text-muted-foreground" />
			<div className="space-y-0.5">
				<p className="font-medium text-sm capitalize">{fieldName} is hidden</p>
				<p className="text-muted-foreground text-xs">
					Please contact the admin office for details
				</p>
			</div>
		</div>
	);
}
