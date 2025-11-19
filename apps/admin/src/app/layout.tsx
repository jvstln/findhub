import type { Metadata, Viewport } from "next";
import "@findhub/ui/index.css";
import { cn } from "@findhub/ui/lib";
import Providers from "@/components/providers";

export const metadata: Metadata = {
	title: "FindHub Admin - Lost & Found Management",
	description:
		"Admin interface for managing lost items, categories, and system data.",
	applicationName: "FindHub Admin",
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
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
