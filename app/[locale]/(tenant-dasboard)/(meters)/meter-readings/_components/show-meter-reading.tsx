"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import {
	useMeterReading,
	useMeterReadings,
} from "@/hooks/queries/useMeterReadings";

interface ShowMeterReadingProps {
	readingId: number | string;
	onClose?: () => void;
}

const ShowMeterReading = ({ readingId, onClose }: ShowMeterReadingProps) => {
	const t = useTranslations("tenant.meter-readings.show-meter-reading-page");
	const conformMessages = useTranslations("confirmation-dialog");

	const { reading, isLoading } = useMeterReading(readingId);
	const { generateInvoice, isGeneratingInvoice } = useMeterReadings();

	const handleGenerateInvoice = async () => {
		await generateInvoice(readingId);
		onClose?.();
	};

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "dd MMM yyyy");
		} catch {
			return dateStr;
		}
	};

	const formatNumber = (val?: number) => {
		if (val === undefined || val === null) return "—";
		return new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(val);
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!reading) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("not-found")}
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ════ Reading Information ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("reading-info-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Meter ID + Contract ID */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("meter-id-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={reading.meter_id ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("contract-id-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={reading.contract_id ?? "—"}
						readOnly
					/>
				</div>

				{/* Reading Date + Status */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("reading-date-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={formatDate(reading.reading_date)}
						readOnly
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("status-label")}
					</Label>
					<div className='h-12 px-4 flex items-center'>
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${
								reading.is_processed
									? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
									: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
							}`}>
							{reading.is_processed ? "Processed" : "Pending"}
						</span>
					</div>
				</div>

				{/* Values row */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("value-label")}
					</Label>
					<Input
						className='h-12 px-4 font-mono'
						value={formatNumber(reading.value)}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("previous-value-label")}
					</Label>
					<Input
						className='h-12 px-4 font-mono'
						value={formatNumber(reading.previous_value)}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("consumption-label")}
					</Label>
					<Input
						className='h-12 px-4 font-mono'
						value={formatNumber(reading.consumption)}
						readOnly
					/>
				</div>

				{/* Cost + Created At */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("cost-label")}
					</Label>
					<Input
						className='h-12 px-4 font-semibold'
						value={formatNumber(reading.cost)}
						readOnly
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("created-at-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={formatDate(reading.created_at)}
						readOnly
					/>
				</div>
			</div>

			<Separator className='w-auto my-4' />

			<div className='flex items-center justify-center gap-3 flex-wrap'>
				{/* Generate Invoice — only if not yet processed */}
				{!reading.is_processed && (
					<ConfirmationDialog
						type='info'
						confirmText={conformMessages("confirm-generate-button-text")}
						title={conformMessages("title")}
						icon={<FileText className='w-5 h-5' />}
						trigger={
							<Button
								type='button'
								disabled={isGeneratingInvoice}
								className='h-12 text-base px-8 rounded-lg gap-2'>
								{isGeneratingInvoice ? (
									<>
										<Loader2 className='animate-spin h-4.5 w-4.5' />
										{t("generating-invoice-button")}
									</>
								) : (
									<>
										<FileText className='w-4 h-4' />
										{t("generate-invoice-button")}
									</>
								)}
							</Button>
						}
						onConfirm={handleGenerateInvoice}>
						{conformMessages("message")}
					</ConfirmationDialog>
				)}

				{/* Already processed — show invoice ID if available */}
				{reading.is_processed && reading.transaction_id && (
					<div className='flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 text-sm font-medium'>
						<FileText className='w-4 h-4' />
						{t("invoice-generated-label")}
						{reading.transaction_id}
					</div>
				)}

				<DialogClose asChild>
					<Button className='h-12 text-base px-14 py-3 rounded-lg'>
						{t("close-button-text")}
					</Button>
				</DialogClose>
			</div>
		</div>
	);
};

export default ShowMeterReading;
