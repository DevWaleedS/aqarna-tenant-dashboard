"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, ChevronDown } from "lucide-react";

function cn(...classes: Array<string>) {
	return classes.filter(Boolean).join(" ");
}

export type MultiSelectOption = {
	[key: string]: any;
};

type MultiSelectProps = {
	disabled?: boolean;
	options: MultiSelectOption[];
	value?: string[];
	onChange?: (values: string[]) => void;
	placeholder?: string;
	className?: string;
	size?: "sm" | "default";
	/** Key to use as the unique identifier (value) */
	valueKey?: string;
	/** Key to use for the display label */
	labelKey?: string;
};

export const MultiSelect = ({
	disabled,
	options,
	value = [],
	onChange,
	placeholder = "Select",
	className = "",
	size = "default",
	valueKey = "id",
	labelKey = "guard_name",
}: MultiSelectProps) => {
	const [selectedValues, setSelectedValues] = React.useState<string[]>(value);

	// Sync internal state with external value prop
	React.useEffect(() => {
		setSelectedValues(value);
	}, [value]);

	const toggleValue = (val: string) => {
		const updated = selectedValues.includes(val)
			? selectedValues.filter((v) => v !== val)
			: [...selectedValues, val];

		setSelectedValues(updated);
		onChange?.(updated);
	};

	const selectedLabels = options
		.filter((opt) => selectedValues.includes(opt[valueKey]))
		.map((opt) => opt[labelKey])
		.join(", ");

	return (
		<PopoverPrimitive.Root>
			<PopoverPrimitive.Trigger asChild>
				<button
					disabled={disabled}
					className={cn(
						"border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
						className,
					)}>
					<span className='truncate text-left rtl:text-right flex-1'>
						{selectedLabels || (
							<span className='text-muted-foreground'>{placeholder}</span>
						)}
					</span>
					<ChevronDown className='size-4 opacity-50' />
				</button>
			</PopoverPrimitive.Trigger>

			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					align='start'
					sideOffset={4}
					className={cn(
						"bg-popover text-popover-foreground rounded-md border shadow-md z-50 min-w-(--radix-popover-trigger-width) max-h-60 overflow-y-auto animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					)}>
					{options.map((option, index) => (
						<React.Fragment key={option[valueKey]}>
							<label
								className={cn(
									"focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 px-2 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground",
								)}>
								<CheckboxPrimitive.Root
									checked={selectedValues.includes(option[valueKey])}
									onCheckedChange={() => toggleValue(option[valueKey])}
									className='border-input bg-background flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary'>
									<CheckboxPrimitive.Indicator className='flex items-center justify-center text-current'>
										<Check className='h-3.5 w-3.5' />
									</CheckboxPrimitive.Indicator>
								</CheckboxPrimitive.Root>

								<span className='flex-1 text-left rtl:text-right'>
									{option[labelKey]}
								</span>
							</label>

							{index < options.length - 1 && (
								<div className='bg-border pointer-events-none -mx-1 my-1 h-px' />
							)}
						</React.Fragment>
					))}
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
};
