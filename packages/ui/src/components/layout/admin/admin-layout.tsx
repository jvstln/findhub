"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "../../ui/sidebar";
import { AppSidebar } from "./app-sidebar";

interface AdminLayoutProps {
	children: React.ReactNode;
}

const AUTH_PAGES = ["/login", "/signup"] as const;

export function AdminLayout({ children }: AdminLayoutProps) {
	const pathname = usePathname();
	const isAuthPage = AUTH_PAGES.some((page) => pathname === page);

	if (isAuthPage) {
		return <>{children}</>;
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="flex flex-col">{children}</SidebarInset>
		</SidebarProvider>
	);
}
