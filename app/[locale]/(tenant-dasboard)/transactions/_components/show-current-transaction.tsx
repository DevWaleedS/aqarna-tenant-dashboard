"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import {
	BadgeCheck,
	CalendarClock,
	CheckCircle2,
	CreditCard,
	ExternalLink,
	FileText,
	Image,
	Loader2,
	Receipt,
	User,
	XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { useTransaction } from "@/hooks/queries/useTransactions";
import { cn } from "@/lib/utils";
import ConfirmTransactionDialog from "./confirm-transaction-dialog";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
	string,
	{ bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
	paid: {
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-700 dark:text-green-400",
		dot: "bg-green-500",
		icon: <BadgeCheck className='w-4 h-4' />,
	},
	pending: {
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-700 dark:text-yellow-400",
		dot: "bg-yellow-400",
		icon: <CalendarClock className='w-4 h-4' />,
	},
	failed: {
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-700 dark:text-red-400",
		dot: "bg-red-500",
		icon: <XCircle className='w-4 h-4' />,
	},
	refunded: {
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-700 dark:text-blue-400",
		dot: "bg-blue-500",
		icon: <Receipt className='w-4 h-4' />,
	},
	cancelled: {
		bg: "bg-neutral-100 dark:bg-slate-700",
		text: "text-neutral-500 dark:text-neutral-400",
		dot: "bg-neutral-400",
		icon: <XCircle className='w-4 h-4' />,
	},
};

const getStatus = (key: string) =>
	STATUS_CONFIG[key] ?? STATUS_CONFIG["pending"];

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({
	icon,
	label,
	value,
	mono = false,
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	mono?: boolean;
}) => (
	<div className='flex items-start gap-3'>
		<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5'>
			{icon}
		</div>
		<div className='min-w-0 flex-1'>
			<p className='text-[11px] text-neutral-400 dark:text-neutral-500 mb-0.5 uppercase tracking-wide font-medium'>
				{label}
			</p>
			<p
				className={cn(
					"text-sm font-semibold text-neutral-800 dark:text-neutral-100 break-words",
					mono && "font-mono",
				)}>
				{value ?? "—"}
			</p>
		</div>
	</div>
);

// ── Attachment button ─────────────────────────────────────────────────────────
const AttachmentBtn = ({
	href,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
}) => (
	<a
		href={href}
		target='_blank'
		rel='noopener noreferrer'
		className='flex items-center gap-2.5 px-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary hover:bg-primary/5 transition-all group'>
		<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors'>
			{icon}
		</div>
		<span className='text-sm font-semibold text-neutral-700 dark:text-neutral-200 flex-1'>
			{label}
		</span>
		<ExternalLink className='w-3.5 h-3.5 text-neutral-400 group-hover:text-primary transition-colors' />
	</a>
);

// ── Main component ────────────────────────────────────────────────────────────
interface ShowCurrentTransactionProps {
	transactionId: number | string;
}

