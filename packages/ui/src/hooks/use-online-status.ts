"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Track the browser's online/offline status and trigger query refetches.
 */
export function useOnlineStatus() {
	const [isOnline, setIsOnline] = useState(true);
	const [wasOffline, setWasOffline] = useState(false);
	const queryClient = useQueryClient();

	useEffect(() => {
		setIsOnline(navigator.onLine);

		const handleOnline = () => {
			setIsOnline(true);
			setWasOffline(true);

			queryClient.refetchQueries({
				type: "active",
				stale: true,
			});

			setTimeout(() => setWasOffline(false), 3000);
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

