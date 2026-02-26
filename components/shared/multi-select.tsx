"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MultiSelectOption {
	/** The value that gets stored / sent to the API */
	value: string | number;
	/** Primary label shown in pill and option row */
	label: string;
	/** Optional secondary line shown below the label inside the dropdown */
	description?: string;
	/** Small badge text shown to the right of the label (e.g. "15 perms", "active") */
	badge?: string;
	/** Optional icon rendered before the label in both pill and option row */
	icon?: React.ReactNode;
	/** Disabled — option is shown but not selectable */
	disabled?: boolean;
}

interface MultiSelectProps {
	/** Currently selected values */
	value: (string | number)[];
	onChange: (selected: (string | number)[]) => void;

	/** The full options list */
	options: MultiSelectOption[];
	/** Show spinner and disable interaction while true */
	isLoading?: boolean;

	placeholder?: string;
	searchPlaceholder?: string;
	noOptionsText?: string;
	loadingText?: string;

	/** Max pills visible in trigger before "+N more" overflow pill */
	maxVisiblePills?: number;

	error?: string;
	disabled?: boolean;
	className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

const MultiSelect = ({
	value = [],
	onChange,
	options = [],
	isLoading = false,
	placeholder = "Select options...",
	searchPlaceholder = "Search...",
	noOptionsText = "No options found",
	loadingText = "Loading...",
	maxVisiblePills = 3,
	error,
	disabled = false,
	className,
}: MultiSelectProps) => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) {
				setOpen(false);
				setSearch("");
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Auto-focus search on open
	useEffect(() => {
		if (open) setTimeout(() => searchRef.current?.focus(), 50);
	}, [open]);

	const filtered = options.filter((o) =>
		o.label.toLowerCase().includes(search.toLowerCase()),
	);

	const selectedOptions = value
		.map((v) => options.find((o) => o.value === v))
		.filter(Boolean) as MultiSelectOption[];

	const toggle = (optionValue: string | number) => {
		const opt = options.find((o) => o.value === optionValue);
		if (!opt || opt.disabled) return;
		if (value.includes(optionValue)) {
			onChange(value.filter((v) => v !== optionValue));
		} else {
			onChange([...value, optionValue]);
		}
	};

	const remove = (optionValue: string | number, e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(value.filter((v) => v !== optionValue));
	};

	const clearAll = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange([]);
	};

	const isDisabled = disabled || isLoading;
	const visiblePills = selectedOptions.slice(0, maxVisiblePills);
	const overflowCount = selectedOptions.length - maxVisiblePills;

	return (
		<div ref={containerRef} className={cn("relative", className)}>
			{/* ── Trigger ──────────────────────────────────────────────────── */}
			<div
				onClick={() => !isDisabled && setOpen((prev) => !prev)}
				className={cn(
					"min-h-12 flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg border border-input bg-white dark:bg-input/30 transition-all",
					isDisabled
						? "opacity-60 cursor-not-allowed bg-neutral-50 dark:bg-input/20"
						: "cursor-pointer",
					open
						? "border-primary ring-2 ring-primary/20"
						: error
							? "border-red-400 dark:border-red-600"
							: "border-neutral-300 dark:border-slate-700 hover:border-neutral-400 dark:hover:border-slate-500",
				)}>
				{/* Selected pills */}
				{selectedOptions.length > 0 ? (
					<>
						{visiblePills.map((opt) => (
							<span
								key={opt.value}
								className='inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold'>
								{opt.icon && (
									<span className='w-3 h-3 shrink-0'>{opt.icon}</span>
								)}
								{opt.label}
								<button
									type='button'
									onClick={(e) => remove(opt.value, e)}
									className='w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors ml-0.5'>
									<X className='w-2.5 h-2.5' />
								</button>
							</span>
						))}

						{overflowCount > 0 && (
							<span className='inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400 text-xs font-semibold border border-neutral-200 dark:border-slate-600'>
								+{overflowCount} more
							</span>
						)}
					</>
				) : (
					<span className='text-sm text-neutral-400 dark:text-neutral-500'>
						{isLoading ? loadingText : placeholder}
					</span>
				)}

				{/* Right controls */}
				<div className='ml-auto flex items-center gap-1 shrink-0'>
					{isLoading && (
						<Loader2 className='w-3.5 h-3.5 text-neutral-400 animate-spin' />
					)}
					{selectedOptions.length > 0 && !isDisabled && (
						<button
							type='button'
							onClick={clearAll}
							className='w-5 h-5 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-700 flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors'>
							<X className='w-3 h-3' />
						</button>
					)}
					<ChevronDown
						className={cn(
							"w-4 h-4 text-neutral-400 transition-transform duration-200",
							open && "rotate-180",
						)}
					/>
				</div>
			</div>

			{/* ── Dropdown panel ───────────────────────────────────────────── */}
			{open && (
				<div className='absolute z-50 mt-1.5 w-full rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150'>
					{/* Search bar */}
					<div className='flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100 dark:border-slate-700'>
						<Search className='w-3.5 h-3.5 text-neutral-400 shrink-0' />
						<input
							ref={searchRef}
							type='text'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder={searchPlaceholder}
							className='flex-1 text-sm bg-transparent outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-800 dark:text-neutral-100'
						/>
						{search && (
							<button
								type='button'
								onClick={() => setSearch("")}
								className='text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors'>
								<X className='w-3 h-3' />
							</button>
						)}
					</div>

					{/* Selected count + clear */}
					{selectedOptions.length > 0 && (
						<div className='px-3 py-1.5 border-b border-neutral-100 dark:border-slate-700 flex items-center justify-between'>
							<span className='text-[11px] text-neutral-400 dark:text-neutral-500'>
								{selectedOptions.length} selected
							</span>
							<button
								type='button'
								onClick={clearAll}
								className='text-[11px] text-red-500 hover:text-red-600 font-medium transition-colors'>
								Clear all
							</button>
						</div>
					)}

					{/* Options list */}
					<ul className='max-h-52 overflow-y-auto py-1'>
						{isLoading ? (
							<li className='flex items-center justify-center gap-2 py-6 text-sm text-neutral-400'>
								<Loader2 className='w-4 h-4 animate-spin' />
								{loadingText}
							</li>
						) : filtered.length === 0 ? (
							<li className='py-6 text-center text-sm text-neutral-400 dark:text-neutral-500'>
								{noOptionsText}
							</li>
						) : (
							filtered.map((opt) => {
								const isSelected = value.includes(opt.value);
								return (
									<li
										key={opt.value}
										onClick={() => toggle(opt.value)}
										className={cn(
											"flex items-center gap-3 px-3 py-2.5 transition-colors",
											opt.disabled
												? "opacity-40 cursor-not-allowed"
												: "cursor-pointer",
											isSelected
												? "bg-primary/8 dark:bg-primary/15"
												: "hover:bg-neutral-50 dark:hover:bg-slate-800",
										)}>
										{/* Checkbox */}
										<div
											className={cn(
												"w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
												isSelected
													? "bg-primary border-primary"
													: "border-neutral-300 dark:border-slate-600",
											)}>
											{isSelected && (
												<Check className='w-2.5 h-2.5 text-white stroke-[3]' />
											)}
										</div>

										{/* Optional icon */}
										{opt.icon && (
											<div
												className={cn(
													"w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
													isSelected
														? "bg-primary/20 text-primary"
														: "bg-neutral-100 dark:bg-slate-800 text-neutral-400",
												)}>
												{opt.icon}
											</div>
										)}

										{/* Label + description */}
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2'>
												<span
													className={cn(
														"text-sm font-semibold truncate",
														isSelected
															? "text-primary"
															: "text-neutral-800 dark:text-neutral-100",
													)}>
													{opt.label}
												</span>
												{opt.badge && (
													<span className='shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400'>
														{opt.badge}
													</span>
												)}
											</div>
											{opt.description && (
												<p className='text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate'>
													{opt.description}
												</p>
											)}
										</div>
									</li>
								);
							})
						)}
					</ul>

					{/* Footer */}
					{!isLoading && filtered.length > 0 && (
						<div className='px-3 py-2 border-t border-neutral-100 dark:border-slate-700 flex items-center justify-between'>
							<span className='text-[11px] text-neutral-400 dark:text-neutral-500'>
								{filtered.length} option{filtered.length !== 1 ? "s" : ""}
							</span>
							<button
								type='button'
								onClick={() => {
									setOpen(false);
									setSearch("");
								}}
								className='text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors'>
								Done
							</button>
						</div>
					)}
				</div>
			)}

			{/* Error */}
			{error && <p className='mt-1.5 text-xs text-red-500'>{error}</p>}
		</div>
	);
};

export default MultiSelect;
export type { MultiSelectProps };
