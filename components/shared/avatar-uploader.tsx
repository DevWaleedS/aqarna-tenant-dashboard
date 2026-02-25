"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
	/** Existing remote URL (from API) shown before any local selection */
	currentUrl?: string | null;
	onChange: (file: File | null) => void;
	error?: string;
	uploadLabel?: string;
	changeLabel?: string;
	removeLabel?: string;
	hint?: string;
}

const AvatarUploader = ({
	currentUrl,
	onChange,
	error,
	uploadLabel = "Upload Photo",
	changeLabel = "Change Photo",
	removeLabel = "Remove",
	hint = "JPG, PNG or WebP — max 2 MB",
}: AvatarUploaderProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const displaySrc = preview ?? currentUrl ?? null;

	const handleFile = (file: File | null) => {
		if (!file) return;
		const url = URL.createObjectURL(file);
		setPreview(url);
		onChange(file);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFile(e.target.files?.[0] ?? null);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		handleFile(e.dataTransfer.files?.[0] ?? null);
	};

	const handleRemove = () => {
		setPreview(null);
		onChange(null);
		if (inputRef.current) inputRef.current.value = "";
	};

	return (
		<div className='flex flex-col items-center gap-4'>
			{/* Avatar circle */}
			<div
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
				onClick={() => inputRef.current?.click()}
				className={cn(
					"relative w-28 h-28 rounded-full cursor-pointer group transition-all",
					isDragging
						? "ring-4 ring-primary ring-offset-2 scale-105"
						: "ring-2 ring-neutral-200 dark:ring-slate-600 hover:ring-primary hover:ring-offset-2",
				)}>
				{/* Image / placeholder */}
				{displaySrc ? (
					<img
						src={displaySrc}
						alt='avatar'
						className='w-full h-full rounded-full object-cover'
					/>
				) : (
					<div className='w-full h-full rounded-full bg-primary/10 flex items-center justify-center'>
						<User className='w-10 h-10 text-primary/50' />
					</div>
				)}

				{/* Hover overlay */}
				<div className='absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
					<Camera className='w-6 h-6 text-white' />
				</div>

				{/* Online-style indicator dot reused as "has photo" indicator */}
				{displaySrc && (
					<div className='absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 flex items-center justify-center'>
						<div className='w-1.5 h-1.5 rounded-full bg-white' />
					</div>
				)}
			</div>

			{/* Hidden file input */}
			<input
				ref={inputRef}
				type='file'
				accept='image/jpeg,image/jpg,image/png,image/webp'
				className='hidden'
				onChange={handleInputChange}
			/>

			{/* Action buttons */}
			<div className='flex items-center gap-2'>
				<Button
					type='button'
					size='sm'
					variant='outline'
					onClick={() => inputRef.current?.click()}
					className='gap-1.5 h-8 text-xs px-3 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary'>
					<Camera className='w-3.5 h-3.5' />
					{displaySrc ? changeLabel : uploadLabel}
				</Button>

				{displaySrc && (
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={handleRemove}
						className='gap-1.5 h-8 text-xs px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'>
						<Trash2 className='w-3.5 h-3.5' />
						{removeLabel}
					</Button>
				)}
			</div>

			{/* Hint */}
			<p className='text-xs text-neutral-400 dark:text-neutral-500'>{hint}</p>

			{/* Error */}
			{error && <p className='text-red-500 text-xs -mt-2'>{error}</p>}
		</div>
	);
};

export default AvatarUploader;
