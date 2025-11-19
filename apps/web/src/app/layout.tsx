import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { OfflineIndicator } from "@/components/offline-indicator";
import Providers from "@/components/providers";
import { LayoutWrapper } from "@findhub/ui/components/layout/public";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

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
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
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
