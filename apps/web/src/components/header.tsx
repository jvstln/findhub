"use client";

import { LogOut, Menu, Search, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Header() {
	const pathname = usePathname();
	const router = useRouter();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Get session data
	const { data: session, isPending } = authClient.useSession();

	const isPublicPage = !pathname?.startsWith("/dashboard");

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/" as Route);
	};

	const publicNavItems = [
		{ href: "/" as Route, label: "Home" },
		{ href: "/search" as Route, label: "Search" },
		{ href: "/about" as Route, label: "About" },
	];

	const adminNavItems = [
		{ href: "/dashboard" as Route, label: "Dashboard" },
		{ href: "/dashboard/items/new" as Route, label: "Add Item" },
	];

	const navItems = isPublicPage ? publicNavItems : adminNavItems;

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				{/* Logo */}
				<Link
					href={"/" as Route}
					className="flex items-center gap-2 font-bold text-xl transition-colors hover:text-primary"
				>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						F
					</div>
					<span>FindHub</span>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden items-center gap-6 md:flex">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={`font-medium text-sm transition-colors hover:text-primary ${
								pathname === item.href
									? "text-primary"
									: "text-muted-foreground"
							}`}
						>
							{item.label}
						</Link>
					))}
				</nav>

				{/* Desktop Actions */}
				<div className="hidden items-center gap-4 md:flex">
					{isPublicPage && (
						<Button variant="ghost" size="sm" asChild>
							<Link href={"/search" as Route}>
								<Search className="size-4" />
								Search
							</Link>
						</Button>
					)}

					{!isPending && session?.user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="gap-2">
									<User className="size-4" />
									<span className="max-w-[100px] truncate">
										{session.user.email}
									</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<div className="flex items-center justify-start gap-2 p-2">
									<div className="flex flex-col space-y-1">
										<p className="font-medium text-sm leading-none">
											{session.user.name || "Admin User"}
										</p>
										<p className="text-muted-foreground text-xs leading-none">
											{session.user.email}
										</p>
									</div>
								</div>
								<DropdownMenuSeparator />
								{isPublicPage && (
									<DropdownMenuItem asChild>
										<Link href={"/dashboard" as Route}>Dashboard</Link>
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									onClick={handleSignOut}
									className="text-destructive"
								>
									<LogOut className="mr-2 size-4" />
									Sign Out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button variant="default" size="sm" asChild>
							<Link href={"/login" as Route}>Sign In</Link>
						</Button>
					)}
				</div>

				{/* Mobile Menu */}
				<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
					<SheetTrigger asChild className="md:hidden">
						<Button variant="ghost" size="sm">
							<Menu className="size-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[300px] sm:w-[400px]">
						<div className="flex flex-col gap-6">
							{/* Mobile Logo */}
							<div className="flex items-center justify-between">
								<Link
									href={"/" as Route}
									className="flex items-center gap-2 font-bold text-xl"
									onClick={() => setMobileMenuOpen(false)}
								>
									<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
										F
									</div>
									<span>FindHub</span>
								</Link>
							</div>

							{/* Mobile Navigation */}
							<nav className="flex flex-col gap-4">
								{navItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setMobileMenuOpen(false)}
										className={`font-medium text-sm transition-colors hover:text-primary ${
											pathname === item.href
												? "text-primary"
												: "text-muted-foreground"
										}`}
									>
										{item.label}
									</Link>
								))}
							</nav>

							{/* Mobile Actions */}
							<div className="flex flex-col gap-3 border-t pt-6">
								{isPublicPage && (
									<Button
										variant="outline"
										size="sm"
										asChild
										className="w-full justify-start"
									>
										<Link
											href={"/search" as Route}
											onClick={() => setMobileMenuOpen(false)}
										>
											<Search className="size-4" />
											Search Items
										</Link>
									</Button>
								)}

								{!isPending && session?.user ? (
									<>
										<div className="rounded-lg bg-muted p-3">
											<p className="font-medium text-sm">
												{session.user.name || "Admin User"}
											</p>
											<p className="text-muted-foreground text-xs">
												{session.user.email}
											</p>
										</div>
										{isPublicPage && (
											<Button
												variant="outline"
												size="sm"
												asChild
												className="w-full justify-start"
											>
												<Link
													href={"/dashboard" as Route}
													onClick={() => setMobileMenuOpen(false)}
												>
													Dashboard
												</Link>
											</Button>
										)}
										<Button
											variant="destructive"
											size="sm"
											onClick={() => {
												handleSignOut();
												setMobileMenuOpen(false);
											}}
											className="w-full justify-start"
										>
											<LogOut className="size-4" />
											Sign Out
										</Button>
									</>
								) : (
									<Button
										variant="default"
										size="sm"
										asChild
										className="w-full"
									>
										<Link
											href={"/login" as Route}
											onClick={() => setMobileMenuOpen(false)}
										>
											Sign In
										</Link>
									</Button>
								)}
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
