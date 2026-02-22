"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import TransactionDetails from "./TransactionDetails";
import PagesDialog from "@/components/dailogs/pages-dialog";

interface TransactionHistoryTableProps {
	transactions: any[];
	isLoading: boolean;
	onConfirm: (id: string) => void;
	isConfirming: boolean;
}

const TransactionHistoryTable = ({
	transactions,
	isLoading,
	onConfirm,
	isConfirming,
}: TransactionHistoryTableProps) => {
	const t = useTranslations("central.transactions.transaction-history-table");
	const transaction_details = useTranslations(
		"central.transactions.transaction_details",
	);
	const locale = useLocale();

	const getStatusVariant = (status: number | string) => {
		const statusMap: Record<
			string,
			| "default"
			| "secondary"
			| "destructive"
			| "outline"
			| "success"
			| "warning"
			| "info"
			| "danger"
		> = {
			"0": "warning", // Pending
			"1": "success", // Done/Confirmed
			"2": "danger", // Failed
			"3": "secondary", // Cancelled
		};
		return statusMap[status.toString()] || "default";
	};

	const getRelativeTime = (date: string) => {
		if (!date) return "N/A";
		return formatDistanceToNow(new Date(date), {
			addSuffix: true,
			locale: locale === "ar" ? ar : enUS,
		});
	};

	const formatAmount = (amount: number, currency: string = "EGP") => {
		return `${currency} ${amount.toFixed(2)}`;
	};

	const getApplicantName = (transaction: any) => {
		if (transaction.tenant_application?.company_name) {
			return transaction.tenant_application.company_name;
		}
		return transaction.tenant_application?.contact_name || "N/A";
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-12'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	if (transactions.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-500 dark:text-gray-400'>
					{t("no_transactions")}
				</p>
			</div>
		);
	}

	return (
		<Table className='table-auto border-spacing-0 border-separate'>
			<TableHeader>
				<TableRow className='border-0'>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-s rounded-tl-lg rtl:rounded-tl-none rtl:rounded-tr-lg text-center'>
						{t("tenant_application")}
					</TableHead>

					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("package")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("price")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("payment_gateway")}
					</TableHead>

					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("payment_method")}
					</TableHead>

					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("date")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("status")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{transactions.map((transaction, index) => {
					const isLastRow = index === transactions.length - 1;
					const isPending = transaction.status === 0;
					const applicantName = getApplicantName(transaction);

					return (
						<TableRow key={transaction.id}>
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<div className='flex items-center'>
									<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 me-2'>
										<span className='text-sm font-semibold text-primary'>
											{applicantName?.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<h6 className='text-base mb-0 font-medium'>
											{applicantName}
										</h6>
										<p className='text-xs text-gray-500'>
											{transaction.tenant_application?.contact_email}
										</p>
									</div>
								</div>
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{transaction.package?.name || "N/A"}
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span className='font-semibold'>
									{formatAmount(
										transaction.formatted_price,
										transaction.currency,
									)}
								</span>
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center capitalize'>
								{transaction.payment_gateway || "N/A"}
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{transaction.payment_method_label || "N/A"}
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span className='text-sm'>
									{getRelativeTime(
										transaction.paid_at || transaction.created_at,
									)}
								</span>
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Badge
									variant={getStatusVariant(transaction.status)}
									className='rounded-[50rem]'>
									{transaction.status_label}
								</Badge>
							</TableCell>

							<TableCell
								className={`py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e ${
									isLastRow
										? "rounded-br-lg rtl:rounded-bl-lg rtl:rounded-br-none"
										: ""
								} text-center`}>
								<div className='flex items-center justify-center gap-2'>
									<PagesDialog
										pageTitle={transaction_details("title")}
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-full text-blue-500 bg-primary/10 hover:bg-primary/20'>
												<Eye className='w-5 h-5' />
											</Button>
										}>
										<TransactionDetails
											transactionId={transaction.id.toString()}
										/>
									</PagesDialog>

									<Button
										size='icon'
										variant='ghost'
										onClick={() => onConfirm(transaction.id.toString())}
										disabled={isConfirming || isPending}
										className='rounded-full text-green-500 bg-green-100 dark:bg-green-600/25 hover:bg-green-200 hover:dark:bg-green-600/30'
										title={t("confirm_transaction")}>
										{isConfirming ? (
											<Loader2 className='w-5 h-5 animate-spin' />
										) : (
											<CheckCircle className='w-5 h-5' />
										)}
									</Button>
								</div>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

export default TransactionHistoryTable;
