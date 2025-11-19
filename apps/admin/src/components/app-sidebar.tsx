"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@findhub/ui/components/ui/sidebar";
import { LayoutDashboard, LogOut, Package, Tags } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

interface NavigationItem {
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	href: Route;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
	{
		title: "Dashboard",
		icon: LayoutDashboard,
		href: "/dashboard",
	},
	{
		title: "Items",
		icon: Package,
		href: "/items",
	},
	{
		title: "Categories",
		icon: Tags,
		href: "/categories",
	},
] as const;

const FOOTER_ITEMS: NavigationItem[] = [
	{
		title: "Logout",
		icon: LogOut,
		href: "/login",
	},
] as const;

export function AppSidebar() {
	const pathname = usePathname();
	const { setOpenMobile, isMobile } = useSidebar();

	const handleLinkClick = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<Sidebar>
			<SidebarHeader className="border-b px-6 py-4">
				<Link
					href="/dashboard"
					className="flex items-center gap-2"
					onClick={handleLinkClick}
				>
					<Package className="size-6" />
					<span className="font-bold text-lg">FindHub Admin</span>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{NAVIGATION_ITEMS.map((item) => {
								const isActive = pathname.startsWith(item.href);
								const Icon = item.icon;
								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton asChild isActive={isActive}>
											<Link href={item.href} onClick={handleLinkClick}>
												<Icon className="size-4" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t p-4">
				<SidebarMenu>
					{FOOTER_ITEMS.map((item) => {
						const Icon = item.icon;
						return (
							<SidebarMenuItem key={item.href}>
								<SidebarMenuButton asChild>
									<Link href={item.href} onClick={handleLinkClick}>
										<Icon className="size-4" />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
