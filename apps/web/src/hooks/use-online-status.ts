"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Hook to track online/offline status and handle reconnection
 * @returns Object with isOnline status and wasOffline flag
 */
export function useOnlineStatus() {
	const [isOnline, setIsOnline] = useState(true);
	const [wasOffline, setWasOffline] = useState(false);
	const queryClient = useQueryClient();

	useEffect(() => {
		// Set initial online status
		setIsOnline(navigator.onLine);

		const handleOnline = () => {
			setIsOnline(true);
			setWasOffline(true);

			// Refetch all queries when coming back online
			queryClient.refetchQueries({
				type: "active",
				stale: true,
			});

			// Reset wasOffline flag after 3 seconds
			setTimeout(() => {
				setWasOffline(false);
			}, 3000);
		};

		const handleOffline = () => {
			setIsOnline(false);
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [queryClient]);

	return { isOnline, wasOffline };
}
