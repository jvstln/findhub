import { Heart, Mail, MapPin, Phone } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t bg-muted/30">
			<div className="container mx-auto px-4 py-12">
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					{/* Brand Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								F
							</div>
							<span className="font-bold text-xl">FindHub</span>
						</div>
						<p className="text-muted-foreground text-sm">
							Your trusted campus lost and found service, dedicated to reuniting
							students with their lost belongings.
						</p>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Heart className="size-4 text-primary" />
							<span>Reuniting people with what matters</span>
						</div>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="font-semibold text-sm">Quick Links</h3>
						<nav className="flex flex-col gap-2">
							<Link
								href={"/" as Route}
								className="text-muted-foreground text-sm transition-colors hover:text-primary"
							>
								Home
							</Link>
							<Link
								href={"/search" as Route}
								className="text-muted-foreground text-sm transition-colors hover:text-primary"
							>
								Search Items
							</Link>
							<Link
								href={"/about" as Route}
								className="text-muted-foreground text-sm transition-colors hover:text-primary"
							>
								About Us
							</Link>
						</nav>
					</div>

					{/* Contact Info */}
					<div className="space-y-4">
						<h3 className="font-semibold text-sm">Contact Us</h3>
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								<a
									href="tel:+1234567890"
									className="text-muted-foreground text-sm transition-colors hover:text-primary"
								>
									(123) 456-7890
								</a>
							</div>
							<div className="flex items-start gap-3">
								<Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								<a
									href="mailto:lostandfound@campus.edu"
									className="text-muted-foreground text-sm transition-colors hover:text-primary"
								>
									lostandfound@campus.edu
								</a>
							</div>
							<div className="flex items-start gap-3">
								<MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								<p className="text-muted-foreground text-sm">
									Student Services Center
									<br />
									Room 105, 123 Campus Drive
								</p>
							</div>
						</div>
					</div>

					{/* Office Hours */}
					<div className="space-y-4">
						<h3 className="font-semibold text-sm">Office Hours</h3>
						<div className="space-y-2 text-muted-foreground text-sm">
							<div className="flex justify-between">
								<span>Monday - Friday</span>
								<span className="font-medium">9:00 AM - 5:00 PM</span>
							</div>
							<div className="flex justify-between">
								<span>Saturday</span>
								<span className="font-medium">10:00 AM - 2:00 PM</span>
							</div>
							<div className="flex justify-between">
								<span>Sunday</span>
								<span className="font-medium">Closed</span>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
					<p className="text-center text-muted-foreground text-sm">
						© {currentYear} FindHub. All rights reserved.
					</p>
					<div className="flex gap-6">
						<Link
							href={"#" as Route}
							className="text-muted-foreground text-sm transition-colors hover:text-primary"
						>
							Privacy Policy
						</Link>
						<Link
							href={"#" as Route}
							className="text-muted-foreground text-sm transition-colors hover:text-primary"
						>
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
