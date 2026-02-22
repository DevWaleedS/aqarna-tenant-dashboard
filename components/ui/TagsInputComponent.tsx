import React from "react";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css";
import { cn } from "@/lib/utils";

interface TagsInputProps {
	id: string;
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	className?: string;
}

export const TagsInputComponent: React.FC<TagsInputProps> = ({
	id,
	value,
	onChange,
	placeholder = "Add tags...",
	className = "",
}) => {
	return (
		<TagsInput
			value={value}
			onChange={onChange}
			data-slot='textarea'
			inputProps={{
				id,
				placeholder,
				className: "react-tagsinput-input w-full! !outline-none",
			}}
			className={cn(
				"border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ",
				className
			)}
			tagProps={{
				className:
					"react-tagsinput-tag bg-primary/10! text-primary! dark:text-primary! border border-primary/20! dark:border-primary/40! rounded-sm! px-3 py-1 mr-2 mb-2 inline-flex items-center gap-2 text-sm cursor-pointer",
			}}
			focusedClassName='border-ring ring-ring/50'
		/>
	);
};
