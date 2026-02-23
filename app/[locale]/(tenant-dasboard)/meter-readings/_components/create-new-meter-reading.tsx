"use client";
import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createMeterReadingSchema, createMeterReadingType } from "@/lib/zod";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useMeterReadings } from "@/hooks/queries/tenants/useMeterReadings";
import { DatePicker } from "@/components/shared/date-picker";

const CreateNewMeterReading = () => {
	const t = useTranslations(
		"tenant.meter-readings.create-new-meter-reading-page",
	);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const { createReading, isCreating } = useMeterReadings();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<createMeterReadingType>({
		resolver: zodResolver(createMeterReadingSchema),
		defaultValues: {
			meter_id: undefined,
			contract_id: undefined,
			reading_date: "",
			value: undefined,
			image: "",
		},
	});

	const onSubmit = async (data: createMeterReadingType) => {
		// Strip empty image string before sending
		const payload = { ...data, image: data.image || undefined };
		try {
			await createReading(payload, {
				onSuccess: () => {
					reset();
					closeButtonRef.current?.click();
				},
			});
		} catch (error) {
			console.error("Error creating meter reading:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* Meter ID + Contract ID */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("meter-id-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						placeholder={t("meter-id-placeholder")}
						{...register("meter_id", { valueAsNumber: true })}
					/>
					{errors.meter_id && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.meter_id.message}
						</p>
					)}
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("contract-id-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						placeholder={t("contract-id-placeholder")}
						{...register("contract_id", { valueAsNumber: true })}
					/>
					{errors.contract_id && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.contract_id.message}
						</p>
					)}
				</div>

				{/* Reading Date + Value */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("reading-date-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='reading_date'
						control={control}
						render={({ field }) => (
							<DatePicker
								currentDate={field.value ? new Date(field.value) : undefined}
								onChange={(date: Date) => {
									// Store as YYYY-MM-DD string to match API format
									field.onChange(date.toISOString().split("T")[0]);
								}}
							/>
						)}
					/>
					{errors.reading_date && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.reading_date.message}
						</p>
					)}
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("value-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={0}
						step='0.01'
						className='h-12 px-4'
						placeholder={t("value-placeholder")}
						{...register("value", { valueAsNumber: true })}
					/>
					{errors.value && (
						<p className='text-red-500 text-sm mt-1'>{errors.value.message}</p>
					)}
				</div>

				{/* Image URL (optional) */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("image-label")}
					</Label>
					<Input
						type='file'
						className='h-12 px-4'
						placeholder={t("image-placeholder")}
						{...register("image")}
					/>
					{errors.image && (
						<p className='text-red-500 text-sm mt-1'>{errors.image.message}</p>
					)}
				</div>
			</div>

			<Separator className='w-auto my-4' />

			<div className='flex items-center justify-center gap-3'>
				<DialogClose asChild>
					<Button
						type='button'
						className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-2.75 rounded-lg'>
						{t("cancel-button-text")}
					</Button>
				</DialogClose>
				<Button
					type='submit'
					disabled={isCreating}
					className='h-12 text-base px-14 py-3 rounded-lg'>
					{isCreating ? (
						<>
							<Loader2 className='animate-spin h-4.5 w-4.5 mr-2 rtl:mr-0 rtl:ml-2' />
							{t("save-button-loading-text")}
						</>
					) : (
						t("save-button-text")
					)}
				</Button>
			</div>
		</form>
	);
};

export default CreateNewMeterReading;
