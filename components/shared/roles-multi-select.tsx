"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoles } from "@/hooks/queries/central/UseRoles";

interface RolesMultiSelectProps {
	/** Array of selected role *names* (what the API expects) */
	hint?: string;
	value: string[];
	onChange: (roles: string[]) => void;
	placeholder?: string;
	error?: string;
}

const RolesMultiSelect = ({
	value = [],
	onChange,
	placeholder = "Select roles...",
	error,
}: RolesMultiSelectProps) => {
	const { roles, isLoading } = useRoles();
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

	// Auto-focus search when dropdown opens
	useEffect(() => {
		if (open) setTimeout(() => searchRef.current?.focus(), 50);
	}, [open]);

	const filtered = roles.filter((r: any) =>
		r.name.toLowerCase().includes(search.toLowerCase()),
	);

	const toggle = (roleName: string) => {
		if (value.includes(roleName)) {
			onChange(value.filter((v) => v !== roleName));
		} else {
			onChange([...value, roleName]);
		}
	};

	const remove = (roleName: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(value.filter((v) => v !== roleName));
	};

	const clearAll = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange([]);
	};

	// Map selected names back to full role objects for display
	const selectedRoles = value
		.map((name) => roles.find((r: any) => r.name === name))
		.filter(Boolean) as typeof roles;

	return (
		<div ref={containerRef} className='relative'>
			{/* ── Trigger ──────────────────────────────────────────────────── */}
			<div
				onClick={() => setOpen((prev) => !prev)}
				className={cn(
					"min-h-12 flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-lg border bg-white dark:bg-input/30 cursor-pointer select-none transition-all",
					open
						? "border-primary ring-2 ring-primary/20"
						: error
							? "border-red-400 dark:border-red-600"
							: "border-neutral-300 dark:border-slate-700 hover:border-neutral-400 dark:hover:border-slate-500",
				)}>
				{/* Selected pills */}
				{selectedRoles.length > 0 ? (
					<>
						{selectedRoles.map((role: any) => (
							<span
								key={role.name}
								className='inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold capitalize'>
								<Shield className='w-2.5 h-2.5 shrink-0' />
								{role.name}
								<button
									type='button'
									onClick={(e) => remove(role.name, e)}
									className='w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors ml-0.5'>
									<X className='w-2.5 h-2.5' />
								</button>
							</span>
						))}
					</>
				) : (
					<span className='text-sm text-neutral-400 dark:text-neutral-500'>
						{isLoading ? "Loading roles..." : placeholder}
					</span>
				)}

				{/* Right side controls */}
				<div className='ml-auto flex items-center gap-1 shrink-0'>
					{isLoading && (
						<Loader2 className='w-3.5 h-3.5 text-neutral-400 animate-spin' />
					)}
					{selectedRoles.length > 0 && (
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
				<div className='absolute z-50 mt-1.5 w-full rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150'>
					{/* Search bar */}
					<div className='flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100 dark:border-slate-700 dark:bg-input/30'>
						<Search className='w-3.5 h-3.5 text-neutral-400 shrink-0' />
						<input
							ref={searchRef}
							type='text'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder='Search roles...'
							className='flex-1 text-sm bg-transparent outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-800 dark:text-neutral-100 '
						/>
						{search && (
							<button
								type='button'
								onClick={() => setSearch("")}
								className='text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'>
								<X className='w-3 h-3' />
							</button>
						)}
					</div>

					{/* Count header */}
					{selectedRoles.length > 0 && (
						<div className='px-3 py-1.5 border-b border-neutral-100 dark:border-slate-700 flex items-center justify-between'>
							<span className='text-[11px] text-neutral-400 dark:text-neutral-500'>
								{selectedRoles.length} selected
							</span>
							<button
								type='button'
								onClick={(e) => clearAll(e)}
								className='text-[11px] text-red-500 hover:text-red-600 font-medium'>
								Clear all
							</button>
						</div>
					)}

					{/* Options list */}
					<ul className='max-h-52 overflow-y-auto py-1'>
						{isLoading ? (
							<li className='flex items-center justify-center gap-2 py-6 text-sm text-neutral-400'>
								<Loader2 className='w-4 h-4 animate-spin' />
								Loading roles...
							</li>
						) : filtered.length === 0 ? (
							<li className='py-6 text-center text-sm text-neutral-400 dark:text-neutral-500'>
								No roles found
							</li>
						) : (
							filtered.map((role: any) => {
								const isSelected = value.includes(role.name);
								return (
									<li
										key={role.id}
										onClick={() => toggle(role.name)}
										className={cn(
											"flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
											isSelected
												? "bg-primary/8 dark:bg-primary/15"
												: "hover:bg-neutral-50 dark:hover:bg-slate-800",
										)}>
										{/* Checkbox indicator */}
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

										{/* Role info */}
										<div className='flex-1 min-w-0'>
											<div className='flex items-center gap-2'>
												<span
													className={cn(
														"text-sm font-semibold capitalize",
														isSelected
															? "text-primary"
															: "text-neutral-800 dark:text-neutral-100",
													)}>
													{role.name}
												</span>
												{/* Permissions count badge */}
												{role.permissions_count > 0 && (
													<span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400'>
														{role.permissions_count}{" "}
														<span className='font-normal ml-0.5'>perms</span>
													</span>
												)}
											</div>
											<p className='text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5'>
												Guard: {role.guard_name}
											</p>
										</div>

										{/* Shield icon */}
										<Shield
											className={cn(
												"w-4 h-4 shrink-0 transition-colors",
												isSelected
													? "text-primary"
													: "text-neutral-300 dark:text-slate-600",
											)}
										/>
									</li>
								);
							})
						)}
					</ul>

					{/* Footer */}
					{filtered.length > 0 && !isLoading && (
						<div className='px-3 py-2 border-t border-neutral-100 dark:border-slate-700 flex items-center justify-between'>
							<span className='text-[11px] text-neutral-400 dark:text-neutral-500'>
								{filtered.length} role{filtered.length !== 1 ? "s" : ""}{" "}
								available
							</span>
							<button
								type='button'
								onClick={() => setOpen(false)}
								className='text-[11px] font-semibold text-primary hover:text-primary/80'>
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

export default RolesMultiSelect;
