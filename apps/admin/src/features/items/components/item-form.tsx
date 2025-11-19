"use client";

import type {
	LostItemWithImages,
	NewItemWithSecurity,
} from "@findhub/shared/types/item";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOffIcon, ImageIcon, Loader2Icon, XIcon } from "lucide-react";
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
import { useCategories } from "@/features/categories/hooks/use-categories";
import { PrivacyControls } from "./privacy-controls";
import { SecurityQuestionsBuilder } from "./security-questions-builder";

// Create a form-specific schema that handles string inputs for date and includes security questions
const formSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters").max(255),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(2000),
	category: z.string().min(1, "Category is required"),
	keywords: z.string().optional(),
	location: z
		.string()
		.min(3, "Location must be at least 3 characters")
		.max(255),
	dateFound: z.string().min(1, "Date found is required"),
	status: z.enum(["unclaimed", "claimed", "returned", "archived"]).optional(),
	images: z.any().optional(),
	hideLocation: z.boolean(),
	hideDateFound: z.boolean(),
	securityQuestions: z.array(z.any()),
});

type FormData = z.infer<typeof formSchema>;

interface ItemFormProps {
	/**
	 * Initial values for editing an existing item
	 */
	defaultValues?: Partial<LostItemWithImages>;
	/**
	 * Callback when form is submitted successfully
	 */
	onSubmit: (data: NewItemWithSecurity) => void | Promise<void>;
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
	/**
	 * Whether the form is in edit mode (shows visual indicators for hidden fields)
	 */
	isEditMode?: boolean;
}

