"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	// Don't show sidebar on login/signup pages
	const isAuthPage = pathname === "/login" || pathname === "/signup";

	if (isAuthPage) {
		return <>{children}</>;
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
