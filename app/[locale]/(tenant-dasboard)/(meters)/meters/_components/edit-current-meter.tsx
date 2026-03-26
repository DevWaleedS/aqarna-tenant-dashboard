"use client";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateMeterSchema, updateMeterType } from "@/lib/zod";
import { useTranslations } from "next-intl";
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
import { useMeter, useMeters } from "@/hooks/queries/useMeters";
import { useUnits } from "@/hooks/queries/useUnits";

interface EditCurrentMeterProps {
	meterId: number | string;
	onClose?: () => void;
}

const EditCurrentMeter = ({ meterId, onClose }: EditCurrentMeterProps) => {
	const t = useTranslations("tenant.meters.edit-meter-page");
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const { meter, isLoading } = useMeter(meterId);
	const { updateMeter, isUpdating } = useMeters();
	const { units } = useUnits();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<updateMeterType>({
		resolver: zodResolver(updateMeterSchema),
	});

	// ── Pre-fill form when meter data loads ───────────────────────────────────
	useEffect(() => {
		if (!meter) return;
		reset({
			unit_id: meter.unit_id,
			type: meter.type,
			serial_number: meter.serial_number ?? "",
			name: meter.name ?? "",
			unit_price: meter.unit_price,
			status: meter.status,
		});
	}, [meter, reset]);

	const onSubmit = async (data: updateMeterType) => {
		try {
			await updateMeter(
				{ id: meterId, data },
				{
					onSuccess: () => {
						closeButtonRef.current?.click();
						onClose?.();
					},
				},
			);
		} catch (error) {
			console.error("Error updating meter:", error);
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!meter) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("not-found")}
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* Unit ID + Type */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("unit-label")}
					</Label>
					<Controller
						name='unit_id'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value}
								value={field.value?.toString()}
								onValueChange={(value) => field.onChange(Number(value))}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("unit-placeholder")} />
								</SelectTrigger>

								<SelectContent>
									<SelectGroup>
										{units?.map((unit: any) => (
											<SelectItem key={unit.id} value={unit.id.toString()}>
												{unit.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.unit_id && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.unit_id.message}
						</p>
					)}
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("type-label")}
					</Label>
					<Controller
						name='type'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value}
								value={field.value}
								onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("type-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(["electricity", "water", "gas", "internet"] as const).map(
											(type) => (
												<SelectItem key={type} value={type}>
													{t(`type-options.${type}`)}
												</SelectItem>
											),
										)}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.type && (
						<p className='text-red-500 text-sm mt-1'>{errors.type.message}</p>
					)}
				</div>

				{/* Name */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("name-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={t("name-placeholder")}
						{...register("name")}
					/>
					{errors.name && (
						<p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
					)}
				</div>

				{/* Serial Number + Unit Price */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("serial-number-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={t("serial-number-placeholder")}
						{...register("serial_number")}
					/>
					{errors.serial_number && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.serial_number.message}
						</p>
					)}
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("unit-price-label")}
					</Label>
					<Input
						type='number'
						min={0}
						step={1}
						onKeyDown={(e) => {
							if (e.key === "." || e.key === ",") {
								e.preventDefault();
							}
						}}
						className='h-12 px-4'
						placeholder={t("unit-price-placeholder")}
						{...register("unit_price", { valueAsNumber: true })}
					/>
					{errors.unit_price && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.unit_price.message}
						</p>
					)}
				</div>

				{/* Status (only available on update) */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("status-label")}
					</Label>
					<Controller
						name='status'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value}
								value={field.value}
								onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("status-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(["active", "replaced", "broken"] as const).map(
											(status) => (
												<SelectItem key={status} value={status}>
													{t(`status-options.${status}`)}
												</SelectItem>
											),
										)}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.status && (
						<p className='text-red-500 text-sm mt-1'>{errors.status.message}</p>
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
					disabled={isUpdating}
					className='h-12 text-base px-14 py-3 rounded-lg'>
					{isUpdating ? (
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

export default EditCurrentMeter;
