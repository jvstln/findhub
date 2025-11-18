"use client";

import { createCategorySchema } from "@findhub/shared/schemas";
import type { ItemCategory } from "@findhub/shared/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormData = z.infer<typeof createCategorySchema>;

interface CategoryFormProps {
	/**
	 * Initial values for editing an existing category
	 */
	defaultValues?: Partial<ItemCategory>;
	/**
	 * Callback when form is submitted successfully
	 */
	onSubmit: (data: FormData) => void | Promise<void>;
	/**
	 * Whether the form is in a loading/submitting state
	 */
	isLoading?: boolean;
	/**
	 * Text for the submit button
	 */
	submitLabel?: string;
	/**
	 * Callback when cancel button is clicked
	 */
	onCancel?: () => void;
}

export function CategoryForm({
	defaultValues,
	onSubmit,
	isLoading = false,
	submitLabel = "Create Category",
	onCancel,
}: CategoryFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			name: defaultValues?.name || "",
			description: defaultValues?.description || "",
		},
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Name Field */}
			<Field data-invalid={!!errors.name}>
				<FieldLabel htmlFor="name">
					Category Name <span className="text-destructive">*</span>
				</FieldLabel>
				<Input
					id="name"
					{...register("name")}
					placeholder="e.g., Electronics"
					aria-invalid={!!errors.name}
					disabled={isLoading}
				/>
				<FieldError>{errors.name?.message}</FieldError>
			</Field>

			{/* Description Field */}
			<Field data-invalid={!!errors.description}>
				<FieldLabel htmlFor="description">Description</FieldLabel>
				<Textarea
					id="description"
					{...register("description")}
					placeholder="Optional description for this category..."
					rows={3}
					aria-invalid={!!errors.description}
					disabled={isLoading}
				/>
				<FieldDescription>
					Optional description to help identify this category
				</FieldDescription>
				<FieldError>{errors.description?.message}</FieldError>
			</Field>

			{/* Form Actions */}
			<div className="flex gap-3 pt-4">
				<Button type="submit" disabled={isLoading} className="min-w-32">
					{isLoading ? (
						<>
							<Loader2Icon className="animate-spin" />
							<span>Saving...</span>
						</>
					) : (
						submitLabel
					)}
				</Button>
				{onCancel && (
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
				)}
			</div>
		</form>
	);
}
