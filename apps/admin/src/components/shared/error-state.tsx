"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
	title?: string;
	message: string;
	onRetry?: () => void;
	className?: string;
}

export function ErrorState({
	title = "Error",
	message,
	onRetry,
	className,
}: ErrorStateProps) {
	return (
		<div
			className={cn(
				"flex min-h-[400px] items-center justify-center p-6",
				className,
			)}
		>
			<Card className="w-full max-w-md">
				<CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
					<AlertCircle className="size-12 text-destructive" />
					<div className="text-center">
						<h3 className="font-semibold text-lg">{title}</h3>
						<p className="text-muted-foreground text-sm">{message}</p>
					</div>
					{onRetry && (
						<Button onClick={onRetry} variant="outline">
							Try Again
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
