"use client";
import { FileIcon, ImageIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "./button";
import { Label } from "./label";
import { Switch } from "./switch";

interface FileInputProps
	extends Omit<React.ComponentProps<"input">, "placeholder"> {
	classNames?: Partial<Record<"root" | "input" | "previewSwitch", string>>;
	/** A Map of files and their preview URLs created with URL.createObjectURL() */
	files?: File | File[] | Map<File, string>;
	/** A callback function that is called when the files change
	 *
	 * @param {Map<File, string>} files - A Map of files and their preview URLs created with URL.createObjectURL()
	 */
	onFilesChange?: (files: Map<File, string>) => void;
	placeholderType?: "file" | "image";
}

const FilePlaceholder = ({
	type,
	children,
}: {
	type: FileInputProps["placeholderType"];
	children?: React.ReactNode;
}) => (
	<Label className="flex cursor-pointer flex-col items-center gap-2">
		{type === "image" ? (
			<ImageIcon className="size-8 text-gray-400" />
		) : (
			<FileIcon className="size-8 text-gray-400" />
		)}
		<div className="text-gray-500">
			Drag and drop {type === "image" ? "an image" : "file"} or click to upload
		</div>
		<div
			className={cn(
				"border bg-gray-200",
				buttonVariants({ variant: "secondary", size: "sm" }),
			)}
		>
			Upload {type === "image" ? "Image" : "File"}
		</div>
		{children}
	</Label>
);

export function FileInput({
	classNames,
	placeholderType = "file",
	files: controlledFiles,
	onFilesChange,
	multiple,
	...props
}: FileInputProps) {
	const [_files, _setFiles] = useState<Map<File, string>>(() => new Map());
	const [previewMode, setPreviewMode] = useState(true);
	const [isDragActive, setIsDragActive] = useState(false);

	// Handle controlled files input.. Resolves any type of input (FileList or File) to an array of files (File[])
	const unresolvedFiles = controlledFiles || _files;
	let files: Map<File, string>;

	/// If the files are not a Map, create a Map from them and assign it to files
	if (!(unresolvedFiles instanceof Map)) {
		const fileArray = Array.isArray(unresolvedFiles)
			? unresolvedFiles
			: [unresolvedFiles];
		files = new Map(fileArray.map((file) => [file, URL.createObjectURL(file)]));
	} else {
		files = unresolvedFiles;
	}

	const addFiles = (newFiles: File[]) => {
		if (!newFiles.length) return;

		// If multiple is false and user tries adding multiple files, only add the first file
		if (!multiple && files.size > 0) {
			toast.warning("Only one file can be uploaded");
			return;
		}
		if (!multiple && newFiles.length > 1) {
			toast.warning("Only one file can be uploaded");
			const firstFile = newFiles[0];
			if (firstFile) {
				addFiles([firstFile]);
			}
			return;
		}

		// Create a new map to aviod mutating state and preventing rerenders
		const newMap = new Map(files);
		newFiles.forEach((file) => {
			const isImage = file.type.startsWith("image/");
			newMap.set(file, isImage ? URL.createObjectURL(file) : "");
		});
		_setFiles(newMap);
		onFilesChange?.(newMap);
	};

	const removeFiles = (oldFiles: File[]) => {
		if (!oldFiles.length) return;

		// Create a new map to aviod mutating state and preventing rerenders
		const newMap = new Map(files);
		// Match files by name to support recreated File objects from controlled inputs
		oldFiles.forEach((fileToRemove) => {
			for (const [file] of newMap.entries()) {
				if (file.name === fileToRemove.name) {
					URL.revokeObjectURL(newMap.get(file) ?? "");
					newMap.delete(file);
					break;
				}
			}
		});
		_setFiles(newMap);
		onFilesChange?.(newMap);
	};

	const previewSwitch = (
		<div
			className={cn(
				"absolute top-2 right-2 flex items-center gap-1",
				classNames?.previewSwitch,
			)}
		>
			<span className="text-xs">Preview</span>
			<Switch
				checked={previewMode}
				className="scale-75"
				onCheckedChange={setPreviewMode}
			/>
		</div>
	);

	const filePreviews = (
		<div className="flex flex-wrap justify-center gap-4">
			{[...files.entries()].map(([file, preview], index) => (
				<div
					key={index + preview}
					className="relative flex flex-col items-center space-y-2"
				>
					{preview ? (
						<picture>
							<img
								src={preview}
								alt={file.name}
								className="size-24 rounded object-cover"
							/>
						</picture>
					) : (
						<FileIcon className="h-12 w-12 text-gray-400" />
					)}
					<p className="w-20 truncate text-gray-600 text-xs" title={file.name}>
						{file.name}
					</p>
					<Button
						type="button"
						variant="destructive"
						className="-top-1 -right-1 absolute size-5 rounded-full p-0 has-[>svg]:px-0"
						onClick={() => removeFiles([file])}
						aria-label={`Remove ${file.name}`}
					>
						<XIcon className="h-3 w-3" />
					</Button>
				</div>
			))}
		</div>
	);

	const fileList = (
		<div className="flex flex-wrap gap-1 p-1 text-gray-700 text-sm">
			<span>{files.size} file(s) selected:</span>
			{[...files.entries()].map(([file]) => (
				<span
					key={file.name}
					className="ml-1 inline-block max-w-xs truncate italic"
					title={file.name}
				>
					{file.name}
				</span>
			))}
		</div>
	);

	return (
		<div
			role="button"
			tabIndex={0}
			aria-label="File upload area"
			className={cn(
				"relative flex flex-col gap-2 rounded-lg border-2 border-dashed bg-gray-50 p-6 shadow-none transition-colors",
				isDragActive && "border-primary",
				classNames?.root,
			)}
			onDrop={(e) => {
				e.preventDefault();
				setIsDragActive(false);
				addFiles(Array.from(e.dataTransfer.files));
			}}
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragActive(true);
			}}
			onDragLeave={() => setIsDragActive(false)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					document
						.querySelector<HTMLInputElement>('[data-slot="file-input"]')
						?.click();
				}
			}}
		>
			{previewSwitch}

			<FilePlaceholder type={placeholderType}>
				<input
					data-slot="file-input"
					type="file"
					className={cn("sr-only", classNames?.input)}
					onChange={(e) => {
						addFiles(Array.from(e.target.files ?? []));
						// Reset the internal input value to allow addition of files. The component should manage file states internally
						e.target.value = "";
					}}
					multiple={multiple}
					{...props}
				/>{" "}
			</FilePlaceholder>

			{files.size > 0 && previewMode && filePreviews}
			{files.size > 0 && !previewMode && fileList}

			{files.size > 0 && (
				<Button
					type="button"
					variant="destructive"
					size="sm"
					className="w-fit"
					onClick={() => removeFiles(Array.from(files.keys()))}
				>
					<Trash2Icon /> Clear Files
				</Button>
			)}
		</div>
	);
}
