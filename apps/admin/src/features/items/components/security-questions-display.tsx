"use client";

import type { SecurityQuestionWithDecryptedAnswer } from "@findhub/db";
import { Badge } from "@findhub/ui/components/ui/badge";
import { Button } from "@findhub/ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@findhub/ui/components/ui/card";
import {
	CheckCircle2Icon,
	ChevronDownIcon,
	ChevronUpIcon,
	ListIcon,
	LockKeyholeIcon,
	MessageSquareTextIcon,
	ShieldCheckIcon,
} from "lucide-react";
import { useState } from "react";

interface SecurityQuestionsDisplayProps {
	questions: SecurityQuestionWithDecryptedAnswer[];
}

export function SecurityQuestionsDisplay({
	questions,
}: SecurityQuestionsDisplayProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	if (!questions || questions.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="font-semibold text-base">Security Questions</h3>
				<p className="text-muted-foreground text-sm">
					Verification questions for claimant identity validation
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<ShieldCheckIcon className="size-4 text-primary" />
							<CardTitle className="text-base">
								Security Questions ({questions.length})
							</CardTitle>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsExpanded(!isExpanded)}
							className="h-8 w-8 p-0"
							aria-label={
								isExpanded ? "Collapse questions" : "Expand questions"
							}
						>
							{isExpanded ? (
								<ChevronUpIcon className="size-4" />
							) : (
								<ChevronDownIcon className="size-4" />
							)}
						</Button>
					</div>
					<CardDescription>
						These questions can be used to verify the identity of claimants.
						Answers are encrypted and only visible to admin users.
					</CardDescription>
				</CardHeader>

				{isExpanded && (
					<CardContent className="space-y-4">
						{questions.map((question, index) => (
							<QuestionCard
								key={question.id}
								question={question}
								index={index}
							/>
						))}
					</CardContent>
				)}
			</Card>
		</div>
	);
}

interface QuestionCardProps {
	question: SecurityQuestionWithDecryptedAnswer;
	index: number;
}

function QuestionCard({ question, index }: QuestionCardProps) {
	const isMultipleChoice = question.questionType === "multiple_choice";

	return (
		<div className="space-y-3 rounded-lg border bg-card p-4">
			{/* Question Header */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 space-y-1">
					<div className="flex items-center gap-2">
						<span className="font-medium text-muted-foreground text-sm">
							Question {index + 1}
						</span>
						<Badge
							variant={isMultipleChoice ? "default" : "secondary"}
							className="text-xs"
						>
							{isMultipleChoice ? (
								<>
									<ListIcon className="mr-1 size-3" />
									Multiple Choice
								</>
							) : (
								<>
									<MessageSquareTextIcon className="mr-1 size-3" />
									Free Text
								</>
							)}
						</Badge>
					</div>
					<p className="font-medium text-base">{question.questionText}</p>
				</div>
			</div>

			{/* Answer Section */}
			<div className="space-y-2">
				{isMultipleChoice && question.options ? (
					<>
						<p className="font-medium text-muted-foreground text-sm">
							Options:
						</p>
						<div className="space-y-1.5">
							{question.options.map((option, optionIndex) => {
								const isCorrect = option === question.answer;
								return (
									<div
										key={optionIndex}
										className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
											isCorrect
												? "border border-primary/20 bg-primary/10"
												: "bg-muted/50"
										}`}
									>
										{isCorrect ? (
											<CheckCircle2Icon className="size-4 shrink-0 text-primary" />
										) : (
											<div className="size-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
										)}
										<span className={isCorrect ? "font-medium" : ""}>
											{option}
										</span>
										{isCorrect && (
											<Badge variant="default" className="ml-auto text-xs">
												Correct Answer
											</Badge>
										)}
									</div>
								);
							})}
						</div>
					</>
				) : (
					<>
						<p className="font-medium text-muted-foreground text-sm">
							Expected Answer:
						</p>
						<div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-2">
							<LockKeyholeIcon className="mt-0.5 size-4 shrink-0 text-primary" />
							<p className="font-medium text-sm">{question.answer}</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