export function ItemForm({
	defaultValues,
	onSubmit,
	isLoading = false,
	submitLabel = "Create Item",
	onCancel,
	isEditMode = false,
}: ItemFormProps) {
	const [imagePreview, setImagePreview] = useState<string | null>(
		defaultValues?.images?.[0]?.url || null,
	);
	const { data: categories, isLoading: categoriesLoading } = useCategories();

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
			keywords: Array.isArray(defaultValues?.keywords)
				? defaultValues.keywords.join(", ")
				: defaultValues?.keywords || "",
			location: defaultValues?.location || "",
			dateFound: defaultValues?.dateFound
				? new Date(defaultValues.dateFound).toISOString().split("T")[0]
				: new Date().toISOString().split("T")[0],
			status: defaultValues?.status || "unclaimed",
			hideLocation: defaultValues?.hideLocation || false,
			hideDateFound: defaultValues?.hideDateFound || false,
			securityQuestions: [],
		},
	});

	const imageFiles = watch("images");
	const hideLocation = watch("hideLocation");
	const hideDateFound = watch("hideDateFound");

	// Update image preview when file changes
	useEffect(() => {
		if (imageFiles && imageFiles.length > 0 && imageFiles[0] instanceof File) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(imageFiles[0]);
		}
	}, [imageFiles]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			// Validate each file
			for (const file of files) {
				// Validate file size (5MB)
				if (file.size > 5 * 1024 * 1024) {
					toast.error(`Image ${file.name} must be less than 5MB`);
					e.target.value = "";
					return;
				}

				// Validate file type
				const validTypes = ["image/jpeg", "image/png", "image/webp"];
				if (!validTypes.includes(file.type)) {
					toast.error(`Image ${file.name} must be JPEG, PNG, or WebP format`);
					e.target.value = "";
					return;
				}
			}

			// Limit to 10 images
			if (files.length > 10) {
				toast.error("Maximum 10 images allowed");
				e.target.value = "";
				return;
			}

			setValue("images", files, { shouldValidate: true });
		}
	};

	const handleRemoveImages = () => {
		setValue("images", undefined);
		setImagePreview(null);
		// Reset file input
		const fileInput = document.getElementById("images") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	const handleFormSubmit = async (data: FormData) => {
		// Convert form data to NewItemWithSecurity format
		const itemData: NewItemWithSecurity = {
			...data,
			dateFound: new Date(data.dateFound),
			images: Array.isArray(data.images)
				? data.images.filter((file): file is File => file instanceof File)
				: undefined,
			securityQuestions: data.securityQuestions,
			hideLocation: data.hideLocation,
			hideDateFound: data.hideDateFound,
		};
		await onSubmit(itemData);
	};

	// Extract security question errors from form errors
	const getSecurityQuestionErrors = () => {
		if (!errors.securityQuestions) return {};

		const questionErrors: Record<
			number,
			{ questionText?: string; options?: string; answer?: string }
		> = {};

		if (Array.isArray(errors.securityQuestions)) {
			errors.securityQuestions.forEach((error, index) => {
				if (error) {
					questionErrors[index] = {
						questionText: error.questionText?.message,
						options: error.options?.message,
						answer: error.answer?.message,
					};
				}
			});
		}

		return questionErrors;
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
							disabled={isLoading || categoriesLoading}
						>
							<SelectTrigger
								id="category"
								className="w-full"
								aria-invalid={!!errors.category}
							>
								<SelectValue placeholder="Select a category" />
							</SelectTrigger>
							<SelectContent>
								{categories?.map((cat) => (
									<SelectItem key={cat.id} value={cat.id.toString()}>
										{cat.name}
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
				<div className="flex items-center justify-between">
					<FieldLabel htmlFor="location">
						Location Found <span className="text-destructive">*</span>
					</FieldLabel>
					{isEditMode && hideLocation && (
						<div className="flex items-center gap-1 text-muted-foreground text-xs">
							<EyeOffIcon className="size-3" />
							<span>Hidden from public</span>
						</div>
					)}
				</div>
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
				<div className="flex items-center justify-between">
					<FieldLabel htmlFor="dateFound">
						Date Found <span className="text-destructive">*</span>
					</FieldLabel>
					{isEditMode && hideDateFound && (
						<div className="flex items-center gap-1 text-muted-foreground text-xs">
							<EyeOffIcon className="size-3" />
							<span>Hidden from public</span>
						</div>
					)}
				</div>
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

			{/* Privacy Controls */}
			<Controller
				name="hideLocation"
				control={control}
				render={({ field: locationField }) => (
					<Controller
						name="hideDateFound"
						control={control}
						render={({ field: dateField }) => (
							<PrivacyControls
								hideLocation={locationField.value}
								hideDateFound={dateField.value}
								onHideLocationChange={locationField.onChange}
								onHideDateFoundChange={dateField.onChange}
								disabled={isLoading}
							/>
						)}
					/>
				)}
			/>

			{/* Security Questions Builder */}
			<Controller
				name="securityQuestions"
				control={control}
				render={({ field }) => (
					<SecurityQuestionsBuilder
						questions={field.value || []}
						onChange={field.onChange}
						errors={getSecurityQuestionErrors()}
					/>
				)}
			/>

			{/* Images Upload Field */}
			<Field data-invalid={!!errors.images}>
				<FieldLabel htmlFor="images">Item Images</FieldLabel>
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
								onClick={handleRemoveImages}
								disabled={isLoading}
							>
								<XIcon />
								<span className="sr-only">Remove images</span>
							</Button>
						</div>
					) : (
						<div className="flex w-full max-w-md items-center justify-center">
							<label
								htmlFor="images"
								className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
							>
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<ImageIcon className="mb-2 size-8 text-muted-foreground" />
									<p className="mb-2 text-muted-foreground text-sm">
										<span className="font-semibold">Click to upload</span> or
										drag and drop
									</p>
									<p className="text-muted-foreground text-xs">
										JPEG, PNG, or WebP (max 5MB each, up to 10 images)
									</p>
								</div>
								<input
									id="images"
									type="file"
									multiple
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
					Upload clear photos of the item to help with identification (up to 10
					images)
				</FieldDescription>
				<FieldError>{errors.images?.message as string}</FieldError>
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
