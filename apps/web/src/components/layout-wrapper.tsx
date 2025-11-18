"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";
import { Header } from "./header";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	// Don't show header/footer on admin pages (they have their own layout)
	const isAdminPage = pathname?.startsWith("/admin");

	if (isAdminPage) {
		return <>{children}</>;
	}

	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
