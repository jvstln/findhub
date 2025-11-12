"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface FadeInProps {
	children: ReactNode;
	delay?: number;
	duration?: number;
	className?: string;
}

export function FadeIn({
	children,
	delay = 0,
	duration = 0.4,
	className,
}: FadeInProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration, delay, ease: "easeOut" }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

interface FadeInStaggerProps {
	children: ReactNode;
	staggerDelay?: number;
	className?: string;
}

export function FadeInStagger({
	children,
	staggerDelay = 0.1,
	className,
}: FadeInStaggerProps) {
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: staggerDelay,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function FadeInStaggerItem({ children }: { children: ReactNode }) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: { opacity: 1, y: 0 },
			}}
			transition={{ duration: 0.4 }}
		>
			{children}
		</motion.div>
	);
}
