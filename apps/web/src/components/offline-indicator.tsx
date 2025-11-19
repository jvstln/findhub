"use client";

import { CheckCircle2, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@findhub/ui/hooks";

export function OfflineIndicator() {
	const { isOnline, wasOffline } = useOnlineStatus();

	// Show reconnection message
	if (isOnline && wasOffline) {
		return (
			<div className="slide-in-from-bottom-5 fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md animate-in">
				<div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500 px-4 py-3 text-white shadow-lg">
					<CheckCircle2 className="h-5 w-5 shrink-0" />
					<p className="font-medium text-sm">
						Back online. Syncing latest data...
					</p>
				</div>
			</div>
		);
	}

	// Show offline message
	if (!isOnline) {
		return (
			<div className="slide-in-from-bottom-5 fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md animate-in">
				<div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500 px-4 py-3 text-white shadow-lg">
					<WifiOff className="h-5 w-5 shrink-0" />
					<p className="font-medium text-sm">
						You are offline. Showing cached results.
					</p>
				</div>
			</div>
		);
	}

	return null;
}
