"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending } = authClient.useSession();

	// Allow access to login page without authentication
	const isLoginPage = pathname === "/admin/login";

	useEffect(() => {
		if (!isPending && !session && !isLoginPage) {
			router.push("/admin/login" as Route);
		}
	}, [session, isPending, isLoginPage, router]);

	// Login page doesn't need auth check or sidebar
	if (isLoginPage) {
		return <>{children}</>;
	}

	// Show loading state while checking auth
	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="mt-4 text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render if not authenticated
	if (!session) {
		return null;
	}

	return (
		<SidebarProvider>
			<AdminSidebar />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
