"use client";

import { Button } from "@findhub/ui/components/ui/button";
import {
	Building2,
	CheckCircle2,
	Clock,
	Mail,
	MapPin,
	Phone,
} from "lucide-react";
import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";

export default function AboutPage() {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
			},
		},
	};

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-secondary/10 px-4 py-16 md:py-24">
				<div className="absolute inset-0 bg-grid-pattern opacity-5" />

				<motion.div
					className="container relative mx-auto max-w-4xl text-center"
					initial="hidden"
					animate="visible"
					variants={containerVariants}
				>
					<motion.h1
						className="mb-4 font-bold text-4xl tracking-tight md:text-6xl"
						variants={itemVariants}
					>
						About{" "}
						<span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
							FindHub
						</span>
					</motion.h1>
					<motion.p
						className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl"
						variants={itemVariants}
					>
						Your trusted campus lost and found service, dedicated to reuniting
						students with their lost belongings.
					</motion.p>
				</motion.div>
			</section>

			{/* Service Description */}
			<section className="px-4 py-16 md:py-20">
				<motion.div
					className="container mx-auto max-w-4xl"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<motion.div variants={itemVariants}>
						<h2 className="mb-6 font-bold text-3xl md:text-4xl">Our Service</h2>
						<div className="space-y-4 text-lg text-muted-foreground">
							<p>
								FindHub is the official lost and found management system for our
								campus community. We provide a centralized platform where
								students can search for their lost items and administrators can
								efficiently manage found items.
							</p>
							<p>
								Our mission is simple: to make the process of finding and
								claiming lost items as seamless as possible. Whether you've lost
								your keys, phone, wallet, or any other personal belonging, we're
								here to help you get it back.
							</p>
							<p>
								Every day, our dedicated team catalogs found items with detailed
								descriptions and photos, making it easy for you to identify your
								belongings from the comfort of your device. Once you've found
								your item online, simply visit our office to claim it.
							</p>
						</div>
					</motion.div>
				</motion.div>
			</section>

			{/* Contact Information & Office Location */}
			<section className="bg-muted/30 px-4 py-16 md:py-20">
				<motion.div
					className="container mx-auto max-w-6xl"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<motion.h2
						className="mb-12 text-center font-bold text-3xl md:text-4xl"
						variants={itemVariants}
					>
						Contact & Location
					</motion.h2>

					<div className="grid gap-8 md:grid-cols-2">
						{/* Contact Information */}
						<motion.div
							className="rounded-xl border bg-card p-8"
							variants={itemVariants}
							whileHover={{ y: -5 }}
						>
							<h3 className="mb-6 font-semibold text-2xl">Get in Touch</h3>
							<div className="space-y-4">
								<div className="flex items-start gap-4">
									<div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Phone className="size-5" />
									</div>
									<div>
										<p className="mb-1 font-medium">Phone</p>
										<a
											href="tel:+1234567890"
											className="text-muted-foreground hover:text-primary"
										>
											(123) 456-7890
										</a>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Mail className="size-5" />
									</div>
									<div>
										<p className="mb-1 font-medium">Email</p>
										<a
											href="mailto:lostandfound@campus.edu"
											className="text-muted-foreground hover:text-primary"
										>
											lostandfound@campus.edu
										</a>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Clock className="size-5" />
									</div>
									<div>
										<p className="mb-2 font-medium">Office Hours</p>
										<div className="space-y-1 text-muted-foreground text-sm">
											<p>Monday - Friday: 9:00 AM - 5:00 PM</p>
											<p>Saturday: 10:00 AM - 2:00 PM</p>
											<p>Sunday: Closed</p>
										</div>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Office Location */}
						<motion.div
							className="rounded-xl border bg-card p-8"
							variants={itemVariants}
							whileHover={{ y: -5 }}
						>
							<h3 className="mb-6 font-semibold text-2xl">Visit Our Office</h3>
							<div className="space-y-4">
								<div className="flex items-start gap-4">
									<div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Building2 className="size-5" />
									</div>
									<div>
										<p className="mb-1 font-medium">Building</p>
										<p className="text-muted-foreground">
											Student Services Center
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
										<MapPin className="size-5" />
									</div>
									<div>
										<p className="mb-1 font-medium">Address</p>
										<p className="text-muted-foreground">
											123 Campus Drive, Room 105
											<br />
											University City, ST 12345
										</p>
									</div>
								</div>

								<div className="mt-6 rounded-lg bg-muted p-4">
									<p className="mb-2 font-medium text-sm">Directions</p>
									<p className="text-muted-foreground text-sm">
										Located on the first floor of the Student Services Center,
										near the main entrance. Look for the "Lost & Found" sign.
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</motion.div>
			</section>

			{/* Claim Process Instructions */}
			<section className="px-4 py-16 md:py-20">
				<motion.div
					className="container mx-auto max-w-4xl"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<motion.div className="text-center" variants={itemVariants}>
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							How to Claim Your Item
						</h2>
						<p className="mb-12 text-lg text-muted-foreground">
							Follow these simple steps to retrieve your lost belongings
						</p>
					</motion.div>

					<div className="space-y-6">
						<motion.div
							className="flex gap-6 rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
							variants={itemVariants}
							whileHover={{ x: 5 }}
						>
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
								1
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">
									Search for Your Item
								</h3>
								<p className="text-muted-foreground">
									Use our search feature to browse through found items. Filter
									by category, location, date, and keywords to narrow down your
									search. View detailed descriptions and photos to identify your
									item.
								</p>
							</div>
						</motion.div>

						<motion.div
							className="flex gap-6 rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
							variants={itemVariants}
							whileHover={{ x: 5 }}
						>
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
								2
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">
									Note the Item Details
								</h3>
								<p className="text-muted-foreground">
									Once you've found your item, make note of the item ID, name,
									and any specific details. This information will help us locate
									your item quickly when you visit our office.
								</p>
							</div>
						</motion.div>

						<motion.div
							className="flex gap-6 rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
							variants={itemVariants}
							whileHover={{ x: 5 }}
						>
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
								3
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">Visit Our Office</h3>
								<p className="text-muted-foreground">
									Come to our office during business hours with a valid student
									ID or government-issued identification. Our staff will verify
									your identity and ownership of the item.
								</p>
							</div>
						</motion.div>

						<motion.div
							className="flex gap-6 rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
							variants={itemVariants}
							whileHover={{ x: 5 }}
						>
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
								4
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">Verify and Claim</h3>
								<p className="text-muted-foreground">
									You'll be asked to provide proof of ownership (such as
									describing unique features, providing serial numbers, or
									showing purchase receipts). Once verified, you'll sign a claim
									form and receive your item immediately.
								</p>
							</div>
						</motion.div>
					</div>

					<motion.div
						className="mt-12 rounded-xl bg-primary/5 p-6"
						variants={itemVariants}
					>
						<div className="flex items-start gap-4">
							<CheckCircle2 className="mt-1 size-6 shrink-0 text-primary" />
							<div>
								<h4 className="mb-2 font-semibold">Important Notes</h4>
								<ul className="space-y-2 text-muted-foreground text-sm">
									<li>
										• Items are held for 90 days from the date they were found
									</li>
									<li>
										• Unclaimed items after 90 days may be donated or disposed
										of
									</li>
									<li>
										• You must bring valid identification to claim any item
									</li>
									<li>
										• For high-value items (electronics, jewelry), additional
										verification may be required
									</li>
									<li>
										• If you can't visit during office hours, please contact us
										to arrange an appointment
									</li>
								</ul>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</section>

			{/* CTA Section */}
			<section className="bg-muted/30 px-4 py-16 md:py-20">
				<motion.div
					className="container mx-auto max-w-4xl"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<motion.div
						className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary/80 p-8 text-center text-primary-foreground md:p-12"
						variants={itemVariants}
					>
						<div className="absolute inset-0 bg-grid-pattern opacity-10" />
						<div className="relative">
							<h2 className="mb-4 font-bold text-3xl md:text-4xl">
								Ready to Find Your Item?
							</h2>
							<p className="mb-8 text-lg text-primary-foreground/90">
								Start searching our database of found items now. Your lost
								belonging might be waiting for you!
							</p>
							<Button
								size="lg"
								variant="secondary"
								asChild
								className="w-full sm:w-auto"
							>
								<Link href={"/search" as Route} prefetch={false}>
									Search Lost Items
								</Link>
							</Button>
						</div>
					</motion.div>
				</motion.div>
			</section>
		</div>
	);
}
