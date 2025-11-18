"use client";

import { createItemSchema } from "@findhub/shared/schemas";
import type { LostItem, NewItem } from "@findhub/shared/types/item";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2Icon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ITEM_CATEGORIES } from "../lib/constants";

// Create a form-specific schema that handles string inputs for date
const formSchema = createItemSchema
	.omit({ image: true, dateFound: true })
	.extend({
		dateFound: z.string().min(1, "Date found is required"),
		image: z.any().optional(),
	});

type FormData = z.infer<typeof formSchema>;

interface ItemFormProps {
	/**
	 * Initial values for editing an existing item
	 */
	defaultValues?: Partial<LostItem>;
	/**
	 * Callback when form is submitted successfully
	 */
	onSubmit: (data: NewItem) => void | Promise<void>;
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

export function ItemForm({
	defaultValues,
	onSubmit,
	isLoading = false,
	submitLabel = "Create Item",
	onCancel,
}: ItemFormProps) {
	const [imagePreview, setImagePreview] = useState<string | null>(
		defaultValues?.imageUrl || null,
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		control,
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: defaultValues?.name || "",
			description: defaultValues?.description || "",
			category: defaultValues?.categoryId?.toString() || "",
			keywords: defaultValues?.keywords || "",
			location: defaultValues?.location || "",
			dateFound: defaultValues?.dateFound
				? new Date(defaultValues.dateFound).toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0],
			status: defaultValues?.status || "unclaimed",
		},
	});

	const imageFile = watch("image");

	// Update image preview when file changes
	useEffect(() => {
		if (imageFile instanceof File) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(imageFile);
		}
	}, [imageFile]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file size (5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image must be less than 5MB");
				e.target.value = "";
				return;
			}

			// Validate file type
			const validTypes = ["image/jpeg", "image/png", "image/webp"];
			if (!validTypes.includes(file.type)) {
				toast.error("Image must be JPEG, PNG, or WebP format");
				e.target.value = "";
				return;
			}

			setValue("image", file, { shouldValidate: true });
		}
	};

	const handleRemoveImage = () => {
		setValue("image", undefined);
		setImagePreview(null);
		// Reset file input
		const fileInput = document.getElementById("image") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const handleFormSubmit = async (data: FormData) => {
		// Convert form data to NewItem format
		const itemData: NewItem = {
			...data,
			dateFound: new Date(data.dateFound),
			image: data.image instanceof File ? data.image : undefined,
		};
		await onSubmit(itemData);
	};

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
			{/* Name Field */}
			<Field data-invalid={!!errors.name}>
				<FieldLabel htmlFor="name">
					Item Name <span className="text-destructive">*</span>
				</FieldLabel>
				<Input
					id="name"
					{...register("name")}
					placeholder="e.g., Black iPhone 13"
					aria-invalid={!!errors.name}
					disabled={isLoading}
				/>
				<FieldError>{errors.name?.message}</FieldError>
			</Field>

			{/* Description Field */}
			<Field data-invalid={!!errors.description}>
				<FieldLabel htmlFor="description">
					Description <span className="text-destructive">*</span>
				</FieldLabel>
				<Textarea
					id="description"
					{...register("description")}
					placeholder="Provide detailed description to help owner identify the item..."
					rows={4}
					aria-invalid={!!errors.description}
					disabled={isLoading}
				/>
				<FieldError>{errors.description?.message}</FieldError>
			</Field>

			{/* Category Field */}
			<Field data-invalid={!!errors.category}>
				<FieldLabel htmlFor="category">
					Category <span className="text-destructive">*</span>
				</FieldLabel>
				<Controller
					name="category"
					control={control}
					render={({ field }) => (
						<Select
							onValueChange={field.onChange}
							value={field.value}
							disabled={isLoading}
						>
							<SelectTrigger
								id="category"
								className="w-full"
								aria-invalid={!!errors.category}
							>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								{ITEM_CATEGORIES.map((cat) => (
									<SelectItem key={cat.value} value={cat.value}>
										{cat.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				<FieldError>{errors.category?.message}</FieldError>
			</Field>

			{/* Keywords Field */}
			<Field data-invalid={!!errors.keywords}>
				<FieldLabel htmlFor="keywords">Keywords/Tags</FieldLabel>
				<Input
					id="keywords"
					{...register("keywords")}
					placeholder="e.g., cracked screen, blue case"
					aria-invalid={!!errors.keywords}
					disabled={isLoading}
				/>
				<FieldDescription>
					Optional keywords to help with search
				</FieldDescription>
				<FieldError>{errors.keywords?.message}</FieldError>
			</Field>

			{/* Location Field */}
			<Field data-invalid={!!errors.location}>
				<FieldLabel htmlFor="location">
					Location Found <span className="text-destructive">*</span>
				</FieldLabel>
				<Input
					id="location"
					{...register("location")}
					placeholder="e.g., Library 2nd Floor"
					aria-invalid={!!errors.location}
					disabled={isLoading}
				/>
				<FieldError>{errors.location?.message}</FieldError>
			</Field>

			{/* Date Found Field */}
			<Field data-invalid={!!errors.dateFound}>
				<FieldLabel htmlFor="dateFound">
					Date Found <span className="text-destructive">*</span>
				</FieldLabel>
				<Input
					id="dateFound"
					type="date"
					{...register("dateFound")}
					max={new Date().toISOString().split("T")[0]}
					aria-invalid={!!errors.dateFound}
					disabled={isLoading}
				/>
				<FieldError>{errors.dateFound?.message}</FieldError>
			</Field>

			{/* Image Upload Field */}
			<Field data-invalid={!!errors.image}>
				<FieldLabel htmlFor="image">Item Image</FieldLabel>
				<div className="space-y-4">
					{imagePreview ? (
						<div className="relative w-full max-w-md">
							<div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
								<Image
									src={imagePreview}
									alt="Item preview"
									fill
									className="object-cover"
								/>
							</div>
							<Button
								type="button"
								variant="destructive"
								size="icon"
								className="absolute top-2 right-2"
								onClick={handleRemoveImage}
								disabled={isLoading}
							>
								<XIcon />
								<span className="sr-only">Remove image</span>
							</Button>
						</div>
					) : (
						<div className="flex w-full max-w-md items-center justify-center">
							<label
								htmlFor="image"
								className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
							>
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<ImageIcon className="mb-2 size-8 text-muted-foreground" />
									<p className="mb-2 text-muted-foreground text-sm">
										<span className="font-semibold">Click to upload</span> or
										drag and drop
									</p>
									<p className="text-muted-foreground text-xs">
										JPEG, PNG, or WebP (max 5MB)
									</p>
								</div>
								<input
									id="image"
									type="file"
									className="hidden"
									accept="image/jpeg,image/png,image/webp"
									onChange={handleImageChange}
									disabled={isLoading}
								/>
							</label>
						</div>
					)}
				</div>
				<FieldDescription>
					Upload a clear photo of the item to help with identification
				</FieldDescription>
				<FieldError>{errors.image?.message as string}</FieldError>
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