const ShowCurrentTransaction = ({
	transactionId,
}: ShowCurrentTransactionProps) => {
	const t = useTranslations("tenant.transactions.show-page");
	const { transaction, isLoading } = useTransaction(transactionId);
	const [confirmOpen, setConfirmOpen] = useState(false);

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8 text-primary' />
			</div>
		);
	}

	if (!transaction) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("not-found")}
				</p>
			</div>
		);
	}

	const statusCfg = getStatus(transaction.status);
	const hasAttachments =
		transaction.cheque_image ||
		transaction.transfer_receipt ||
		transaction.invoice;

	return (
		<div>
			{/* ── Amount hero ───────────────────────────────────────────────── */}
			<div className='relative flex flex-col items-center pt-6 pb-7 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent dark:from-primary/15 dark:via-primary/5 rounded-xl mb-5'>
				{/* Status badge */}
				<span
					className={cn(
						"absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
						statusCfg.bg,
						statusCfg.text,
					)}>
					<span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot)} />
					{transaction.status_label}
				</span>

				{/* Amount */}
				<div className='w-16 h-16 rounded-2xl bg-primary/15 ring-4 ring-white dark:ring-slate-800 shadow-lg flex items-center justify-center mb-3'>
					<CreditCard className='w-7 h-7 text-primary' />
				</div>
				<p className='text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums'>
					{transaction.formatted_price}
				</p>
				<p className='text-xs text-neutral-400 dark:text-neutral-500 mt-1 font-mono'>
					TXN #{transaction.id}
				</p>

				{/* Confirm button — only for pending */}
				{transaction.status === "pending" && (
					<Button
						onClick={() => setConfirmOpen(true)}
						className='mt-4 h-9 px-5 gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold'>
						<CheckCircle2 className='w-3.5 h-3.5' />
						{t("confirm-button-text")}
					</Button>
				)}
			</div>

			<div className='space-y-5 px-1 pb-4'>
				{/* ── Payment info ─────────────────────────────────────────── */}
				<div>
					<p className='text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3'>
						{t("payment-section")}
					</p>
					<div className='grid sm:grid-cols-2 gap-4'>
						<InfoRow
							icon={<CreditCard className='w-4 h-4' />}
							label={t("gateway-label")}
							value={transaction.payment_gateway}
						/>
						<InfoRow
							icon={<CreditCard className='w-4 h-4' />}
							label={t("method-label")}
							value={transaction.payment_method_label}
						/>
						<InfoRow
							icon={<CalendarClock className='w-4 h-4' />}
							label={t("paid-at-label")}
							value={
								transaction.paid_at
									? format(new Date(transaction.paid_at), "dd MMM yyyy, HH:mm")
									: null
							}
						/>
						<InfoRow
							icon={<CalendarClock className='w-4 h-4' />}
							label={t("created-label")}
							value={
								transaction.created_at
									? format(
											parseISO(transaction.created_at),
											"dd MMM yyyy, HH:mm",
										)
									: null
							}
						/>
					</div>
				</div>

				{/* Details + Notes */}
				{(transaction.details || transaction.notes) && (
					<>
						<Separator />
						<div className='space-y-3'>
							{transaction.details && (
								<InfoRow
									icon={<FileText className='w-4 h-4' />}
									label={t("details-label")}
									value={transaction.details}
								/>
							)}
							{transaction.notes && (
								<InfoRow
									icon={<FileText className='w-4 h-4' />}
									label={t("notes-label")}
									value={transaction.notes}
								/>
							)}
						</div>
					</>
				)}

				{/* ── Confirmation info ─────────────────────────────────────── */}
				{transaction.confirmer && (
					<>
						<Separator />
						<div>
							<p className='text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3'>
								{t("confirmation-section")}
							</p>
							<div className='grid sm:grid-cols-2 gap-4'>
								<InfoRow
									icon={<User className='w-4 h-4' />}
									label={t("confirmed-by-label")}
									value={
										<span className='flex items-center gap-1.5'>
											{transaction.confirmer.name}
											<span className='text-xs text-neutral-400 font-normal'>
												({transaction.confirmer.email})
											</span>
										</span>
									}
								/>
								<InfoRow
									icon={<BadgeCheck className='w-4 h-4' />}
									label={t("confirmed-at-label")}
									value={
										transaction.confirmed_at
											? format(
													new Date(transaction.confirmed_at),
													"dd MMM yyyy, HH:mm",
												)
											: null
									}
								/>
							</div>
						</div>
					</>
				)}

				{/* ── Attachments ───────────────────────────────────────────── */}
				{hasAttachments && (
					<>
						<Separator />
						<div>
							<p className='text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3'>
								{t("attachments-section")}
							</p>
							<div className='grid sm:grid-cols-3 gap-2'>
								{transaction.cheque_image && (
									<AttachmentBtn
										href={transaction.cheque_image}
										icon={<Image className='w-4 h-4' />}
										label={t("cheque-image-label")}
									/>
								)}
								{transaction.transfer_receipt && (
									<AttachmentBtn
										href={transaction.transfer_receipt}
										icon={<Receipt className='w-4 h-4' />}
										label={t("transfer-receipt-label")}
									/>
								)}
								{transaction.invoice && (
									<AttachmentBtn
										href={transaction.invoice}
										icon={<FileText className='w-4 h-4' />}
										label={t("invoice-label")}
									/>
								)}
							</div>
						</div>
					</>
				)}
			</div>

			<Separator className='my-4' />

			<div className='flex justify-center'>
				<DialogClose asChild>
					<Button className='h-12 text-base px-14 rounded-lg'>
						{t("close-button-text")}
					</Button>
				</DialogClose>
			</div>

			{/* Confirm dialog */}
			<ConfirmTransactionDialog
				transactionId={transactionId}
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
			/>
		</div>
	);
};

export default ShowCurrentTransaction;
