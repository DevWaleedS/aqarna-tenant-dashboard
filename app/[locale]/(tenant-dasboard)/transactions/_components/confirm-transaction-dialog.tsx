"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { confirmTransactionSchema, confirmTransactionType } from "@/lib/zod";
import { useTransactions } from "@/hooks/queries/tenants/useTransactions";

interface ConfirmTransactionDialogProps {
	transactionId: number | string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirmed?: () => void;
}

const ConfirmTransactionDialog = ({
	transactionId,
	open,
	onOpenChange,
	onConfirmed,
}: ConfirmTransactionDialogProps) => {
	const t = useTranslations("tenant.transactions.confirm-dialog");
	const { confirmTransaction, isConfirming } = useTransactions();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<confirmTransactionType>({
		resolver: zodResolver(confirmTransactionSchema),
		defaultValues: { notes: "" },
	});

	const handleClose = (open: boolean) => {
		if (!open) reset();
		onOpenChange(open);
	};

	const onSubmit = async (data: confirmTransactionType) => {
		await confirmTransaction(
			{ id: transactionId, notes: data.notes },
			{
				onSuccess: () => {
					reset();
					onOpenChange(false);
					onConfirmed?.();
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<div className='w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
							<ShieldCheck className='w-4 h-4 text-green-600 dark:text-green-400' />
						</div>
						{t("title")}
					</DialogTitle>
					<DialogDescription>{t("description")}</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-1'>
					<div>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("notes-label")}
							<span className='text-red-600'>*</span>
						</Label>
						<Textarea
							rows={4}
							placeholder={t("notes-placeholder")}
							className='resize-none px-4 py-3'
							{...register("notes")}
						/>
						{errors.notes && (
							<p className='text-red-500 text-xs mt-1.5'>
								{errors.notes.message}
							</p>
						)}
					</div>

					<div className='flex gap-3 pt-1'>
						<DialogClose asChild>
							<Button
								type='button'
								variant='outline'
								className='flex-1 h-11 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'>
								{t("cancel-button-text")}
							</Button>
						</DialogClose>
						<Button
							type='submit'
							disabled={isConfirming}
							className='flex-1 h-11 gap-2 bg-green-600 hover:bg-green-700 text-white'>
							{isConfirming ? (
								<>
									<Loader2 className='animate-spin w-4 h-4' />
									{t("confirm-loading-text")}
								</>
							) : (
								<>
									<CheckCircle2 className='w-4 h-4' />
									{t("confirm-button-text")}
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmTransactionDialog;
