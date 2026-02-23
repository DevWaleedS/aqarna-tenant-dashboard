"use client";
import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createMeterSchema, createMeterType } from "@/lib/zod";
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
import { useMeters } from "@/hooks/queries/tenants/useMeters";

const CreateNewMeter = () => {
	const t = useTranslations("tenant.meters.create-new-meter-page");
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const { createMeter, isCreating } = useMeters();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<createMeterType>({
		resolver: zodResolver(createMeterSchema),
		defaultValues: {
			unit_id: undefined,
			type: undefined,
			serial_number: "",
			name: "",
			unit_price: undefined,
		},
	});

	const onSubmit = async (data: createMeterType) => {
		try {
			await createMeter(data, {
				onSuccess: () => {
					reset();
					closeButtonRef.current?.click();
				},
			});
		} catch (error) {
			console.error("Error creating meter:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* Unit ID + Type */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("unit-id-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						placeholder={t("unit-id-placeholder")}
						{...register("unit_id", { valueAsNumber: true })}
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
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='type'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
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
						<span className='text-red-600'>*</span>
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
						<span className='text-red-600'>*</span>
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
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={0}
						step='0.01'
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

export default CreateNewMeter;
