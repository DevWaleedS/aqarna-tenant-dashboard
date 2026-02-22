"use client";

import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CustomSelectProps {
	placeholder?: string;
	options: string[];
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
}

function CustomSelect({
	placeholder = "Select",
	options,
	value,
	onChange,
	className,
}: CustomSelectProps) {
	const filterBy = useTranslations("filter-by");
	const handleValueChange = (newValue: string) => {
		if (onChange) {
			onChange(newValue);
		}
	};

	return (
		<Select value={value} onValueChange={handleValueChange}>
			<SelectTrigger
				className={cn(
					"min-w-22 focus-visible:shadow-none focus-visible:ring-0 font-medium dark:bg-slate-700 text-neutral-900 dark:text-white border border-slate-300 dark:border-slate-500 data-placeholder:text-neutral-900",
					className,
				)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => {
					return (
						<SelectItem key={option} value={option.toLowerCase()}>
							{filterBy(option)}
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}

export default CustomSelect;
