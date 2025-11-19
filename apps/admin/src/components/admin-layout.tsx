"use client";

import {
	SidebarInset,
	SidebarProvider,
} from "@findhub/ui/components/ui/sidebar";
import { usePathname } from "next/navigation";
import type React from "react";
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
