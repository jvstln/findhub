import { type DefaultOptions, QueryClient } from "@tanstack/react-query";

/**
 * Default options for TanStack Query with offline support
 */
const queryConfig: DefaultOptions = {
	queries: {
		// Refetch on window focus for fresh data
		refetchOnWindowFocus: true,
		// Retry failed requests, but not if offline
		retry: (failureCount) => {
			// Don't retry if we're offline
			if (!navigator.onLine) return false;
			// Retry up to 2 times for other errors
			return failureCount < 2;
		},
		// Stale time of 30 seconds (data considered fresh for 30s)
		staleTime: 30 * 1000,
		// Cache time of 30 minutes (data kept in cache for 30 min after becoming unused)
		// Longer cache time helps with offline functionality
		gcTime: 30 * 60 * 1000,
		// Refetch on reconnect to sync data
		refetchOnReconnect: true,
		// Network mode: always try to fetch, but use cache if offline
		networkMode: "online",
	},
	mutations: {
		// Don't retry mutations if offline
		retry: (failureCount) => {
			if (!navigator.onLine) return false;
			return failureCount < 1;
		},
		// Network mode for mutations: only execute when online
		networkMode: "online",
		// Global error handler for mutations
		onError: (error) => {
			// Only show toast for unexpected errors (not validation errors)
			// Individual mutations can override this behavior
			if (process.env.NODE_ENV === "development") {
				console.error("Mutation error:", error);
			}
			// Don't show toast here - let individual mutations handle it
			// This prevents duplicate error messages
		},
	},
};

/**
 * Create a new QueryClient instance with default configuration
 */
export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: queryConfig,
	});
}

/**
 * Singleton QueryClient instance for client-side usage
 * This should only be used in client components
 */
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always create a new query client
		return makeQueryClient();
	}

	// Browser: create query client if it doesn't exist yet
	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}

	return browserQueryClient;
}
