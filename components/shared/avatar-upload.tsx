"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DefaultUploadedImage from "@/public/assets/images/user-grid/user-grid-img13.png";
import { Camera } from "lucide-react";
import { StaticImageData } from "next/image";
import React, { useRef, useState, useEffect } from "react";

interface AvatarUploadProps {
	disabled?: boolean;
	onFileChange?: (file: File | null) => void;
	initialImage?: string | StaticImageData;
}

const AvatarUpload = ({
	disabled,
	onFileChange,
	initialImage,
}: AvatarUploadProps) => {
	const [imagePreview, setImagePreview] = useState<string | StaticImageData>(
		initialImage || DefaultUploadedImage,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (initialImage) {
			setImagePreview(initialImage);
		}
	}, [initialImage]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);

			// Call the callback with the file
			if (onFileChange) {
				onFileChange(file);
			}
		}
	};

	return (
		<div className='avatar-upload'>
			<div className='avatar-edit absolute bottom-0 end-0 me-6 mt-4 z-1 cursor-pointer'>
				<Input
					type='file'
					id='imageUpload'
					accept='.png, .jpg, .jpeg'
					ref={fileInputRef}
					onChange={handleImageChange}
					hidden
					disabled={disabled}
				/>

				{!disabled && (
					<Label
						htmlFor='imageUpload'
						className='w-8 h-8 flex justify-center items-center bg-blue-100 dark:bg-primary/25 text-primary dark:text-blue-400 border border-primary hover:bg-blue-100 text-lg rounded-full cursor-pointer'>
						<Camera className='w-4 h-4' />
					</Label>
				)}
			</div>

			<div className='avatar-preview relative h-37.5 w-37.5 rounded-full border border-[#487FFF] shadow-md'>
				<div
					id='imagePreview'
					className='h-full w-full rounded-full bg-cover bg-center bg-no-repeat'
					style={{
						backgroundImage: `url(${
							typeof imagePreview === "string" ? imagePreview : imagePreview.src
						})`,
					}}
				/>
			</div>
		</div>
	);
};

export default AvatarUpload;
