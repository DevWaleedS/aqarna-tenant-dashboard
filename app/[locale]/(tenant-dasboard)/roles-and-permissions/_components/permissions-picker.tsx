"use client";

import { useMemo, useState } from "react";
import {
	Check,
	ChevronDown,
	Search,
	Shield,
	ShieldCheck,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Groups flat "resource.action" permission strings into:
 * { resource: ["resource.action", ...] }
 */
const groupPermissions = (permissions: string[]) => {
	return permissions.reduce<Record<string, string[]>>((acc, perm) => {
		const [resource] = perm.split(".");
		const key = resource ?? perm;
		if (!acc[key]) acc[key] = [];
		acc[key].push(perm);
		return acc;
	}, {});
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface PermissionsPickerProps {
	/** All available permissions (flat string array from API) */
	available: string[];
	/** Currently selected permissions */
	value: string[];
	onChange: (permissions: string[]) => void;
	searchPlaceholder?: string;
	error?: string;
}

// ── Group row ─────────────────────────────────────────────────────────────────
const GroupRow = ({
	group,
	items,
	selected,
	onToggleItem,
	onToggleGroup,
}: {
	group: string;
	items: string[];
	selected: string[];
	onToggleItem: (perm: string) => void;
	onToggleGroup: (group: string, items: string[], select: boolean) => void;
}) => {
	const [expanded, setExpanded] = useState(true);
	const selectedInGroup = items.filter((i) => selected.includes(i));
	const allSelected = selectedInGroup.length === items.length;
	const someSelected = selectedInGroup.length > 0 && !allSelected;

	return (
		<div className='border border-neutral-100 dark:border-slate-700 rounded-xl overflow-hidden'>
			{/* Group header */}
			<div
				onClick={() => setExpanded((p) => !p)}
				className='flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-slate-800/60 cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors'>
				{/* Group checkbox */}
				<div
					onClick={(e) => {
						e.stopPropagation();
						onToggleGroup(group, items, !allSelected);
					}}
					className={cn(
						"w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer",
						allSelected
							? "bg-primary border-primary"
							: someSelected
								? "bg-primary/30 border-primary"
								: "border-neutral-300 dark:border-slate-600 hover:border-primary",
					)}>
					{allSelected && <Check className='w-3 h-3 text-white stroke-[3]' />}
					{someSelected && <div className='w-2 h-2 rounded-sm bg-primary' />}
				</div>

				<Shield className='w-4 h-4 text-primary shrink-0' />

				<span className='flex-1 text-sm font-bold text-neutral-700 dark:text-neutral-200 capitalize'>
					{group}
				</span>

				{/* Count badge */}
				<span className='text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
					{selectedInGroup.length}/{items.length}
				</span>

				<ChevronDown
					className={cn(
						"w-4 h-4 text-neutral-400 transition-transform duration-200",
						!expanded && "-rotate-90",
					)}
				/>
			</div>

			{/* Permission rows */}
			{expanded && (
				<div className='divide-y divide-neutral-100 dark:divide-slate-700/50'>
					{items.map((perm) => {
						const action = perm.split(".")[1] ?? perm;
						const isSelected = selected.includes(perm);

						return (
							<div
								key={perm}
								onClick={() => onToggleItem(perm)}
								className={cn(
									"flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
									isSelected
										? "bg-primary/5 dark:bg-primary/10"
										: "hover:bg-neutral-50 dark:hover:bg-slate-800/40",
								)}>
								{/* Checkbox */}
								<div
									className={cn(
										"w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
										isSelected
											? "bg-primary border-primary"
											: "border-neutral-300 dark:border-slate-600",
									)}>
									{isSelected && (
										<Check className='w-2.5 h-2.5 text-white stroke-[3]' />
									)}
								</div>

								{/* Action name */}
								<span
									className={cn(
										"text-sm flex-1 capitalize",
										isSelected
											? "text-primary font-semibold"
											: "text-neutral-600 dark:text-neutral-300",
									)}>
									{action.replace(/_/g, " ")}
								</span>

								{/* Full permission key in mono */}
								<span className='text-[11px] font-mono text-neutral-400 dark:text-neutral-500'>
									{perm}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

// ── Main component ────────────────────────────────────────────────────────────
const PermissionsPicker = ({
	available,
	value,
	onChange,
	searchPlaceholder = "Search permissions...",
	error,
}: PermissionsPickerProps) => {
	const [search, setSearch] = useState("");

	const allGroups = useMemo(() => groupPermissions(available), [available]);

	const filteredGroups = useMemo(() => {
		if (!search) return allGroups;
		const q = search.toLowerCase();
		const result: Record<string, string[]> = {};
		Object.entries(allGroups).forEach(([group, items]) => {
			const matched = items.filter(
				(p) => p.toLowerCase().includes(q) || group.toLowerCase().includes(q),
			);
			if (matched.length > 0) result[group] = matched;
		});
		return result;
	}, [allGroups, search]);

	const toggleItem = (perm: string) => {
		if (value.includes(perm)) {
			onChange(value.filter((v) => v !== perm));
		} else {
			onChange([...value, perm]);
		}
	};

	const toggleGroup = (_group: string, items: string[], select: boolean) => {
		if (select) {
			const next = [...new Set([...value, ...items])];
			onChange(next);
		} else {
			onChange(value.filter((v) => !items.includes(v)));
		}
	};

	const selectAll = () => onChange([...available]);
	const clearAll = () => onChange([]);

	const groupEntries = Object.entries(filteredGroups);

	return (
		<div className='space-y-3'>
			{/* ── Toolbar ──────────────────────────────────────────────────── */}
			<div className='flex items-center gap-3 flex-wrap'>
				{/* Search */}
				<div className='flex-1 min-w-48 flex items-center gap-2 px-3 h-10 rounded-lg border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:border-primary transition-colors'>
					<Search className='w-3.5 h-3.5 text-neutral-400 shrink-0' />
					<input
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
							className='text-neutral-400 hover:text-neutral-600 transition-colors'>
							<X className='w-3 h-3' />
						</button>
					)}
				</div>

				{/* Count + bulk actions */}
				<div className='flex items-center gap-2'>
					{value.length > 0 && (
						<span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold'>
							<ShieldCheck className='w-3 h-3' />
							{value.length} selected
						</span>
					)}
					<button
						type='button'
						onClick={selectAll}
						className='text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/5'>
						Select all
					</button>
					{value.length > 0 && (
						<button
							type='button'
							onClick={clearAll}
							className='text-xs font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20'>
							Clear
						</button>
					)}
				</div>
			</div>

			{/* ── Groups ───────────────────────────────────────────────────── */}
			<div className='space-y-2 max-h-80 overflow-y-auto pr-0.5'>
				{groupEntries.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-10 text-neutral-400 dark:text-neutral-500'>
						<Shield className='w-8 h-8 mb-2 opacity-40' />
						<p className='text-sm'>No permissions found</p>
					</div>
				) : (
					groupEntries.map(([group, items]) => (
						<GroupRow
							key={group}
							group={group}
							items={items}
							selected={value}
							onToggleItem={toggleItem}
							onToggleGroup={toggleGroup}
						/>
					))
				)}
			</div>

			{/* Error */}
			{error && <p className='text-xs text-red-500'>{error}</p>}
		</div>
	);
};

export default PermissionsPicker;
