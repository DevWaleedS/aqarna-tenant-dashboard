"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Building2, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import EditCurrentProperty from "./edit-current-property";
import ShowCurrentProperty from "./show-current-property";

interface PropertiesTableProps {
	properties: any[];
	isLoading: boolean;
	searchQuery?: string;
	onDelete: (id: string | number) => void;
	selectedIds: (string | number)[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string | number, checked: boolean) => void;
	isAllSelected: boolean;
}

const TYPE_COLORS: Record<string, string> = {
	residential:
		"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	commercial:
		"bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
	industrial: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const PropertiesTable = ({
	properties,
	isLoading,
	searchQuery,
	onDelete,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: PropertiesTableProps) => {
	const t = useTranslations("tenant.properties");
	const conformMessages = useTranslations("confirmation-dialog");
	const showT = useTranslations("tenant.properties.show-current-property-page");
	const tAmenities = useTranslations("tenant.properties.amenities");

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < properties.length;

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (properties.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{searchQuery
						? t("no_properties_found_matching_search")
						: t("no_properties_available")}
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
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.type")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.address")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.building")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.floors")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.units")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.area")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.amenities")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("table.actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{properties.map((property: any) => {
					const isSelected = selectedIds.includes(property.id);
					const address = [property.address_line_1, property.address_line_2]
						.filter(Boolean)
						.join(", ");

					return (
						<TableRow key={property.id}>
							{/* Checkbox */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(property.id, checked as boolean)
									}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							{/* Name + cover thumbnail */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<div className='flex items-center gap-3'>
									{property.cover ? (
										<img
											src={property.cover}
											alt={property.name}
											className='w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-slate-600'
										/>
									) : (
										<div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0'>
											<Building2 className='w-5 h-5' />
										</div>
									)}
									<span className='font-medium text-sm'>
										{property.name ?? "—"}
									</span>
								</div>
							</TableCell>

							{/* Type badge */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[property.type] ?? "bg-gray-100 text-gray-600"}`}>
									{property.type ?? "—"}
								</span>
							</TableCell>

							{/* Address */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-sm max-w-[200px]'>
								<p className='truncate text-neutral-700 dark:text-neutral-200'>
									{address || "—"}
								</p>
							</TableCell>

							{/* Building Number */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm font-mono'>
								{property.building_number ?? "—"}
							</TableCell>

							{/* Floors */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{property.floors_count ?? "—"}
							</TableCell>

							{/* Units count */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm font-semibold'>
								{property.units_count ?? "—"}
							</TableCell>

							{/* Area */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{property.area ? `${property.area} m²` : "—"}
							</TableCell>

							{/* Amenities — show first 3 as pills, then +N more */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								{property.amenities?.length > 0 ? (
									<div className='flex flex-wrap gap-1'>
										{property.amenities.slice(0, 3).map((a: string) => (
											<span
												key={a}
												className='px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary capitalize'>
												{tAmenities(a as any)}
											</span>
										))}
										{property.amenities.length > 3 && (
											<span className='px-2 py-0.5 text-[10px] font-medium rounded-full bg-neutral-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400'>
												+{property.amenities.length - 3}
											</span>
										)}
									</div>
								) : (
									"—"
								)}
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
										onConfirm={() => onDelete(property.id)}>
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
										<EditCurrentProperty propertyId={property.id} />
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
										<ShowCurrentProperty propertyId={property.id} />
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

export default PropertiesTable;
