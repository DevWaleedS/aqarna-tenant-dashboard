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
	BadgeCheck,
	CalendarClock,
	CheckCircle2,
	CreditCard,
	Eye,
	Loader2,
	Receipt,
	XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import PagesDialog from "@/components/dailogs/pages-dialog";
import ShowCurrentTransaction from "./show-current-transaction";
import ConfirmTransactionDialog from "./confirm-transaction-dialog";
import type { Transaction } from "@/hooks/queries/useTransactions";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
	string,
	{ bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
	paid: {
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-700 dark:text-green-400",
		dot: "bg-green-500",
		icon: <BadgeCheck className='w-3 h-3' />,
	},
	pending: {
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-700 dark:text-yellow-400",
		dot: "bg-yellow-400",
		icon: <CalendarClock className='w-3 h-3' />,
	},
	failed: {
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-700 dark:text-red-400",
		dot: "bg-red-500",
		icon: <XCircle className='w-3 h-3' />,
	},
	refunded: {
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-700 dark:text-blue-400",
		dot: "bg-blue-500",
		icon: <Receipt className='w-3 h-3' />,
	},
	cancelled: {
		bg: "bg-neutral-100 dark:bg-slate-700",
		text: "text-neutral-500 dark:text-neutral-400",
		dot: "bg-neutral-400",
		icon: <XCircle className='w-3 h-3' />,
	},
};

const getStatus = (key: string) =>
	STATUS_CONFIG[key] ?? STATUS_CONFIG["pending"];

// ── Gateway icon map ──────────────────────────────────────────────────────────
const GATEWAY_COLORS: Record<string, string> = {
	stripe:
		"bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
	paypal: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
	bank_transfer:
		"bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
	cash: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
	cheque:
		"bg-neutral-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400",
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface TransactionsTableProps {
	transactions: Transaction[];
	isLoading: boolean;
	searchQuery?: string;
	selectedIds: (string | number)[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string | number, checked: boolean) => void;
	isAllSelected: boolean;
}

const TransactionsTable = ({
	transactions,
	isLoading,
	searchQuery,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: TransactionsTableProps) => {
	const t = useTranslations("tenant.transactions");
	const showT = useTranslations("tenant.transactions.show-page");
	const [confirmId, setConfirmId] = useState<number | string | null>(null);

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < transactions.length;

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-12'>
				<Loader2 className='animate-spin h-8 w-8 text-primary' />
			</div>
		);
	}

	if (transactions.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-16 gap-3 text-neutral-400 dark:text-neutral-500'>
				<CreditCard className='w-10 h-10 opacity-40' />
				<p className='text-base font-medium'>
					{searchQuery
						? t("no_transactions_found_matching_search")
						: t("no_transactions_available")}
				</p>
				{!searchQuery && (
					<p className='text-sm opacity-75'>
						{t("no_transactions_available_desc")}
					</p>
				)}
			</div>
		);
	}

	return (
		<>
			<Table className='table-auto border-spacing-0 border-separate'>
				<TableHeader>
					<TableRow className='border-0'>
						{/* Checkbox */}
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12 border-s rounded-tl-lg rtl:rounded-tl-none rtl:rounded-tr-lg text-center'>
							<Checkbox
								className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								checked={isAllSelected}
								onCheckedChange={onSelectAll}
								ref={(el) => {
									if (el) (el as any).indeterminate = someSelected;
								}}
							/>
						</TableHead>
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12'>
							{t("table.id")}
						</TableHead>
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12'>
							{t("table.amount")}
						</TableHead>
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12'>
							{t("table.gateway")}
						</TableHead>
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12'>
							{t("table.method")}
						</TableHead>
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12 text-center'>
							{t("table.status")}
						</TableHead>
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12 text-center'>
							{t("table.paid-at")}
						</TableHead>
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12'>
							{t("table.confirmed-by")}
						</TableHead>
						<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
							{t("table.actions")}
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{transactions.map((txn) => {
						const isSelected = selectedIds.includes(txn.id);
						const statusCfg = getStatus(txn.status);
						const gatewayColor =
							GATEWAY_COLORS[txn.payment_gateway] ?? GATEWAY_COLORS["cheque"];

						return (
							<TableRow key={txn.id}>
								{/* Checkbox */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
									<Checkbox
										checked={isSelected}
										onCheckedChange={(c) => onSelectOne(txn.id, c as boolean)}
										className='border border-neutral-500 w-4.5 h-4.5 mt-1'
									/>
								</TableCell>

								{/* ID */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
									<span className='text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400'>
										#{txn.id}
									</span>
								</TableCell>

								{/* Amount */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
									<span className='text-sm font-extrabold text-neutral-800 dark:text-neutral-100 tabular-nums'>
										{txn.formatted_price}
									</span>
								</TableCell>

								{/* Gateway */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
									<span
										className={cn(
											"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize",
											gatewayColor,
										)}>
										<CreditCard className='w-3 h-3' />
										{txn.payment_gateway.replace(/_/g, " ")}
									</span>
								</TableCell>

								{/* Method */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-sm text-neutral-600 dark:text-neutral-300'>
									{txn.payment_method_label}
								</TableCell>

								{/* Status */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
									<span
										className={cn(
											"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
											statusCfg.bg,
											statusCfg.text,
										)}>
										<span
											className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)}
										/>
										{txn.status_label}
									</span>
								</TableCell>

								{/* Paid at */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm text-neutral-500 dark:text-neutral-400'>
									{txn.paid_at ? (
										format(new Date(txn.paid_at), "dd MMM yyyy")
									) : (
										<span className='text-neutral-300 dark:text-slate-600'>
											—
										</span>
									)}
								</TableCell>

								{/* Confirmed by */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
									{txn.confirmer ? (
										<div className='flex items-center gap-2'>
											<div className='w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0'>
												{txn.confirmer.name.slice(0, 1).toUpperCase()}
											</div>
											<span className='text-sm text-neutral-700 dark:text-neutral-300 truncate max-w-[120px]'>
												{txn.confirmer.name}
											</span>
										</div>
									) : (
										<span className='text-xs italic text-neutral-300 dark:text-slate-600'>
											—
										</span>
									)}
								</TableCell>

								{/* Actions */}
								<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
									<div className='flex justify-center items-center gap-2'>
										{/* Confirm — only for pending */}
										{txn.status === "pending" && (
											<Button
												size='icon'
												type='button'
												onClick={() => setConfirmId(txn.id)}
												className='rounded-full w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border-0'>
												<CheckCircle2 className='w-4 h-4' />
											</Button>
										)}

										<PagesDialog
											pageTitle={showT("title")}
											className='max-w-lg!'
											button={
												<Button
													size='icon'
													variant='ghost'
													className='rounded-full w-8 h-8 text-blue-500 bg-primary/10 hover:bg-primary/20'>
													<Eye className='w-4 h-4' />
												</Button>
											}>
											<ShowCurrentTransaction transactionId={txn.id} />
										</PagesDialog>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>

			{/* Confirm dialog for inline row button */}
			{confirmId !== null && (
				<ConfirmTransactionDialog
					transactionId={confirmId}
					open={true}
					onOpenChange={(open) => {
						if (!open) setConfirmId(null);
					}}
				/>
			)}
		</>
	);
};

export default TransactionsTable;
