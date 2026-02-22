"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Eye, Loader2, Pencil, Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import ShowCurrentCustomer from "./show-current-customer";
import EditCurrentCustomer from "./edit-current-customer";

interface CustomersTableProps {
	customers: any[];
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
	blacklisted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const KYC_COLORS: Record<string, string> = {
	verified:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	pending:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	not_submitted:
		"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const CustomersTable = ({
	customers,
	isLoading,
	searchQuery,
	onDelete,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: CustomersTableProps) => {
	const t = useTranslations("tenant.customers");
	const conformMessages = useTranslations("confirmation-dialog");
	const showCustomer = useTranslations(
		"tenant.customers.show-current-customer-page",
	);

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < customers.length;

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "dd MMM yyyy");
		} catch {
			return dateStr;
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (customers.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{searchQuery
						? t("no_customers_found_matching_search")
						: t("no_customers_available")}
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
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.email")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.phone")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.type")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.kyc_status")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.rating")}
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
				{customers.map((customer: any) => {
					const isSelected = selectedIds.includes(customer.id);
					const phone = customer.dial_code
						? `+${customer.dial_code} ${customer.phone}`
						: (customer.phone ?? "—");

					return (
						<TableRow key={customer.id}>
							{/* Checkbox */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(customer.id, checked as boolean)
									}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							{/* Name + Avatar */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<div className='flex items-center gap-2'>
									{customer.avatar ? (
										<img
											src={customer.avatar}
											alt={customer.name}
											className='w-8 h-8 rounded-full object-cover shrink-0'
										/>
									) : (
										<div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0'>
											{customer.name?.charAt(0)?.toUpperCase()}
										</div>
									)}
									<span className='font-medium'>{customer.name}</span>
								</div>
							</TableCell>

							{/* Email */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-sm'>
								{customer.email ?? "—"}
							</TableCell>

							{/* Phone */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{phone}
							</TableCell>

							{/* Type */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center capitalize'>
								{customer.type ?? "—"}
							</TableCell>

							{/* KYC */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`px-2 py-0.5 rounded-full text-xs font-medium ${
										KYC_COLORS[customer.kyc_status] ??
										KYC_COLORS["not_submitted"]
									}`}>
									{customer.kyc_status?.replace("_", " ") ?? "—"}
								</span>
							</TableCell>

							{/* Rating */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{customer.rating ? (
									<div className='flex items-center justify-center gap-1 text-yellow-500'>
										<Star className='w-3.5 h-3.5 fill-yellow-400' />
										<span className='text-sm'>{customer.rating}</span>
									</div>
								) : (
									"—"
								)}
							</TableCell>

							{/* Status */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${
										STATUS_COLORS[customer.status] ?? STATUS_COLORS["inactive"]
									}`}>
									{customer.status}
								</span>
							</TableCell>

							{/* Joined date */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
								{formatDate(customer.created_at)}
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
										onConfirm={() => onDelete(customer.id)}>
										{conformMessages("delete-message")}
									</ConfirmationDialog>

									{/* Edit */}
									<PagesDialog
										pageTitle={showCustomer("edit-title")}
										className='max-w-4xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'>
												<Pencil className='w-4 h-4' />
											</Button>
										}>
										<EditCurrentCustomer customerId={customer.id} />
									</PagesDialog>

									{/* View */}
									<PagesDialog
										pageTitle={showCustomer("title")}
										className='max-w-4xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-blue-500 bg-primary/10'>
												<Eye className='w-5 h-5' />
											</Button>
										}>
										<ShowCurrentCustomer customerId={customer.id} />
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

export default CustomersTable;
