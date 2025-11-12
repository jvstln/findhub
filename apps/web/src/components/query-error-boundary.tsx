"use client";

import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ErrorBoundary } from "./error-boundary";

interface QueryErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * Error Boundary specifically for TanStack Query errors
 * Automatically resets query errors when the user retries
 */
export function QueryErrorBoundary({
	children,
	fallback,
}: QueryErrorBoundaryProps) {
	const { reset } = useQueryErrorResetBoundary();

	return (
		<ErrorBoundary fallback={fallback} onReset={reset}>
			{children}
		</ErrorBoundary>
	);
}
