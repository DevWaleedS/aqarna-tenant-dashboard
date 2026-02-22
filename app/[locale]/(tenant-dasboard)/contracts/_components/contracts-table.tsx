"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { CircleOff, Eye, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import ShowCurrentContract from "./show-current-contract";

interface ContractsTableProps {
	contracts: any[];
	isLoading: boolean;
	searchQuery?: string;
	onTerminate: (id: string | number) => void;
	selectedIds: (string | number)[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string | number, checked: boolean) => void;
	isAllSelected: boolean;
}

const STATUS_COLORS: Record<string, string> = {
	active:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	draft:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	expired: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
	terminated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	suspended:
		"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const ContractsTable = ({
	contracts,
	isLoading,
	searchQuery,
	onTerminate,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: ContractsTableProps) => {
	const t = useTranslations("tenant.contracts");
	const conformMessages = useTranslations("confirmation-dialog");
	const showContract = useTranslations(
		"tenant.contracts.show-current-contract-page",
	);

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < contracts.length;

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "dd MMM yyyy");
		} catch {
			return dateStr;
		}
	};

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

	if (contracts.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{searchQuery
						? t("no_contracts_found_matching_search")
						: t("no_contracts_available")}
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
						{t("table.contract_number")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.customer_name")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.grace_period_days")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.termination_penalty_type")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.start_date")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.end_date")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.rent_amount")}
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
				{contracts.map((contract: any) => {
					const isSelected = selectedIds.includes(contract.id);
					const customerName = contract.customer
						? `${contract.customer.first_name} ${contract.customer.last_name}`
						: "—";

					return (
						<TableRow key={contract.id}>
							{/* Checkbox */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(contract.id, checked as boolean)
									}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							{/* Contract Number */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e font-medium'>
								{contract.contract_number ?? "—"}
							</TableCell>

							{/* Customer Name */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								{customerName}
							</TableCell>

							{/* Grace Period */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{contract.grace_period_days ?? 0}
							</TableCell>

							{/* Termination Penalty Type */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{contract.termination_penalty_type ?? "—"}
							</TableCell>

							{/* Start Date */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{formatDate(contract.start_date)}
							</TableCell>

							{/* End Date */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{formatDate(contract.end_date)}
							</TableCell>

							{/* Rent Amount */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{formatCurrency(contract.rent_amount)}
							</TableCell>

							{/* Status */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${
										STATUS_COLORS[contract.status] ?? STATUS_COLORS["draft"]
									}`}>
									{contract.status}
								</span>
							</TableCell>

							{/* Actions */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<div className='flex justify-center items-center gap-2'>
									<ConfirmationDialog
										type='danger'
										confirmText={conformMessages(
											"confirm-terminate-button-text",
										)}
										title={conformMessages("title")}
										icon={<CircleOff className='w-5 h-5' />}
										trigger={
											<Button
												type='button'
												className='btn px-2.5! py-2.5! flex items-center bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
												<CircleOff className='w-5 h-5 shrink-0' />
											</Button>
										}
										onConfirm={() => onTerminate(contract.id)}>
										{conformMessages("terminate-message")}
									</ConfirmationDialog>

									<PagesDialog
										pageTitle={showContract("title")}
										className='max-w-5xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-blue-500 bg-primary/10'>
												<Eye className='w-5 h-5' />
											</Button>
										}>
										<ShowCurrentContract contractId={contract.id} />
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

export default ContractsTable;
