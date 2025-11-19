"use client";

import type { SecurityQuestionInput } from "@findhub/shared/schemas";
import { Button } from "@findhub/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@findhub/ui/components/ui/card";
import { Field, FieldError, FieldLabel } from "@findhub/ui/components/ui/field";
import { Input } from "@findhub/ui/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@findhub/ui/components/ui/select";
import { Textarea } from "@findhub/ui/components/ui/textarea";
import { GripVerticalIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { useState } from "react";

interface SecurityQuestionsBuilderProps {
	questions: SecurityQuestionInput[];
	onChange: (questions: SecurityQuestionInput[]) => void;
	errors?: Record<
		number,
		{ questionText?: string; options?: string; answer?: string }
	>;
}

export function SecurityQuestionsBuilder({
	questions,
	onChange,
	errors = {},
}: SecurityQuestionsBuilderProps) {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	const addQuestion = () => {
		const newQuestion: SecurityQuestionInput = {
			questionText: "",
			questionType: "free_text",
			options: undefined,
			answer: "",
			displayOrder: questions.length,
		};
		onChange([...questions, newQuestion]);
	};

	const removeQuestion = (index: number) => {
		const updated = questions.filter((_, i) => i !== index);
		// Update display order
		const reordered = updated.map((q, i) => ({ ...q, displayOrder: i }));
		onChange(reordered);
	};

	const updateQuestion = (
		index: number,
		updates: Partial<SecurityQuestionInput>,
	) => {
		const updated = [...questions];
		updated[index] = { ...updated[index], ...updates } as SecurityQuestionInput;
		onChange(updated);
	};

	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		const updated = [...questions];
		const draggedItem = updated[draggedIndex];
		updated.splice(draggedIndex, 1);
		updated.splice(index, 0, draggedItem);

		// Update display order
		const reordered = updated.map((q, i) => ({ ...q, displayOrder: i }));
		onChange(reordered);
		setDraggedIndex(index);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-base">
						Security Questions (Optional)
					</h3>
					<p className="text-muted-foreground text-sm">
						Add verification questions to help identify the rightful owner
					</p>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addQuestion}
					disabled={questions.length >= 10}
				>
					<PlusIcon />
					Add Question
				</Button>
			</div>

			{questions.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-8 text-center">
						<p className="text-muted-foreground text-sm">
							No security questions added yet
						</p>
						<p className="text-muted-foreground text-xs">
							Click "Add Question" to create verification questions
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{questions.map((question, index) => (
						<QuestionCard
							key={index}
							question={question}
							index={index}
							onUpdate={(updates) => updateQuestion(index, updates)}
							onRemove={() => removeQuestion(index)}
							onDragStart={() => handleDragStart(index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDragEnd={handleDragEnd}
							isDragging={draggedIndex === index}
							errors={errors[index]}
						/>
					))}
				</div>
			)}

			{questions.length > 0 && (
				<p className="text-muted-foreground text-xs">
					{questions.length} / 10 questions added
				</p>
			)}
		</div>
	);
}

interface QuestionCardProps {
	question: SecurityQuestionInput;
	index: number;
	onUpdate: (updates: Partial<SecurityQuestionInput>) => void;
	onRemove: () => void;
	onDragStart: () => void;
	onDragOver: (e: React.DragEvent) => void;
	onDragEnd: () => void;
	isDragging: boolean;
	errors?: { questionText?: string; options?: string; answer?: string };
}

function QuestionCard({
	question,
	index,
	onUpdate,
	onRemove,
	onDragStart,
	onDragOver,
	onDragEnd,
	isDragging,
	errors,
}: QuestionCardProps) {
	return (
		<Card
			draggable
			onDragStart={onDragStart}
			onDragOver={onDragOver}
			onDragEnd={onDragEnd}
			className={isDragging ? "opacity-50" : ""}
		>
			<CardHeader>
				<div className="flex items-start gap-3">
					<button
						type="button"
						className="mt-1 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
						aria-label="Drag to reorder"
					>
						<GripVerticalIcon className="size-5" />
					</button>
					<div className="flex-1">
						<CardTitle className="text-sm">Question {index + 1}</CardTitle>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onRemove}
						className="size-8"
					>
						<TrashIcon className="size-4" />
						<span className="sr-only">Remove question</span>
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Question Type Selector */}
				<Field>
					<FieldLabel>Question Type</FieldLabel>
					<Select
						value={question.questionType}
						onValueChange={(value: "multiple_choice" | "free_text") => {
							// Reset answer and options when changing type
							if (value === "multiple_choice") {
								onUpdate({
									questionType: value,
									options: ["", ""],
									answer: "",
								});
							} else {
								onUpdate({
									questionType: value,
									options: undefined,
									answer: "",
								});
							}
						}}
					>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="free_text">Free Text</SelectItem>
							<SelectItem value="multiple_choice">Multiple Choice</SelectItem>
						</SelectContent>
					</Select>
				</Field>

				{/* Question Text */}
				<Field data-invalid={!!errors?.questionText}>
					<FieldLabel>
						Question <span className="text-destructive">*</span>
					</FieldLabel>
					<Textarea
						value={question.questionText}
						onChange={(e) => onUpdate({ questionText: e.target.value })}
						placeholder="e.g., What color is the item?"
						rows={2}
						aria-invalid={!!errors?.questionText}
					/>
					{errors?.questionText && (
						<FieldError>{errors.questionText}</FieldError>
					)}
				</Field>

				{/* Render appropriate question type component */}
				{question.questionType === "multiple_choice" ? (
					<MultipleChoiceQuestion
						question={question}
						onUpdate={onUpdate}
						errors={errors}
					/>
				) : (
					<FreeTextQuestion
						question={question}
						onUpdate={onUpdate}
						errors={errors}
					/>
				)}
			</CardContent>
		</Card>
	);
}

