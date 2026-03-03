"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { CircleOff, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import { useContract, useContracts } from "@/hooks/queries/useContractsQuery";

interface ShowCurrentContractProps {
	contractId: number | string;
	onClose?: () => void;
}

const ShowCurrentContract = ({
	contractId,
	onClose,
}: ShowCurrentContractProps) => {
	const t = useTranslations("tenant.contracts.show-current-contract-page");
	const conformMessages = useTranslations("confirmation-dialog");
	const { contract, isLoading } = useContract(contractId);
	const { terminateContract, isTerminating } = useContracts();

	const handleTerminate = async () => {
		await terminateContract({ id: contractId });
		onClose?.();
	};

	// ── Status badge helper ──────────────────────────────────────────────
	const statusBadgeClass = (status: string) => {
		const map: Record<string, string> = {
			active:
				"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
			draft:
				"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
			expired: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
			terminated:
				"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
			suspended:
				"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
			pending:
				"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		};
		return map[status] ?? map["draft"];
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
		return new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 0,
		}).format(amount);
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!contract) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("no_contract_available")}
				</p>
			</div>
		);
	}

	const isActive = contract.status === "active";
	const isDraft = contract.status === "draft";
	const canTerminate = isActive || isDraft;

	return (
		<div>
			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ── Contract Number + Status ── */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("contract-number-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={contract.contract_number ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("status-label")}
					</Label>
					<div className='h-12 px-4 flex items-center'>
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(contract.status)}`}>
							{contract.status}
						</span>
					</div>
				</div>

				{/* ── Customer Info ── */}
				{contract.customer && (
					<>
						<div className='col-span-12'>
							<Separator className='mx-2 w-auto' />
							<h6 className='text-base font-semibold mt-4 mb-2 text-neutral-700 dark:text-neutral-200'>
								{t("customer-section-title")}
							</h6>
						</div>

						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("customer-name-label")}
							</Label>
							<Input
								className='h-12 px-4'
								value={`${contract.customer.first_name} ${contract.customer.last_name}`}
								readOnly
							/>
						</div>

						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("customer-email-label")}
							</Label>
							<Input
								className='h-12 px-4'
								value={contract.customer.email ?? "—"}
								readOnly
							/>
						</div>

						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("customer-phone-label")}
							</Label>
							<Input
								className='h-12 px-4'
								value={contract.customer.phone ?? "—"}
								readOnly
							/>
						</div>
					</>
				)}

				{/* ── Contract Dates & Duration ── */}
				<div className='col-span-12'>
					<Separator className='mx-2 w-auto' />
					<h6 className='text-base font-semibold mt-4 mb-2 text-neutral-700 dark:text-neutral-200'>
						{t("contract-details-section-title")}
					</h6>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("start-date-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={formatDate(contract.start_date)}
						readOnly
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("end-date-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={formatDate(contract.end_date)}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("duration-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={`${contract.duration} ${contract.duration_unit}`}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("grace-period-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={`${contract.grace_period_days ?? 0} ${t("days")}`}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("billing-frequency-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={contract.billing_frequency ?? "—"}
						readOnly
					/>
				</div>

				{/* ── Financial Info ── */}
				<div className='col-span-12'>
					<Separator className='mx-2 w-auto' />
					<h6 className='text-base font-semibold mt-4 mb-2 text-neutral-700 dark:text-neutral-200'>
						{t("financial-section-title")}
					</h6>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("rent-amount-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={formatCurrency(contract.rent_amount)}
						readOnly
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("security-deposit-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={formatCurrency(contract.security_deposit)}
						readOnly
					/>
				</div>

				{contract.termination_penalty_type && (
					<>
						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("termination-penalty-type-label")}
							</Label>
							<Input
								className='h-12 px-4'
								value={contract.termination_penalty_type}
								readOnly
							/>
						</div>
						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("termination-penalty-value-label")}
							</Label>
							<Input
								className='h-12 px-4'
								value={formatCurrency(contract.termination_penalty_value)}
								readOnly
							/>
						</div>
					</>
				)}

				{/* ── Units ── */}
				{contract.units && contract.units.length > 0 && (
					<>
						<div className='col-span-12'>
							<Separator className='mx-2 w-auto' />
							<h6 className='text-base font-semibold mt-4 mb-2 text-neutral-700 dark:text-neutral-200'>
								{t("units-section-title")}
							</h6>
						</div>
						<div className='col-span-12'>
							<div className='flex flex-wrap gap-2'>
								{contract.units.map((unit: any) => (
									<div
										key={unit.id}
										className='px-4 py-2 rounded-lg border border-neutral-200 dark:border-slate-600 bg-neutral-50 dark:bg-slate-800 text-sm'>
										<span className='font-semibold'>{unit.unit_number}</span>
										{unit.unit_price !== undefined && (
											<span className='ml-2 text-neutral-500 dark:text-neutral-400'>
												{formatCurrency(unit.unit_price)}
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					</>
				)}

				{/* ── Notes ── */}
				{contract.notes && (
					<div className='col-span-full'>
						<Separator className='mx-2 w-auto mt-4 mb-4' />
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("notes-label")}
						</Label>
						<Textarea
							value={contract.notes}
							readOnly
							disabled
							className='h-24 px-4 py-2 resize-none'
						/>
					</div>
				)}
			</div>

			<Separator className='mx-2 w-auto my-4' />

			<div className='flex items-center justify-center gap-3'>
				{canTerminate ? (
					<>
						<ConfirmationDialog
							type='danger'
							confirmText={conformMessages("confirm-terminate-button-text")}
							title={conformMessages("title")}
							icon={<CircleOff className='w-5 h-5' />}
							trigger={
								<Button
									type='button'
									variant='outline'
									disabled={isTerminating}
									className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-2.75 rounded-lg'>
									{isTerminating ? (
										<>
											<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
											{t("terminating-button-text")}
										</>
									) : (
										<>
											<CircleOff className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
											{t("terminate-button-text")}
										</>
									)}
								</Button>
							}
							onConfirm={handleTerminate}>
							{conformMessages("terminate-message")}
						</ConfirmationDialog>

						<DialogClose asChild>
							<Button className='h-12 text-base px-14 py-3 rounded-lg'>
								{t("close-button-text")}
							</Button>
						</DialogClose>
					</>
				) : (
					<DialogClose asChild>
						<Button className='h-12 text-base px-14 py-3 rounded-lg'>
							{t("close-button-text")}
						</Button>
					</DialogClose>
				)}
			</div>
		</div>
	);
};

export default ShowCurrentContract;
