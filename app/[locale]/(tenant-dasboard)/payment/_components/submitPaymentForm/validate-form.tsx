"use client";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useLocale, useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { submitPaymentFormSchema, submitPaymentFormType } from "@/lib/zod";

import DefaultCardComponent from "../../../../../../components/default-card-component";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { usePayment, usePaymentInfo } from "@/hooks/queries/usePayment";

interface SubmitPaymentFormProps {
	token: string;
}

const SubmitPaymentForm = ({ token }: SubmitPaymentFormProps) => {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations("payment.submit-payment");
	const payment_info = useTranslations("transactions.transaction_details");
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const { submitPayment, isSubmitting } = usePayment();

	const { paymentInfo, isLoading: isTransactionLoading } =
		usePaymentInfo(token);

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
	} = useForm<submitPaymentFormType>({
		resolver: zodResolver(submitPaymentFormSchema),
		defaultValues: {
			payment_method: "cash",
		},
	});

	// Watch payment method to show/hide conditional fields
	const paymentMethod = watch("payment_method");

	const onSubmit = async (data: submitPaymentFormType) => {
		if (!token) return;

		try {
			const paymentData: any = {
				payment_method: data.payment_method,
			};

			if (data.payment_method === "cheque") {
				paymentData.cheque_number = data.cheque_number;
				paymentData.cheque_image = data.cheque_image;
			}

			if (data.payment_method === "bank_transfer") {
				paymentData.transfer_reference = data.transfer_reference;
				paymentData.transfer_receipt = data.transfer_receipt;
			}

			await submitPayment(
				{ token, data: paymentData },
				{
					onSuccess: () => {
						reset();
						// Wait for toast to be visible before closing dialog
						setTimeout(() => {
							closeButtonRef.current?.click();
							router.back();
						}, 2300);
					},
					onError: (error) => {
						console.error("Payment submission failed:", error);
						// Show error toast/modal to user
					},
				},
			);
		} catch (error) {
			console.error("Error submitting payment:", error);
		}
	};

	if (!token) {
		return (
			<div className=''>
				<DefaultCardComponent title={t("title")}>
					<div className='text-center py-12'>
						<p className='text-neutral-600 dark:text-neutral-400 mb-2'>
							{t("no-token-message")}
						</p>
						<p className='text-sm text-neutral-500 dark:text-neutral-500'>
							{t("no-token-help-text")}
						</p>
					</div>
				</DefaultCardComponent>
			</div>
		);
	}

	if (isTransactionLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='flex flex-col items-center gap-3'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
					<p className='text-sm text-neutral-600 dark:text-neutral-400'>
						{t("loading-payment")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			{/* Transaction info box */}
			{paymentInfo ? (
				<DefaultCardComponent
					className='bg-primary/10!'
					title={t("transaction-info")}>
					<div className='space-y-4 max-h-[70vh] overflow-y-auto px-1'>
						<HeaderSection transaction={paymentInfo} t={payment_info} />

						<Separator />

						<PaymentInfoSection
							transaction={paymentInfo}
							t={payment_info}
							locale={locale}
						/>
					</div>
				</DefaultCardComponent>
			) : null}

			<div className='grid grid-cols-12 gap-5 pb-6 pt-5'>
				{/* Payment Method */}
				<div className='col-span-12'>
					<Label
						htmlFor='payment_method'
						className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("payment_method.label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='payment_method'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("payment_method.placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='cash'>
											{t("payment_method.cash")}
										</SelectItem>
										<SelectItem value='cheque'>
											{t("payment_method.cheque")}
										</SelectItem>
										<SelectItem value='bank_transfer'>
											{t("payment_method.bank_transfer")}
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.payment_method && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.payment_method.message}
						</p>
					)}
				</div>

				{/* Cheque Number - Only show if payment method is cheque */}
				{paymentMethod === "cheque" && (
					<>
						<div className='col-span-12'>
							<Label
								htmlFor='cheque_number'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("cheque_number-label")}
								<span className='text-red-600'>*</span>
							</Label>
							<Input
								id='cheque_number'
								className='h-12 px-4'
								placeholder={t("cheque_number-input-placeholder")}
								{...register("cheque_number")}
							/>
							{errors.cheque_number && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.cheque_number.message}
								</p>
							)}
						</div>

						{/* Cheque Image */}
						<div className='col-span-12'>
							<Label
								htmlFor='cheque_image'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("cheque_image-label")}
								<span className='text-red-600'>*</span>
							</Label>
							<Input
								id='cheque_image'
								type='file'
								accept='image/*'
								className='h-12 px-4'
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										register("cheque_image").onChange({
											target: { value: file, name: "cheque_image" },
										});
									}
								}}
							/>
							{errors.cheque_image && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.cheque_image.message}
								</p>
							)}
							<p className='text-sm text-neutral-500 mt-1'>
								{t("cheque_image-help-text")}
							</p>
						</div>
					</>
				)}

				{/* Bank Transfer Reference - Only show if payment method is bank_transfer */}
				{paymentMethod === "bank_transfer" && (
					<>
						<div className='col-span-12'>
							<Label
								htmlFor='transfer_reference'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("transfer_reference-label")}
								<span className='text-red-600'>*</span>
							</Label>
							<Input
								id='transfer_reference'
								className='h-12 px-4'
								placeholder={t("transfer_reference-input-placeholder")}
								{...register("transfer_reference")}
							/>
							{errors.transfer_reference && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.transfer_reference.message}
								</p>
							)}
						</div>

						{/* Transfer Receipt */}
						<div className='col-span-12'>
							<Label
								htmlFor='transfer_receipt'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("transfer_receipt-label")}
								<span className='text-red-600'>*</span>
							</Label>

							<Input
								id='transfer_receipt'
								type='file'
								accept='image/*'
								className='h-12 px-4'
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										register("transfer_receipt").onChange({
											target: { value: file, name: "transfer_receipt" },
										});
									}
								}}
							/>
							{errors.transfer_receipt && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.transfer_receipt.message}
								</p>
							)}
							<p className='text-sm text-neutral-500 mt-1'>
								{t("transfer_receipt-help-text")}
							</p>
						</div>
					</>
				)}
			</div>

			<Separator className='mx-2 w-auto my-4' />

			<div className='flex items-center justify-center gap-3'>
				<DialogClose asChild>
					<Button
						type='button'
						onClick={() => router.back()}
						disabled={isSubmitting}
						className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-2.75 rounded-lg'>
						{t("cancel-button-text")}
					</Button>
				</DialogClose>

				<Button
					type='submit'
					disabled={isSubmitting}
					className='h-12 text-base px-14 py-3 rounded-lg'>
					{isSubmitting ? (
						<>
							<Loader2 className='animate-spin h-4.5 w-4.5 mr-2 rtl:mr-0 rtl:ml-2' />
							{t("submitting-loader-text")}
						</>
					) : (
						t("submit-button-text")
					)}
				</Button>
			</div>
		</form>
	);
};

export default SubmitPaymentForm;

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
