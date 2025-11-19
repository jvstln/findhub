"use client";

import { Button } from "@findhub/ui/components/ui/button";
import { ArrowRight, Clock, Heart, Search, Shield } from "lucide-react";
import { motion } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ItemCard } from "@/features/items/components/item-card";
import { useItems } from "@/features/items/hooks/use-items";

export default function Home() {
	const router = useRouter();

	// Fetch recent items for featured section (limit to 3)
	const { data: recentItems, isLoading } = useItems({
		page: 1,
		pageSize: 3,
		status: "unclaimed",
	});

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
			<section className="relative overflow-hidden bg-linear-to-br from-primary/10 via-background to-secondary/10 px-4 py-20 md:py-32">
				<div className="absolute inset-0 bg-grid-pattern opacity-5" />

				<motion.div
					className="container relative mx-auto max-w-6xl"
					initial="hidden"
					animate="visible"
					variants={containerVariants}
				>
					<motion.div
						className="mx-auto max-w-3xl text-center"
						variants={itemVariants}
					>
						<motion.div
							className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm"
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 400 }}
						>
							<Heart className="size-4 text-primary" />
							<span>Reuniting people with their belongings</span>
						</motion.div>

						<motion.h1
							className="mb-6 font-bold text-5xl tracking-tight md:text-7xl"
							variants={itemVariants}
						>
							Lost Something?
							<br />
							<span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
								We've Got You Covered
							</span>
						</motion.h1>

						<motion.p
							className="mb-8 text-muted-foreground text-xl md:text-2xl"
							variants={itemVariants}
						>
							Your campus lost and found hub. Search thousands of found items
							and reunite with what matters most.
						</motion.p>

						<motion.div
							className="flex flex-col items-center justify-center gap-4 sm:flex-row"
							variants={itemVariants}
						>
							<Button size="lg" asChild className="group w-full sm:w-auto">
								<Link href={"/search" as Route} prefetch={false}>
									<Search className="size-5" />
									Search Lost Items
									<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								asChild
								className="w-full sm:w-auto"
							>
								<Link href={"/about" as Route} prefetch={false}>
									Learn More
								</Link>
							</Button>
						</motion.div>
					</motion.div>

					{/* Floating Elements */}
					<motion.div
						className="absolute top-20 right-10 hidden size-20 rounded-full bg-primary/20 blur-3xl lg:block"
						animate={{
							y: [0, -20, 0],
							scale: [1, 1.1, 1],
						}}
						transition={{
							duration: 4,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>
					<motion.div
						className="absolute bottom-20 left-10 hidden size-32 rounded-full bg-secondary/20 blur-3xl lg:block"
						animate={{
							y: [0, 20, 0],
							scale: [1, 1.2, 1],
						}}
						transition={{
							duration: 5,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>
				</motion.div>
			</section>

			{/* Mission Statement */}
			<section className="px-4 py-16 md:py-24">
				<motion.div
					className="container mx-auto max-w-6xl"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<motion.div className="text-center" variants={itemVariants}>
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">Our Mission</h2>
						<p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
							FindHub is dedicated to creating a seamless experience for
							reuniting lost items with their rightful owners. We believe every
							belonging has a story, and we're here to help complete it.
						</p>
					</motion.div>

					<div className="grid gap-8 md:grid-cols-3">
						<motion.div
							className="group rounded-xl border bg-card p-6 text-center transition-all hover:shadow-lg"
							variants={itemVariants}
							whileHover={{ y: -5 }}
						>
							<div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
								<Search className="size-6" />
							</div>
							<h3 className="mb-2 font-semibold text-xl">Easy Search</h3>
							<p className="text-muted-foreground text-sm">
								Powerful filters and search tools to help you find your lost
								items quickly and efficiently.
							</p>
						</motion.div>

						<motion.div
							className="group rounded-xl border bg-card p-6 text-center transition-all hover:shadow-lg"
							variants={itemVariants}
							whileHover={{ y: -5 }}
						>
							<div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
								<Shield className="size-6" />
							</div>
							<h3 className="mb-2 font-semibold text-xl">Secure Process</h3>
							<p className="text-muted-foreground text-sm">
								Your items are safe with us. Verified claims and secure handling
								ensure peace of mind.
							</p>
						</motion.div>

						<motion.div
							className="group rounded-xl border bg-card p-6 text-center transition-all hover:shadow-lg"
							variants={itemVariants}
							whileHover={{ y: -5 }}
						>
							<div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
								<Clock className="size-6" />
							</div>
							<h3 className="mb-2 font-semibold text-xl">Real-time Updates</h3>
							<p className="text-muted-foreground text-sm">
								Get instant notifications when items matching your search are
								found and added to our system.
							</p>
						</motion.div>
					</div>
				</motion.div>
			</section>

			{/* Featured Recent Items */}
			<section className="bg-muted/30 px-4 py-16 md:py-24">
				<motion.div
					className="container mx-auto max-w-6xl"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<motion.div
						className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row"
						variants={itemVariants}
					>
						<div>
							<h2 className="mb-2 font-bold text-3xl md:text-4xl">
								Recently Found Items
							</h2>
							<p className="text-muted-foreground">
								Check out the latest items waiting to be claimed
							</p>
						</div>
						<Button variant="outline" asChild>
							<Link href={"/search" as Route} prefetch={false}>
								View All Items
								<ArrowRight className="size-4" />
							</Link>
						</Button>
					</motion.div>

					{isLoading ? (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<motion.div
									key={i}
									className="h-80 animate-pulse rounded-xl bg-muted"
									variants={itemVariants}
								/>
							))}
						</div>
					) : recentItems?.data && recentItems.data.length > 0 ? (
						<motion.div
							className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
							variants={containerVariants}
						>
							{recentItems.data.map((item, index) => (
								<motion.div
									key={item.id}
									variants={itemVariants}
									custom={index}
									whileHover={{ scale: 1.02 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<ItemCard
										item={item}
										onClick={() => router.push(`/items/${item.id}` as Route)}
									/>
								</motion.div>
							))}
						</motion.div>
					) : (
						<motion.div
							className="rounded-xl border bg-card p-12 text-center"
							variants={itemVariants}
						>
							<p className="text-muted-foreground">
								No items found yet. Check back soon!
							</p>
						</motion.div>
					)}
				</motion.div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-16 md:py-24">
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
								Can't Find Your Item?
							</h2>
							<p className="mb-8 text-lg text-primary-foreground/90">
								Don't worry! New items are added daily. Start searching now or
								visit our office for assistance.
							</p>
							<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
								<Button
									size="lg"
									variant="secondary"
									asChild
									className="w-full sm:w-auto"
								>
									<Link href={"/search" as Route} prefetch={false}>
										<Search className="size-5" />
										Start Searching
									</Link>
								</Button>
								<Button
									size="lg"
									variant="outline"
									asChild
									className="w-full border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 sm:w-auto"
								>
									<Link href={"/about" as Route} prefetch={false}>
										Contact Us
									</Link>
								</Button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</section>
		</div>
	);
}
