"use client";

import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";

import {
	useTransaction,
	useTransactions,
} from "@/hooks/queries/central/useTransactions";
import { cn } from "@/lib/utils";

/* ======================
   Types
====================== */

enum TransactionStatus {
	PENDING = 0,
	DONE = 1,
	FAILED = 2,
	CANCELLED = 3,
}

interface TransactionDetailsProps {
	transactionId: string;
}

/* ======================
   Component
====================== */

const TransactionDetails = ({ transactionId }: TransactionDetailsProps) => {
	const { transaction, isLoading, error } = useTransaction(transactionId);
	const { confirmTransaction, isConfirming } = useTransactions();

	const t = useTranslations("central.transactions.transaction_details");
	const locale = useLocale();

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='h-6 w-6 animate-spin text-primary' />
				{t("loading-transaction")}
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center py-8 text-red-500'>
				{t("error_loading_transaction")}
			</div>
		);
	}

	if (!transaction) {
		return (
			<div className='text-center py-8 text-muted-foreground'>
				{t("transaction_not_found")}
			</div>
		);
	}

	const canConfirm = transaction.status === TransactionStatus.PENDING;

	const handleConfirm = () => {
		if (!canConfirm) return;
		confirmTransaction(transaction.id);
	};

	return (
		<div className='space-y-4 max-h-[70vh] overflow-y-auto px-1'>
			<HeaderSection transaction={transaction} t={t} />

			<Separator />

			<ApplicantInfoSection transaction={transaction} t={t} />

			<Separator />

			<PackageInfoSection transaction={transaction} t={t} />

			<Separator />

			<PaymentInfoSection transaction={transaction} t={t} locale={locale} />

			{transaction.notes && (
				<>
					<Separator />
					<NotesSection notes={transaction.notes} t={t} />
				</>
			)}

			{/* ===== Actions ===== */}
			{canConfirm && (
				<>
					<Separator />

					<div className='flex justify-center gap-3 pt-4'>
						<Button
							onClick={handleConfirm}
							disabled={isConfirming}
							className='h-12 px-14'>
							{isConfirming ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									{t("confirming")}
								</>
							) : (
								t("confirm_transaction")
							)}
						</Button>

						<DialogClose asChild>
							<Button
								type='button'
								variant='outline'
								className={cn(
									"h-12 px-14 border-red-600 text-red-600 hover:bg-red-600/20",
								)}>
								{t("cancel-button-text")}
							</Button>
						</DialogClose>
					</div>
				</>
			)}
		</div>
	);
};

// ============= Sub Components =============

// Header Section Component
const HeaderSection = ({ transaction, t }: any) => {
	const getStatusVariant = (status: number) => {
		const statusMap: Record<
			number,
			"success" | "warning" | "danger" | "secondary"
		> = {
			0: "warning", // Pending
			1: "success", // Done/Confirmed
			2: "danger", // Failed
			3: "secondary", // Cancelled
		};
		return statusMap[status] || "secondary";
	};

	return (
		<div className='grid grid-cols-2 gap-4'>
			<div>
				<p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
					{t("transaction_id")}
				</p>
				<p className='font-semibold text-base'>#{transaction.id}</p>
			</div>
			<div>
				<p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
					{t("status")}
				</p>
				<Badge variant={getStatusVariant(transaction.status)}>
					{transaction.status_label}
				</Badge>
			</div>
		</div>
	);
};

// Applicant Info Section Component
const ApplicantInfoSection = ({ transaction, t }: any) => {
	const getApplicantName = () => {
		if (transaction.tenant_application?.company_name) {
			return transaction.tenant_application.company_name;
		}
		return transaction.tenant_application?.contact_name || "N/A";
	};

	const applicantData = [
		{ label: t("name"), value: getApplicantName() },
		{
			label: t("email"),
			value: transaction.tenant_application?.contact_email || "N/A",
		},
		{
			label: t("type"),
			value: transaction.tenant_application?.applicant_type || "N/A",
			capitalize: true,
		},
		{
			label: t("subdomain"),
			value: transaction.tenant_application?.subdomain || "N/A",
		},
		{
			label: t("domain"),
			value: transaction.tenant_application?.full_domain || "N/A",
		},
	];

	return <InfoSection title={t("applicant_info")} data={applicantData} />;
};

// Package Info Section Component
const PackageInfoSection = ({ transaction, t }: any) => {
	const packageData = [
		{ label: t("package_name"), value: transaction.package?.name || "N/A" },
		{
			label: t("description"),
			value: transaction.package?.description || "N/A",
			fullWidth: true,
		},
		{
			label: t("max_properties"),
			value: transaction.package?.max_properties || "N/A",
		},
		{ label: t("max_units"), value: transaction.package?.max_units || "N/A" },
	];

	return <InfoSection title={t("package_info")} data={packageData} />;
};

// Payment Info Section Component
const PaymentInfoSection = ({ transaction, t, locale }: any) => {
	const formatAmount = (amount: number, currency: string = "EGP") => {
		return `${currency} ${amount.toFixed(2)}`;
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleString(locale, {
			dateStyle: "medium",
			timeStyle: "short",
		});
	};

	const paymentData = [
		{
			label: t("amount"),
			value: formatAmount(transaction.formatted_price, transaction.currency),
			highlight: true,
		},
		{
			label: t("payment_gateway"),
			value: transaction.payment_gateway || "N/A",
			capitalize: true,
		},
		{
			label: t("payment_method"),
			value: transaction.payment_method_label || "N/A",
		},
	];

	// Add optional fields if they exist
	if (transaction.paid_at) {
		paymentData.push({
			label: t("paid_at"),
			value: formatDate(transaction.paid_at),
		});
	}

	if (transaction.confirmed_at) {
		paymentData.push({
			label: t("confirmed_at"),
			value: formatDate(transaction.confirmed_at),
		});
	}

	if (transaction.confirmer) {
		paymentData.push({
			label: t("confirmed_by"),
			value: transaction.confirmer.name || "N/A",
		});
	}

	return <InfoSection title={t("payment_info")} data={paymentData} />;
};

// Notes Section Component
const NotesSection = ({ notes, t }: any) => {
	return (
		<div>
			<h4 className='font-semibold text-base mb-3'>{t("notes")}</h4>
			<p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>
				{notes}
			</p>
		</div>
	);
};

// ============= Reusable Components =============

// Generic Info Section Component
const InfoSection = ({
	title,
	data,
}: {
	title: string;
	data: Array<{
		label: string;
		value: string | number;
		capitalize?: boolean;
		highlight?: boolean;
		fullWidth?: boolean;
	}>;
}) => {
	return (
		<div>
			<h4 className='font-semibold text-base mb-3'>{title}</h4>
			<dl className='space-y-2'>
				{data.map((item, index) => (
					<div
						key={index}
						className={`flex ${
							item.fullWidth ? "flex-col gap-1" : "justify-between"
						}`}>
						<dt className='text-sm text-gray-500 dark:text-gray-400'>
							{item.label}:
						</dt>
						<dd
							className={`text-sm font-medium ${
								item.capitalize ? "capitalize" : ""
							} ${item.highlight ? "text-green-600 dark:text-green-400" : ""} ${
								item.fullWidth ? "text-left rtl:text-right" : "text-right"
							}`}>
							{item.value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
};

export default TransactionDetails;
