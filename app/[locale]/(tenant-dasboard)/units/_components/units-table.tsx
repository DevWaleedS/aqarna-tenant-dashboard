"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import {
	Bath,
	BedDouble,
	Eye,
	Loader2,
	Pencil,
	Star,
	Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import EditCurrentUnit from "./edit-current-unit";
import ShowCurrentUnit from "./show-current-unit";
import { usePropertiesLookup } from "@/hooks/queries/usePropertiesQuery";

interface UnitsTableProps {
	units: any[];
	isLoading: boolean;
	searchQuery?: string;
	onDelete: (id: string | number) => void;
	selectedIds: (string | number)[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string | number, checked: boolean) => void;
	isAllSelected: boolean;
}

const STATUS_COLORS: Record<string, string> = {
	vacant:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	occupied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	maintenance:
		"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	reserved:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const TYPE_COLORS: Record<string, string> = {
	residential:
		"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	commercial:
		"bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
	industrial: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const UnitsTable = ({
	units,
	isLoading,
	searchQuery,
	onDelete,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: UnitsTableProps) => {
	const { propertiesLookup } = usePropertiesLookup();
	const t = useTranslations("tenant.units");
	const conformMessages = useTranslations("confirmation-dialog");
	const showT = useTranslations("tenant.units.show-current-unit-page");

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < units.length;

	const formatCurrency = (amount?: number) =>
		amount !== undefined && amount !== null
			? new Intl.NumberFormat("en-US").format(amount)
			: "—";

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (units.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{searchQuery
						? t("no_units_found_matching_search")
						: t("no_units_available")}
				</p>
			</div>
		);
	}

	return (
		<Table className='table-auto border-spacing-0 border-separate'>
			<TableHeader>
				<TableRow className='border-0'>
					{/* Checkbox */}
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-s rounded-tl-lg rtl:rounded-tl-none rtl:rounded-tr-lg text-center'>
						<Checkbox
							className='border border-neutral-500 w-4.5 h-4.5 mt-1'
							checked={isAllSelected}
							onCheckedChange={onSelectAll}
							ref={(el) => {
								if (el) (el as any).indeterminate = someSelected;
							}}
						/>
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.name")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.property")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.type")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.floor")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.area")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.rooms")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.monthly_rent")}
					</TableHead>

					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.status")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("table.actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{units.map((unit: any) => {
					const isSelected = selectedIds.includes(unit.id);
					const propertyName =
						propertiesLookup?.find((item: any) => item.id === unit.property_id)
							?.name ?? "_";
					return (
						<TableRow key={unit.id}>
							{/* Checkbox */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(unit.id, checked as boolean)
									}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							{/* Name + Unit Number + cover thumbnail */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<div className='flex items-center gap-3'>
									{unit.cover ? (
										<img
											src={unit.cover}
											alt={unit.name}
											className='w-9 h-9 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-slate-600'
										/>
									) : (
										<div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0'>
											{unit.unit_number ?? "#"}
										</div>
									)}
									<div>
										<p className='font-medium text-sm'>{unit.name ?? "—"}</p>
										<p className='text-xs text-neutral-400 dark:text-neutral-500 font-mono'>
											#{unit.unit_number}
										</p>
									</div>
								</div>
							</TableCell>

							{/* Property name */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-sm'>
								{propertyName}
							</TableCell>

							{/* Type badge */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[unit.type] ?? "bg-gray-100 text-gray-600"}`}>
									{unit.type ?? "—"}
								</span>
							</TableCell>

							{/* Floor */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{unit.floor_number ?? "—"}
							</TableCell>

							{/* Area */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{unit.area ? `${unit.area} m²` : "—"}
							</TableCell>

							{/* Rooms — bed + bath icons */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<div className='flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400'>
									<span className='flex items-center gap-1'>
										<BedDouble className='w-3.5 h-3.5' />
										{unit.rooms_count ?? 0}
									</span>
									<span className='flex items-center gap-1'>
										<Bath className='w-3.5 h-3.5' />
										{unit.bathrooms_count ?? 0}
									</span>
								</div>
							</TableCell>

							{/* Monthly rent */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center font-semibold text-sm'>
								{formatCurrency(unit.monthly_rent)}
							</TableCell>

							{/* Status badge */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[unit.status] ?? "bg-gray-100 text-gray-600"}`}>
									{unit.status ?? "—"}
								</span>
							</TableCell>

							{/* Actions: Delete | Edit | View */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<div className='flex justify-center items-center gap-2'>
									{/* Delete */}
									<ConfirmationDialog
										type='danger'
										confirmText={conformMessages("confirm-delete-button-text")}
										title={conformMessages("title")}
										icon={<Trash2 className='w-5 h-5' />}
										trigger={
											<Button
												type='button'
												className='btn px-2.5! py-2.5! flex items-center bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
												<Trash2 className='w-5 h-5 shrink-0' />
											</Button>
										}
										onConfirm={() => onDelete(unit.id)}>
										{conformMessages("delete-message")}
									</ConfirmationDialog>

									{/* Edit */}
									<PagesDialog
										pageTitle={showT("edit-title")}
										className='max-w-4xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'>
												<Pencil className='w-4 h-4' />
											</Button>
										}>
										<EditCurrentUnit unitId={unit.id} />
									</PagesDialog>

									{/* View */}
									<PagesDialog
										pageTitle={showT("title")}
										className='max-w-3xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-blue-500 bg-primary/10 hover:bg-primary/20'>
												<Eye className='w-5 h-5' />
											</Button>
										}>
										<ShowCurrentUnit unitId={unit.id} />
									</PagesDialog>
								</div>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

export default UnitsTable;
