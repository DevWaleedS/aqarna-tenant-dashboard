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
	Loader2,
	Pencil,
	Trash2,
	Zap,
	Droplets,
	Flame,
	Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import EditCurrentMeter from "./edit-current-meter";

interface MetersTableProps {
	meters: any[];
	isLoading: boolean;
	searchQuery?: string;
	onDelete: (id: string | number) => void;
	selectedIds: (string | number)[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string | number, checked: boolean) => void;
	isAllSelected: boolean;
}

const STATUS_COLORS: Record<string, string> = {
	active:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
	broken: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const TYPE_COLORS: Record<string, string> = {
	electricity:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	water: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	gas: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	internet:
		"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
	electricity: <Zap className='w-3.5 h-3.5' />,
	water: <Droplets className='w-3.5 h-3.5' />,
	gas: <Flame className='w-3.5 h-3.5' />,
	internet: <Wifi className='w-3.5 h-3.5' />,
};

const MetersTable = ({
	meters,
	isLoading,
	searchQuery,
	onDelete,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: MetersTableProps) => {
	const t = useTranslations("tenant.meters");
	const conformMessages = useTranslations("confirmation-dialog");
	const editT = useTranslations("tenant.meters.edit-meter-page");

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < meters.length;

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "dd MMM yyyy");
		} catch {
			return dateStr;
		}
	};

	const formatPrice = (price?: number) => {
		if (price === undefined || price === null) return "—";
		return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(
			price,
		);
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (meters.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{searchQuery
						? t("no_meters_found_matching_search")
						: t("no_meters_available")}
				</p>
			</div>
		);
	}

	return (
		<Table className='table-auto border-spacing-0 border-separate'>
			<TableHeader>
				<TableRow className='border-0'>
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
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.type")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.serial_number")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.unit_id")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.unit_price")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.status")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.created_at")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("table.actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{meters.map((meter: any) => {
					const isSelected = selectedIds.includes(meter.id);

					return (
						<TableRow key={meter.id}>
							{/* Checkbox */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(meter.id, checked as boolean)
									}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							{/* Name */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e font-medium'>
								{meter.name ?? "—"}
							</TableCell>

							{/* Type */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
										TYPE_COLORS[meter.type] ?? "bg-gray-100 text-gray-600"
									}`}>
									{TYPE_ICONS[meter.type]}
									{meter.type ?? "—"}
								</span>
							</TableCell>

							{/* Serial Number */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e font-mono text-sm'>
								{meter.serial_number ?? "—"}
							</TableCell>

							{/* Unit ID */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{meter.unit_id ?? "—"}
							</TableCell>

							{/* Unit Price */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{formatPrice(meter.unit_price)}
							</TableCell>

							{/* Status */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
										STATUS_COLORS[meter.status] ?? STATUS_COLORS["inactive"]
									}`}>
									{meter.status ?? "—"}
								</span>
							</TableCell>

							{/* Created At */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{formatDate(meter.created_at)}
							</TableCell>

							{/* Actions: Delete | Edit */}
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
										onConfirm={() => onDelete(meter.id)}>
										{conformMessages("delete-message")}
									</ConfirmationDialog>

									{/* Edit */}
									<PagesDialog
										pageTitle={editT("title")}
										className='max-w-xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'>
												<Pencil className='w-4 h-4' />
											</Button>
										}>
										<EditCurrentMeter meterId={meter.id} />
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

export default MetersTable;