interface MultipleChoiceQuestionProps {
	question: SecurityQuestionInput;
	onUpdate: (updates: Partial<SecurityQuestionInput>) => void;
	errors?: { options?: string; answer?: string };
}

function MultipleChoiceQuestion({
	question,
	onUpdate,
	errors,
}: MultipleChoiceQuestionProps) {
	const options = question.options || ["", ""];

	const addOption = () => {
		if (options.length < 6) {
			onUpdate({ options: [...options, ""] });
		}
	};

	const removeOption = (index: number) => {
		if (options.length > 2) {
			const updated = options.filter((_, i) => i !== index);
			// If the removed option was the answer, clear the answer
			if (question.answer === options[index]) {
				onUpdate({ options: updated, answer: "" });
			} else {
				onUpdate({ options: updated });
			}
		}
	};

	const updateOption = (index: number, value: string) => {
		const updated = [...options];
		updated[index] = value;
		onUpdate({ options: updated });
	};

	const selectAnswer = (value: string) => {
		onUpdate({ answer: value });
	};

	return (
		<div className="space-y-3">
			<div>
				<FieldLabel>
					Options <span className="text-destructive">*</span>
				</FieldLabel>
				<p className="mb-2 text-muted-foreground text-xs">
					Add 2-6 options and select the correct answer
				</p>
			</div>

			<div className="space-y-2">
				{options.map((option, index) => (
					<div key={index} className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => selectAnswer(option)}
							className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
								question.answer === option
									? "border-primary bg-primary"
									: "border-muted-foreground/50 hover:border-muted-foreground"
							}`}
							aria-label={`Select option ${index + 1} as correct answer`}
						>
							{question.answer === option && (
								<div className="size-2 rounded-full bg-primary-foreground" />
							)}
						</button>
						<Input
							value={option}
							onChange={(e) => updateOption(index, e.target.value)}
							placeholder={`Option ${index + 1}`}
							className="flex-1"
						/>
						{options.length > 2 && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => removeOption(index)}
								className="size-9 shrink-0"
							>
								<XIcon className="size-4" />
								<span className="sr-only">Remove option</span>
							</Button>
						)}
					</div>
				))}
			</div>

			{options.length < 6 && (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addOption}
					className="w-full"
				>
					<PlusIcon />
					Add Option
				</Button>
			)}

			{errors?.options && (
				<p className="text-destructive text-sm">{errors.options}</p>
			)}
			{errors?.answer && (
				<p className="text-destructive text-sm">{errors.answer}</p>
			)}
		</div>
	);
}

interface FreeTextQuestionProps {
	question: SecurityQuestionInput;
	onUpdate: (updates: Partial<SecurityQuestionInput>) => void;
	errors?: { answer?: string };
}

function FreeTextQuestion({
	question,
	onUpdate,
	errors,
}: FreeTextQuestionProps) {
	return (
		<Field data-invalid={!!errors?.answer}>
			<FieldLabel>
				Expected Answer <span className="text-destructive">*</span>
			</FieldLabel>
			<Input
				value={question.answer}
				onChange={(e) => onUpdate({ answer: e.target.value })}
				placeholder="e.g., Blue"
				aria-invalid={!!errors?.answer}
			/>
			<p className="text-muted-foreground text-xs">
				This answer will be encrypted and only visible to admins
			</p>
			{errors?.answer && <FieldError>{errors.answer}</FieldError>}
		</Field>
	);
}
