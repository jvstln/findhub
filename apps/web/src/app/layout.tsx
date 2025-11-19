import type { Metadata, Viewport } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { OfflineIndicator } from "@/components/offline-indicator";
import Providers from "@/components/providers";
import "@findhub/ui/index.css";
import { cn } from "@findhub/ui/lib/utils";

export const metadata: Metadata = {
	title: "FindHub - Campus Lost & Found",
	description:
		"Your trusted campus lost and found service. Search for lost items and reunite with your belongings.",
	applicationName: "FindHub",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "FindHub",
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: "FindHub",
		title: "FindHub - Campus Lost & Found",
		description:
			"Your trusted campus lost and found service. Search for lost items and reunite with your belongings.",
	},
	twitter: {
		card: "summary",
		title: "FindHub - Campus Lost & Found",
		description:
			"Your trusted campus lost and found service. Search for lost items and reunite with your belongings.",
	},
};

export const viewport: Viewport = {
	themeColor: "#3b82f6",
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn("antialiased")}>
				<ErrorBoundary>
					<Providers>
						<LayoutWrapper>{children}</LayoutWrapper>
						<OfflineIndicator />
					</Providers>
				</ErrorBoundary>
			</body>
		</html>
	);
}
