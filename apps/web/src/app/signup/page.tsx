"use client";

import { Package } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted/20 p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md"
			>
				{/* Logo and Title */}
				<div className="mb-8 text-center">
					<Link href="/" className="inline-flex items-center gap-2">
						<div className="flex size-12 items-center justify-center rounded-xl bg-primary">
							<Package className="size-6 text-primary-foreground" />
						</div>
					</Link>
					<h1 className="mt-4 font-bold text-3xl tracking-tight">
						Create an account
					</h1>
					<p className="mt-2 text-muted-foreground">
						Sign up to manage lost and found items
					</p>
				</div>

				{/* Signup Form Card */}
				<SignupForm />

				{/* Footer Links */}
				<div className="mt-6 text-center text-muted-foreground text-sm">
					<p>
						Already have an account?{" "}
						<a
							href="/login"
							className="font-medium text-primary hover:underline"
						>
							Sign in
						</a>
					</p>
					<p className="mt-2">
						<a href="/" className="hover:underline">
							← Back to home
						</a>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
