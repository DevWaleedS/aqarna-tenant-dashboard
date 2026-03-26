"use client";

import React, { useState } from "react";
import { CircleOff, Loader2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

interface TerminateContractDialogProps {
	/** The element that opens the dialog (e.g. a <Button>) */
	trigger: React.ReactNode;
	/** Called with the typed reason when the user confirms */
	onConfirm: (reason: string) => Promise<void> | void;
	/** Optional: contract number shown in the dialog subtitle */
	contractNumber?: string;
	isTerminating?: boolean;
}

/**
 * Drop-in replacement for the bare <ConfirmationDialog> used in the contracts
 * table and ShowCurrentContract.  Adds a mandatory "termination reason" field
 * so the value can be forwarded to terminateContractAPI.
 */
const TerminateContractDialog = ({
	trigger,
	onConfirm,
	contractNumber,
	isTerminating = false,
}: TerminateContractDialogProps) => {
	const t = useTranslations("tenant.contracts.terminate-dialog");
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState("");
	const [busy, setBusy] = useState(false);

	const handleConfirm = async () => {
		setBusy(true);
		try {
			await onConfirm(reason.trim());
			setOpen(false);
			setReason("");
		} finally {
			setBusy(false);
		}
	};

	const handleOpenChange = (next: boolean) => {
		if (busy || isTerminating) return;
		if (!next) setReason("");
		setOpen(next);
	};

	const isLoading = busy || isTerminating;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{/* ── Trigger ─────────────────────────────────────────────────── */}
			<div
				onClick={() => !isLoading && setOpen(true)}
				className='inline-flex cursor-pointer'>
				{trigger}
			</div>

			{/* ── Dialog panel ────────────────────────────────────────────── */}
			<DialogContent className='max-w-md p-0 overflow-hidden rounded-2xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl'>
				{/* Red accent bar */}
				<div className='h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600' />

				<div className='px-7 pt-6 pb-7 space-y-5'>
					{/* ── Header ── */}
					<DialogHeader className='space-y-1'>
						{/* Icon + title row */}
						<div className='flex items-center gap-3'>
							<div className='flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 shrink-0'>
								<AlertTriangle className='w-5 h-5 text-red-600 dark:text-red-400' />
							</div>
							<div>
								<DialogTitle className='text-base font-semibold text-neutral-800 dark:text-neutral-100 leading-tight'>
									{t("title")}
								</DialogTitle>
								{contractNumber && (
									<DialogDescription className='text-sm text-neutral-500 dark:text-neutral-400 mt-0.5'>
										{t("subtitle", { contractNumber })}
									</DialogDescription>
								)}
							</div>
						</div>
					</DialogHeader>

					{/* ── Warning banner ── */}
					<div className='flex gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40'>
						<CircleOff className='w-4 h-4 text-red-500 mt-0.5 shrink-0' />
						<p className='text-sm text-red-700 dark:text-red-400 leading-relaxed'>
							{t("warning-message")}
						</p>
					</div>

					{/* ── Reason field ── */}
					<div className='space-y-2'>
						<Label
							htmlFor='termination-reason'
							className='text-sm font-medium text-neutral-700 dark:text-neutral-200'>
							{t("reason-label")}
							<span className='text-red-600'>*</span>
						</Label>
						<Textarea
							id='termination-reason'
							placeholder={t("reason-placeholder")}
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							disabled={isLoading}
							rows={4}
							className='resize-none text-sm rounded-md border-neutral-200 dark:border-slate-700 focus-visible:ring-red-400 focus-visible:border-red-400 bg-neutral-50 dark:bg-slate-800 placeholder:text-neutral-400'
						/>
					</div>

					{/* ── Actions ── */}
					<div className='flex gap-3 pt-1'>
						<Button
							type='button'
							variant='outline'
							disabled={isLoading}
							onClick={() => handleOpenChange(false)}
							className='flex-1 h-11 rounded-xl text-sm font-medium border-neutral-200 dark:border-slate-600  dark:hover:bg-slate-800'>
							{t("cancel-button")}
						</Button>

						<Button
							type='button'
							disabled={isLoading}
							onClick={handleConfirm}
							className='flex-1 h-11 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm'>
							{isLoading ? (
								<>
									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
									{t("confirming-button")}
								</>
							) : (
								<>
									<CircleOff className='w-4 h-4 mr-2' />
									{t("confirm-button")}
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default TerminateContractDialog;
