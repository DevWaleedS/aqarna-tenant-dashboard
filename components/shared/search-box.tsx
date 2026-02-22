import React from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
	searchPlaceholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
}

const SearchBox = ({
	searchPlaceholder = "Search...",
	value = "",
	onChange,
	className,
}: SearchBoxProps) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(e.target.value);
		}
	};

	return (
		<div className={cn("relative sm:max-w-130 w-full", className)}>
			<Input
				className={cn(
					"bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 shadow-none focus-visible:ring-0 focus-visible:border-primary border border-slate-300 h-10 pe-6 ps-11 w-full dark:border-slate-600"
				)}
				placeholder={searchPlaceholder}
				value={value}
				onChange={handleChange}
			/>
			<span className='absolute top-[50%] start-0 ms-4 -translate-y-[50%]'>
				<Search
					className='text-neutral-500 dark:text-white'
					width={18}
					height={18}
				/>
			</span>
		</div>
	);
};

export default SearchBox;
