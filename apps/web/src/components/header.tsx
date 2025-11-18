"use client";

import { Menu, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Header() {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const isSearchPage = pathname === "/search";

	const navItems = [
		{ href: "/" as Route, label: "Home" },
		{ href: "/search" as Route, label: "Search" },
		{ href: "/about" as Route, label: "About" },
	];

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
					{!isSearchPage && (
						<Button variant="ghost" size="sm" asChild>
							<Link href={"/search" as Route}>
								<Search className="size-4" />
								Search
							</Link>
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
								{!isSearchPage && (
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
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
