"use client";

import { Toaster } from "@findhub/ui/components/ui/sonner";
import { getQueryClient } from "@findhub/ui/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./theme-provider";

export function BaseProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<Toaster position="top-center" richColors />
			</ThemeProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
