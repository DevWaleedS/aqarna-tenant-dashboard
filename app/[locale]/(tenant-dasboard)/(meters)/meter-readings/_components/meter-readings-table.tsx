"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Eye, FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import PagesDialog from "@/components/dailogs/pages-dialog";
import ShowMeterReading from "./show-meter-reading";

interface MeterReadingsTableProps {
	readings: any[];
	isLoading: boolean;
	searchQuery?: string;
	selectedIds: (string | number)[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string | number, checked: boolean) => void;
	isAllSelected: boolean;
}

const MeterReadingsTable = ({
	readings,
	isLoading,
	searchQuery,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: MeterReadingsTableProps) => {
	const t = useTranslations("tenant.meter-readings");
	const showT = useTranslations(
		"tenant.meter-readings.show-meter-reading-page",
	);

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < readings.length;

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "dd MMM yyyy");
		} catch {
			return dateStr;
		}
	};

	const formatNumber = (val?: number) => {
		if (val === undefined || val === null) return "—";
		return new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(val);
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (readings.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{searchQuery
						? t("no_readings_found_matching_search")
						: t("no_readings_available")}
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
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.id")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.meter_id")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.contract_id")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.reading_date")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.value")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.previous_value")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.consumption")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.cost")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.is_processed")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("table.actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{readings.map((reading: any) => {
					const isSelected = selectedIds.includes(reading.id);

					return (
						<TableRow key={reading.id}>
							{/* Checkbox */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(reading.id, checked as boolean)
									}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							{/* ID */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm text-neutral-500'>
								#{reading.id}
							</TableCell>

							{/* Meter ID */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{reading.meter_id ?? "—"}
							</TableCell>

							{/* Contract ID */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{reading.contract_id ?? "—"}
							</TableCell>

							{/* Reading Date */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{formatDate(reading.reading_date)}
							</TableCell>

							{/* Current Value */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center font-mono text-sm'>
								{formatNumber(reading.value)}
							</TableCell>

							{/* Previous Value */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center font-mono text-sm text-neutral-500'>
								{formatNumber(reading.previous_value)}
							</TableCell>

							{/* Consumption */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center font-mono text-sm'>
								<span className='text-blue-600 dark:text-blue-400 font-medium'>
									{formatNumber(reading.consumption)}
								</span>
							</TableCell>

							{/* Cost */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center font-mono text-sm'>
								<span className='font-semibold'>
									{formatNumber(reading.cost)}
								</span>
							</TableCell>

							{/* Processed status */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{reading.is_processed ? (
									<span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'>
										<FileText className='w-3 h-3' />
										{t("status.processed")}
									</span>
								) : (
									<span className='px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'>
										{t("status.pending")}
									</span>
								)}
							</TableCell>

							{/* Actions: View / Generate Invoice */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<PagesDialog
									pageTitle={showT("title")}
									className='max-w-2xl!'
									button={
										<Button
											size='icon'
											variant='ghost'
											className='rounded-[50%] text-blue-500 bg-primary/10 hover:bg-primary/20'>
											<Eye className='w-5 h-5' />
										</Button>
									}>
									<ShowMeterReading readingId={reading.id} />
								</PagesDialog>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

export default MeterReadingsTable;
