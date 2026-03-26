"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
	Loader2,
	CircleOff,
	Calendar,
	DollarSign,
	User,
	FileText,
	Home,
	Clock,
	Repeat,
	ShieldAlert,
	StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useContract, useContracts } from "@/hooks/queries/useContractsQuery";
import TerminateContractDialog from "@/components/dailogs/terminate-contract-dialog";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ShowCurrentContractProps {
	contractId: number | string;
	onClose?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
	active:
		"bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-400 dark:border-emerald-800/40",
	draft:
		"bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/25 dark:text-amber-400 dark:border-amber-800/40",
	expired:
		"bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700",
	terminated:
		"bg-red-100 text-red-700 border-red-200 dark:bg-red-900/25 dark:text-red-400 dark:border-red-800/40",
	suspended:
		"bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/25 dark:text-orange-400 dark:border-orange-800/40",
	pending:
		"bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/25 dark:text-blue-400 dark:border-blue-800/40",
};

const formatDate = (dateStr?: string) => {
	if (!dateStr) return "—";
	try {
		return format(new Date(dateStr), "dd MMM yyyy");
	} catch {
		return dateStr;
	}
};

const formatCurrency = (amount?: number) => {
	if (amount === undefined || amount === null) return "—";
	return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(
		amount,
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** A single labelled data cell used throughout the detail view */
const InfoCell = ({
	icon: Icon,
	label,
	value,
	className = "",
}: {
	icon?: React.ElementType;
	label: string;
	value: React.ReactNode;
	className?: string;
}) => (
	<div
		className={`flex flex-col gap-1.5 p-4 rounded-xl bg-neutral-50 dark:bg-slate-800/60 border border-neutral-100 dark:border-slate-700/60 ${className}`}>
		<span className='flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide'>
			{Icon && <Icon className='w-3.5 h-3.5' />}
			{label}
		</span>
		<span className='text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-snug'>
			{value}
		</span>
	</div>
);

/** Thin section header with icon */
const SectionHeader = ({
	icon: Icon,
	label,
}: {
	icon: React.ElementType;
	label: string;
}) => (
	<div className='flex items-center gap-2 mt-1 mb-3'>
		<div className='flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/15 shrink-0'>
			<Icon className='w-3.5 h-3.5 text-primary' />
		</div>
		<h6 className='text-sm font-semibold text-neutral-700 dark:text-neutral-200 tracking-tight'>
			{label}
		</h6>
		<div className='flex-1 h-px bg-neutral-100 dark:bg-slate-700/60' />
	</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const ShowCurrentContract = ({
	contractId,
	onClose,
}: ShowCurrentContractProps) => {
	const t = useTranslations("tenant.contracts.show-current-contract-page");
	const { contract, isLoading } = useContract(contractId);
	const { terminateContract, isTerminating } = useContracts();

	// ── Terminate handler ────────────────────────────────────────────────────

	const handleTerminate = async (termination_reason: string) => {
		await terminateContract({
			id: contractId,
			termination_reason,
		});
		onClose?.();
	};

	// ── Loading state ────────────────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center py-20 gap-3'>
				<Loader2 className='animate-spin h-7 w-7 text-primary' />
				<p className='text-sm text-neutral-400'>{t("loading")}</p>
			</div>
		);
	}

	// ── Empty state ──────────────────────────────────────────────────────────
	if (!contract) {
		return (
			<div className='flex flex-col items-center justify-center py-16 gap-2'>
				<FileText className='w-10 h-10 text-neutral-300 dark:text-neutral-600' />
				<p className='text-sm text-neutral-500 dark:text-neutral-400'>
					{t("no_contract_available")}
				</p>
			</div>
		);
	}

	const canTerminate =
		contract.status === "active" || contract.status !== "pending_termination";

	// ── Render ───────────────────────────────────────────────────────────────
	return (
		<div className='flex flex-col gap-0'>
			{/* ── Hero header ──────────────────────────────────────────────── */}
			<div className='flex items-start justify-between gap-4 px-1 pb-5 border-b border-neutral-100 dark:border-slate-700/60'>
				<div className='space-y-1'>
					<div className='flex items-center gap-2'>
						<h3 className='text-lg font-bold text-neutral-800 dark:text-neutral-100 tracking-tight'>
							{contract.contract_number ?? "—"}
						</h3>
						<Badge
							variant='outline'
							className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${STATUS_STYLES[contract.status] ?? STATUS_STYLES["draft"]}`}>
							{contract.status}
						</Badge>
					</div>
					<p className='text-xs text-neutral-400 dark:text-neutral-500'>
						{t("contract-id-label")}: #{contractId}
					</p>
				</div>

				{canTerminate && (
					<TerminateContractDialog
						contractNumber={contract.contract_number}
						isTerminating={isTerminating}
						onConfirm={handleTerminate}
						trigger={
							<Button
								type='button'
								variant='outline'
								disabled={isTerminating}
								className='h-9 px-4 rounded-xl text-sm font-medium border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 shrink-0'>
								{isTerminating ? (
									<Loader2 className='w-3.5 h-3.5 mr-1.5 animate-spin' />
								) : (
									<CircleOff className='w-3.5 h-3.5 mr-1.5' />
								)}
								{isTerminating
									? t("terminating-button-text")
									: t("terminate-button-text")}
							</Button>
						}
					/>
				)}
			</div>

			{/* ── Scrollable body ───────────────────────────────────────────── */}
			<div className='flex flex-col gap-6 py-5 overflow-y-auto max-h-[calc(80vh-160px)] pr-1'>
				{/* ── Customer ─────────────────────────────────────────────── */}
				{contract.customer && (
					<section>
						<SectionHeader icon={User} label={t("customer-section-title")} />
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
							<InfoCell
								icon={User}
								label={t("customer-name-label")}
								value={`${contract.customer.first_name} ${contract.customer.last_name}`}
								className='lg:col-span-1'
							/>
							<InfoCell
								label={t("customer-email-label")}
								value={
									<span className='break-all'>
										{contract.customer.email ?? "—"}
									</span>
								}
							/>
							<InfoCell
								label={t("customer-phone-label")}
								value={contract.customer.phone ?? "—"}
							/>
						</div>
					</section>
				)}

				{/* ── Contract dates & duration ─────────────────────────────── */}
				<section>
					<SectionHeader
						icon={Calendar}
						label={t("contract-details-section-title")}
					/>
					<div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
						<InfoCell
							icon={Calendar}
							label={t("start-date-label")}
							value={formatDate(contract.start_date)}
						/>
						<InfoCell
							icon={Calendar}
							label={t("end-date-label")}
							value={formatDate(contract.end_date)}
						/>
						<InfoCell
							icon={Clock}
							label={t("duration-label")}
							value={`${contract.duration} ${contract.duration_unit}`}
						/>
						<InfoCell
							icon={Clock}
							label={t("grace-period-label")}
							value={`${contract.grace_period_days ?? 0} ${t("days")}`}
						/>
						<InfoCell
							icon={Repeat}
							label={t("billing-frequency-label")}
							value={contract.billing_frequency ?? "—"}
						/>
					</div>
				</section>

				{/* ── Financial ────────────────────────────────────────────── */}
				<section>
					<SectionHeader
						icon={DollarSign}
						label={t("financial-section-title")}
					/>
					<div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
						<InfoCell
							icon={DollarSign}
							label={t("rent-amount-label")}
							value={formatCurrency(contract.rent_amount)}
						/>
						<InfoCell
							icon={ShieldAlert}
							label={t("security-deposit-label")}
							value={formatCurrency(contract.security_deposit)}
						/>
						{contract.termination_penalty_type && (
							<>
								<InfoCell
									label={t("termination-penalty-type-label")}
									value={contract.termination_penalty_type}
								/>
								<InfoCell
									label={t("termination-penalty-value-label")}
									value={formatCurrency(contract.termination_penalty_value)}
								/>
							</>
						)}
					</div>
				</section>

				{/* ── Units ────────────────────────────────────────────────── */}
				{contract.units && contract.units.length > 0 && (
					<section>
						<SectionHeader icon={Home} label={t("units-section-title")} />
						<div className='flex flex-wrap gap-2'>
							{contract.units.map((unit: any) => (
								<div
									key={unit.id}
									className='flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-slate-600 bg-neutral-50 dark:bg-slate-800/60 text-sm'>
									<Home className='w-3.5 h-3.5 text-neutral-400 shrink-0' />
									<span className='font-semibold text-neutral-700 dark:text-neutral-200'>
										{unit.unit_number}
									</span>
									{unit.unit_price !== undefined && (
										<>
											<Separator orientation='vertical' className='h-4' />
											<span className='text-neutral-500 dark:text-neutral-400 text-xs'>
												{formatCurrency(unit.unit_price)}
											</span>
										</>
									)}
								</div>
							))}
						</div>
					</section>
				)}

				{/* ── Notes ────────────────────────────────────────────────── */}
				{contract.notes && (
					<section>
						<SectionHeader icon={StickyNote} label={t("notes-label")} />
						<div className='p-4 rounded-xl bg-neutral-50 dark:bg-slate-800/60 border border-neutral-100 dark:border-slate-700/60 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap'>
							{contract.notes}
						</div>
					</section>
				)}
			</div>

			{/* ── Footer ───────────────────────────────────────────────────── */}
			<div className='flex justify-end pt-4 border-t border-neutral-100 dark:border-slate-700/60'>
				<DialogClose asChild>
					<Button className='h-10 px-8 rounded-xl text-sm font-medium'>
						{t("close-button-text")}
					</Button>
				</DialogClose>
			</div>
		</div>
	);
};

export default ShowCurrentContract;
