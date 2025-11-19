import { Skeleton } from "./skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";

interface TableSkeletonProps {
	rows?: number;
	columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 7 }: TableSkeletonProps) {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						{Array.from({ length: columns }, (_, i) => i).map((i) => (
							<TableHead key={`header-${i}`}>
								<Skeleton className="h-4 w-20" />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: rows }, (_, i) => i).map((rowIndex) => (
						<TableRow key={`row-${rowIndex}`}>
							{Array.from({ length: columns }, (_, i) => i).map((colIndex) => (
								<TableCell key={`cell-${rowIndex}-${colIndex}`}>
									{colIndex === 0 ? (
										<Skeleton className="size-16 rounded-md" />
									) : (
										<Skeleton className="h-4 w-full" />
									)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
