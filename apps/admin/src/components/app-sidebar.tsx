"use client";

import { LayoutDashboard, LogOut, Package, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";

const menuItems = [
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
];

export function AppSidebar() {
	const pathname = usePathname();
	const { setOpenMobile, isMobile } = useSidebar();

	const handleLinkClick = () => {
		// Close sidebar on mobile when a link is clicked
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
							{menuItems.map((item) => {
								const isActive = pathname.startsWith(item.href);
								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton asChild isActive={isActive}>
											<Link href={item.href} onClick={handleLinkClick}>
												<item.icon className="size-4" />
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
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href="/settings" onClick={handleLinkClick}>
								<Settings className="size-4" />
								<span>Settings</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href="/login" onClick={handleLinkClick}>
								<LogOut className="size-4" />
								<span>Logout</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
