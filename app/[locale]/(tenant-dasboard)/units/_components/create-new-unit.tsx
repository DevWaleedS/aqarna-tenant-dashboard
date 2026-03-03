"use client";
import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUnitSchema, createUnitType } from "@/lib/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useUnits } from "@/hooks/queries/useUnits";

const CreateNewUnit = () => {
	const t = useTranslations("tenant.units.create-new-unit-page");
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const { createUnit, isCreating } = useUnits();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<createUnitType>({
		resolver: zodResolver(createUnitSchema),
		defaultValues: {
			property_id: undefined,
			name: "",
			unit_number: "",
			floor_number: undefined,
			type: undefined,
			area: undefined,
			monthly_rent: undefined,
			description: "",
			rooms_count: undefined,
			bathrooms_count: undefined,
			kitchens_count: undefined,
			balconies_count: undefined,
			view_type: "",
			furnishing_status: undefined,
			orientation: undefined,
			security_deposit: undefined,
			min_lease_term: undefined,
			ac_type: undefined,
			internet_status: undefined,
		},
	});

	const onSubmit = async (data: createUnitType) => {
		try {
			await createUnit(data, {
				onSuccess: () => {
					reset();
					closeButtonRef.current?.click();
				},
			});
		} catch (error) {
			console.error("Error creating unit:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ════ Basic Information ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("basic-info-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Property ID */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("property-id-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						placeholder={t("property-id-placeholder")}
						{...register("property_id", { valueAsNumber: true })}
					/>
					{errors.property_id && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.property_id.message}
						</p>
					)}
				</div>

				{/* Unit Number */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("unit-number-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						className='h-12 px-4 font-mono'
						placeholder={t("unit-number-placeholder")}
						{...register("unit_number")}
					/>
					{errors.unit_number && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.unit_number.message}
						</p>
					)}
				</div>

				{/* Floor Number */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("floor-number-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={0}
						className='h-12 px-4'
						placeholder={t("floor-number-placeholder")}
						{...register("floor_number", { valueAsNumber: true })}
					/>
					{errors.floor_number && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.floor_number.message}
						</p>
					)}
				</div>

				{/* Name */}
				<div className='md:col-span-6 col-span-12'>
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

				{/* Type */}
				<div className='md:col-span-3 col-span-6'>
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
										{(["residential", "commercial", "industrial"] as const).map(
											(v) => (
												<SelectItem key={v} value={v}>
													{t(`type-options.${v}`)}
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

				{/* Area */}
				<div className='md:col-span-3 col-span-6'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("area-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={0}
						step='0.01'
						className='h-12 px-4'
						placeholder={t("area-placeholder")}
						{...register("area", { valueAsNumber: true })}
					/>
					{errors.area && (
						<p className='text-red-500 text-sm mt-1'>{errors.area.message}</p>
					)}
				</div>

				{/* View Type */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("view-type-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={t("view-type-placeholder")}
						{...register("view_type")}
					/>
				</div>

				{/* ════ Rooms & Features ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("rooms-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Room counts - 4 in a row */}
				{(
					[
						{
							name: "rooms_count",
							label: t("rooms-count-label"),
							placeholder: t("rooms-count-placeholder"),
						},
						{
							name: "bathrooms_count",
							label: t("bathrooms-count-label"),
							placeholder: t("bathrooms-count-placeholder"),
						},
						{
							name: "kitchens_count",
							label: t("kitchens-count-label"),
							placeholder: t("kitchens-count-placeholder"),
						},
						{
							name: "balconies_count",
							label: t("balconies-count-label"),
							placeholder: t("balconies-count-placeholder"),
						},
					] as const
				).map(({ name, label, placeholder }) => (
					<div key={name} className='md:col-span-3 col-span-6'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{label}
						</Label>
						<Input
							type='number'
							min={0}
							className='h-12 px-4'
							placeholder={placeholder}
							{...register(name, { valueAsNumber: true })}
						/>
					</div>
				))}

				{/* Furnishing + Orientation */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("furnishing-label")}
					</Label>
					<Controller
						name='furnishing_status'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("furnishing-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(
											[
												"fully_furnished",
												"semi_furnished",
												"unfurnished",
											] as const
										).map((v) => (
											<SelectItem key={v} value={v}>
												{t(`furnishing-options.${v}`)}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("orientation-label")}
					</Label>
					<Controller
						name='orientation'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("orientation-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(
											[
												"north",
												"south",
												"east",
												"west",
												"northeast",
												"northwest",
												"southeast",
												"southwest",
											] as const
										).map((v) => (
											<SelectItem key={v} value={v}>
												{t(`orientation-options.${v}`)}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				{/* AC + Internet */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("ac-type-label")}
					</Label>
					<Controller
						name='ac_type'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("ac-type-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(["split", "central", "window", "none"] as const).map(
											(v) => (
												<SelectItem key={v} value={v}>
													{t(`ac-type-options.${v}`)}
												</SelectItem>
											),
										)}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("internet-label")}
					</Label>
					<Controller
						name='internet_status'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("internet-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(["wifi", "fiber", "none"] as const).map((v) => (
											<SelectItem key={v} value={v}>
												{t(`internet-options.${v}`)}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				{/* ════ Financial Details ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("financial-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("monthly-rent-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={0}
						className='h-12 px-4'
						placeholder={t("monthly-rent-placeholder")}
						{...register("monthly_rent", { valueAsNumber: true })}
					/>
					{errors.monthly_rent && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.monthly_rent.message}
						</p>
					)}
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("security-deposit-label")}
					</Label>
					<Input
						type='number'
						min={0}
						className='h-12 px-4'
						placeholder={t("security-deposit-placeholder")}
						{...register("security_deposit", { valueAsNumber: true })}
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("min-lease-label")}
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						placeholder={t("min-lease-placeholder")}
						{...register("min_lease_term", { valueAsNumber: true })}
					/>
				</div>

				{/* Description */}
				<div className='col-span-12 mt-2'>
					<Separator className='w-auto mb-4' />
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("description-label")}
					</Label>
					<Textarea
						className='h-24 px-4 py-3 resize-none'
						placeholder={t("description-placeholder")}
						{...register("description")}
					/>
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

export default CreateNewUnit;
