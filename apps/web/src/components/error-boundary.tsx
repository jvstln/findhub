"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onReset?: () => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary component to catch and handle React component errors
 * Displays a user-friendly error message with retry functionality
 */
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error to console in development
		if (process.env.NODE_ENV === "development") {
			console.error("Error Boundary caught an error:", error, errorInfo);
		}

		// In production, you would send this to an error tracking service
		// Example: Sentry.captureException(error, { extra: errorInfo });
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		this.props.onReset?.();
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div className="flex min-h-[400px] items-center justify-center p-4">
					<Card className="w-full max-w-md">
						<CardHeader>
							<div className="mb-4 flex justify-center">
								<div className="rounded-full bg-destructive/10 p-3">
									<AlertTriangle className="h-6 w-6 text-destructive" />
								</div>
							</div>
							<CardTitle className="text-center">
								Something went wrong
							</CardTitle>
							<CardDescription className="text-center">
								We encountered an unexpected error. Please try again.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{process.env.NODE_ENV === "development" && this.state.error && (
								<div className="rounded-md bg-muted p-3">
									<p className="font-mono text-muted-foreground text-sm">
										{this.state.error.message}
									</p>
								</div>
							)}
						</CardContent>
						<CardFooter className="flex justify-center">
							<Button onClick={this.handleReset} variant="default">
								<RefreshCw className="mr-2 h-4 w-4" />
								Try Again
							</Button>
						</CardFooter>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
