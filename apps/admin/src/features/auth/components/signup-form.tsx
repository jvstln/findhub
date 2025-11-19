"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@findhub/ui/lib/auth-client";

const signupSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
	});

	const onSubmit = async (data: SignupFormData) => {
		setIsLoading(true);

		try {
			const result = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to create account");
				return;
			}

			toast.success("Account created successfully!");
			router.push("/dashboard");
			router.refresh();
		} catch (error) {
			console.error("Signup error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create your account</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">
							Name <span className="text-destructive">*</span>
						</Label>
						<Input
							{...register("name")}
							id="name"
							type="text"
							placeholder="John Doe"
							autoComplete="name"
							disabled={isLoading}
						/>
						{errors.name && (
							<p className="text-destructive text-sm">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">
							Email <span className="text-destructive">*</span>
						</Label>
						<Input
							{...register("email")}
							id="email"
							type="email"
							placeholder="admin@example.com"
							autoComplete="email"
							disabled={isLoading}
						/>
						{errors.email && (
							<p className="text-destructive text-sm">{errors.email.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">
							Password <span className="text-destructive">*</span>
						</Label>
						<Input
							{...register("password")}
							id="password"
							type="password"
							placeholder="••••••••"
							autoComplete="new-password"
							disabled={isLoading}
						/>
						{errors.password && (
							<p className="text-destructive text-sm">
								{errors.password.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Confirm Password <span className="text-destructive">*</span>
						</Label>
						<Input
							{...register("confirmPassword")}
							id="confirmPassword"
							type="password"
							placeholder="••••••••"
							autoComplete="new-password"
							disabled={isLoading}
						/>
						{errors.confirmPassword && (
							<p className="text-destructive text-sm">
								{errors.confirmPassword.message}
							</p>
						)}
					</div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Creating account..." : "Create account"}
						</Button>
					</motion.div>
				</form>
			</CardContent>
		</Card>
	);
}
