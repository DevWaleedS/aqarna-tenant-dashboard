"use client";

import { format } from "date-fns";
import { enZA, ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

interface DatePickerProps {
	currentDate?: Date;
	disabled?: boolean;
	// ✅ Added: called with the selected Date so Controller can sync the value
	onChange?: (date: Date) => void;
}

export function DatePicker({
	disabled,
	currentDate,
	onChange,
}: DatePickerProps) {
	const t = useTranslations("date_picker");
	const locale = useLocale();
	const isAr = locale === "ar";
	const [date, setDate] = React.useState<Date | undefined>(currentDate);

	// Keep internal state in sync when the parent resets/changes currentDate
	React.useEffect(() => {
		setDate(currentDate);
	}, [currentDate]);

	const handleSelect = (selectedDate: Date | undefined) => {
		if (!selectedDate) return;
		setDate(selectedDate);
		onChange?.(selectedDate);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					disabled={disabled}
					variant={"outline"}
					className={cn(
						"text-left font-normal hover:bg-transparent text-neutral-600! border border-neutral-300 dark:border-slate-700 !focus:border-primary dark:focus:border-primary focus-visible:border-primary active:scale-[1] h-12 px-5 w-full justify-between",
						!date && "text-muted-foreground",
					)}>
					{date ? (
						format(date, "PPP", { locale: isAr ? ar : enZA })
					) : (
						<span>{t("label")}</span>
					)}
					<CalendarIcon className='mr-2 h-4 w-4' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0'>
				<Calendar
					mode='single'
					selected={date}
					onSelect={handleSelect}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
