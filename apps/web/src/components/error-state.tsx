"use client";

import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api-client";

interface ErrorStateProps {
	error: unknown;
	onRetry?: () => void;
	title?: string;
	description?: string;
	showRetry?: boolean;
}

/**
 * Reusable error state component for displaying API errors
 * Shows user-friendly messages and optional retry functionality
 */
export function ErrorState({
	error,
	onRetry,
	title = "Error loading data",
	description,
	showRetry = true,
}: ErrorStateProps) {
	const errorMessage = getErrorMessage(error);
	const isOffline = !navigator.onLine;

	return (
		<div className="flex min-h-[300px] items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="mb-4 flex justify-center">
						<div className="rounded-full bg-destructive/10 p-3">
							{isOffline ? (
								<WifiOff className="h-6 w-6 text-destructive" />
							) : (
								<AlertCircle className="h-6 w-6 text-destructive" />
							)}
						</div>
					</div>
					<CardTitle className="text-center">{title}</CardTitle>
					<CardDescription className="text-center">
						{description ||
							(isOffline
								? "You appear to be offline. Please check your internet connection."
								: errorMessage)}
					</CardDescription>
				</CardHeader>
				{showRetry && onRetry && (
					<CardFooter className="flex justify-center">
						<Button onClick={onRetry} variant="default">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Again
						</Button>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}

/**
 * Inline error message component for form fields and smaller contexts
 */
interface InlineErrorProps {
	error: unknown;
	onRetry?: () => void;
}

export function InlineError({ error, onRetry }: InlineErrorProps) {
	const errorMessage = getErrorMessage(error);

	return (
		<div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
			<div className="flex items-start gap-3">
				<AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
				<div className="flex-1">
					<p className="text-destructive text-sm">{errorMessage}</p>
					{onRetry && (
						<Button
							onClick={onRetry}
							variant="ghost"
							size="sm"
							className="mt-2 h-auto p-0 text-destructive hover:text-destructive/80"
						>
							<RefreshCw className="mr-1 h-3 w-3" />
							Try again
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
