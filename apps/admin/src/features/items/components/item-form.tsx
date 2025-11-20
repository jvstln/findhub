"use client";

import { createItemSchema, updateItemSchema } from "@findhub/shared/schemas";
import type {
	ItemUpdate,
	ItemUpdateInput,
	LostItemWithDecryptedSecurity,
	LostItemWithImages,
	NewItem,
	NewItemInput,
} from "@findhub/shared/types/item";
import { toBoolean } from "@findhub/shared/utils";
import { Button } from "@findhub/ui/components/ui/button";
import { DatePicker } from "@findhub/ui/components/ui/date-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@findhub/ui/components/ui/field";
import { Input } from "@findhub/ui/components/ui/input";
import { FileInput } from "@findhub/ui/components/ui/input-file";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@findhub/ui/components/ui/select";
import { Textarea } from "@findhub/ui/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeOffIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { PrivacyControls } from "./privacy-controls";
import { SecurityQuestionsBuilder } from "./security-questions-builder";

interface ItemFormProps {
	/**
	 * Initial values for editing an existing item
	 */
	defaultValues?:
		| Partial<LostItemWithImages>
		| Partial<LostItemWithDecryptedSecurity>;
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
	const { data: categories, isLoading: categoriesLoading } = useCategories();

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		control,
		getValues,
		// } = useForm<NewItemInput, unknown, NewItem>({
	} = useForm<NewItemInput | ItemUpdateInput, unknown, NewItem | ItemUpdate>({
		resolver: zodResolver(isEditMode ? updateItemSchema : createItemSchema),
		defaultValues: {
			name: defaultValues?.name || "",
			description: defaultValues?.description || "",
			categoryId: defaultValues?.categoryId?.toString() || "",
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
			securityQuestions:
				"securityQuestions" in (defaultValues || {})
					? (
							defaultValues as Partial<LostItemWithDecryptedSecurity>
						).securityQuestions?.map((q) => {
							if (q.questionType === "multiple_choice") {
								return {
									questionText: q.questionText,
									questionType: "multiple_choice" as const,
									options: q.options || [],
									answer: q.answer,
									displayOrder: q.displayOrder,
								};
							}
							return {
								questionText: q.questionText,
								questionType: "free_text" as const,
								options: undefined,
								answer: q.answer,
								displayOrder: q.displayOrder,
							};
						}) || []
					: [],
			images: [],
		},
	});

	const hideLocation = watch("hideLocation");
	const hideDateFound = watch("hideDateFound");

	const handleFormSubmit = async (data: NewItem | ItemUpdate) => {
		console.log("Submitting...", data);

		await onSubmit(data as NewItem);
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
		<form
			onSubmit={handleSubmit(handleFormSubmit, (error) =>
				console.log("Validation Error: ", error, getValues()),
			)}
			className="space-y-6"
		>
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
				{errors.name?.message && <FieldError>{errors.name.message}</FieldError>}
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
				{errors.description?.message && (
					<FieldError>{errors.description.message}</FieldError>
				)}
			</Field>

			{/* Category Field */}
			<Field data-invalid={!!errors.categoryId}>
				<FieldLabel htmlFor="category">
					Category <span className="text-destructive">*</span>
				</FieldLabel>
				<Controller
					name="categoryId"
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
								aria-invalid={!!errors.categoryId}
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
				{errors.categoryId?.message && (
					<FieldError>{errors.categoryId.message}</FieldError>
				)}
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
				{errors.keywords?.message && (
					<FieldError>{errors.keywords.message}</FieldError>
				)}
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
				{errors.location?.message && (
					<FieldError>{errors.location.message}</FieldError>
				)}
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
				<Controller
					name="dateFound"
					control={control}
					render={({ field }) => {
						const dateValue =
							field.value && typeof field.value === "string"
								? new Date(field.value)
								: undefined;
						return (
							<DatePicker
								date={dateValue}
								onDateChange={(date) => {
									field.onChange(date ? date.toISOString().split("T")[0] : "");
								}}
								placeholder="Select date found"
								maxDate={new Date()}
								disabled={isLoading}
							/>
						);
					}}
				/>
				{errors.dateFound?.message && (
					<FieldError>{errors.dateFound.message}</FieldError>
				)}
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
								hideLocation={toBoolean(locationField.value)}
								hideDateFound={toBoolean(dateField.value)}
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
				render={({ field }) => {
					const questions = Array.isArray(field.value) ? field.value : [];
					return (
						<SecurityQuestionsBuilder
							questions={questions}
							onChange={field.onChange}
							errors={getSecurityQuestionErrors()}
						/>
					);
				}}
			/>

			{/* Existing Images Display (Edit Mode) */}
			{isEditMode &&
				defaultValues?.images &&
				defaultValues.images.length > 0 && (
					<Field>
						<FieldLabel>
							Current Images ({defaultValues.images.length})
						</FieldLabel>
						<div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
							{defaultValues.images.map((image) => (
								<div
									key={image.id}
									className="relative aspect-square overflow-hidden rounded-md border"
								>
									<picture>
										<img
											src={image.url}
											alt={image.filename}
											className="size-full object-cover"
										/>
									</picture>
								</div>
							))}
						</div>
						<FieldDescription>
							Existing images will be kept. Upload new images below to add more.
						</FieldDescription>
					</Field>
				)}

			{/* Images Upload Field */}
			<Controller
				name="images"
				control={control}
				render={({ field }) => (
					<Field data-invalid={!!errors.images}>
						<FieldLabel htmlFor="images" data-required>
							{isEditMode ? "Add New Images" : "Item Images"}
						</FieldLabel>
						<FileInput
							files={field.value}
							onFilesChange={(files) => field.onChange([...files.keys()])}
							placeholderType="image"
							multiple
							accept="image/jpeg,image/png,image/webp"
							disabled={isLoading}
						/>
						<FieldDescription>
							{isEditMode
								? "Upload additional photos (up to 10 images total)"
								: "Upload clear photos of the item to help with identification (up to 10 images)"}
						</FieldDescription>
						{errors.images?.message && (
							<FieldError>{errors.images.message}</FieldError>
						)}
					</Field>
				)}
			/>

			{/* Form Actions */}
			<div className="flex gap-3 pt-4">
				<Button
					type="submit"
					isLoading={isLoading}
					loadingText="Saving..."
					className="min-w-32"
				>
					{submitLabel}
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
