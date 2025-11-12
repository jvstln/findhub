/**
 * Check if the browser is currently online
 */
export function isOnline(): boolean {
	return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Check if an error is a network error (likely due to being offline)
 */
export function isNetworkError(error: unknown): boolean {
	if (error instanceof Error) {
		// Check for common network error messages
		const message = error.message.toLowerCase();
		return (
			message.includes("network") ||
			message.includes("fetch") ||
			message.includes("connection") ||
			message.includes("timeout") ||
			message.includes("offline")
		);
	}
	return false;
}

/**
 * Wait for the browser to come back online
 * @param timeout - Maximum time to wait in milliseconds (default: 30 seconds)
 * @returns Promise that resolves when online or rejects on timeout
 */
export function waitForOnline(timeout = 30000): Promise<void> {
	return new Promise((resolve, reject) => {
		if (isOnline()) {
			resolve();
			return;
		}

		const timeoutId = setTimeout(() => {
			window.removeEventListener("online", handleOnline);
			reject(new Error("Timeout waiting for connection"));
		}, timeout);

		const handleOnline = () => {
			clearTimeout(timeoutId);
			window.removeEventListener("online", handleOnline);
			resolve();
		};

		window.addEventListener("online", handleOnline);
	});
}

/**
 * Execute a function when the browser comes back online
 * @param callback - Function to execute when online
 */
export function onOnline(callback: () => void): () => void {
	const handleOnline = () => {
		callback();
	};

	window.addEventListener("online", handleOnline);

	// Return cleanup function
	return () => {
		window.removeEventListener("online", handleOnline);
	};
}
