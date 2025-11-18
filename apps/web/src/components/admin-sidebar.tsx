"use client";

import { Home, LogOut, Package, Plus, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const navigationItems = [
	{
		title: "Dashboard",
		href: "/admin/dashboard",
		icon: Home,
	},
	{
		title: "All Items",
		href: "/admin/items",
		icon: Package,
	},
	{
		title: "Add New Item",
		href: "/admin/items/new",
		icon: Plus,
	},
];

const publicItems = [
	{
		title: "Public Search",
		href: "/search",
		icon: Search,
	},
	{
		title: "Home",
		href: "/",
		icon: Home,
	},
];

export function AdminSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/" as Route);
	};

	return (
		<Sidebar>
			<SidebarHeader className="border-b p-4">
				<Link
					href={"/admin/dashboard" as Route}
					className="flex items-center gap-2"
				>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Package className="size-4" />
					</div>
					<div className="flex flex-col">
						<span className="font-semibold">FindHub</span>
						<span className="text-muted-foreground text-xs">Admin Panel</span>
					</div>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Management</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild isActive={pathname === item.href}>
										<Link href={item.href as Route}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator />

				<SidebarGroup>
					<SidebarGroupLabel>Public Pages</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{publicItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild>
										<Link href={item.href as Route}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t p-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="flex items-center gap-2 px-2 py-1.5">
							<div className="flex size-8 items-center justify-center rounded-full bg-muted">
								<span className="font-medium text-sm">
									{session?.user?.email?.[0]?.toUpperCase() || "A"}
								</span>
							</div>
							<div className="flex flex-1 flex-col">
								<span className="font-medium text-sm">
									{session?.user?.name || "Admin"}
								</span>
								<span className="text-muted-foreground text-xs">
									{session?.user?.email}
								</span>
							</div>
						</div>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={handleSignOut}>
							<LogOut />
							<span>Sign Out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
