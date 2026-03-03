"use client";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createContractSchema, createContractType } from "@/lib/zod";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useContracts } from "@/hooks/queries/useContractsQuery";

import { DatePicker } from "@/components/shared/date-picker";
import { format } from "date-fns";
import MultiSelect, {
	MultiSelectOption,
} from "@/components/shared/multi-select";
import { Building2, Loader2 } from "lucide-react";

const MOCK_CUSTOMERS = [
	{ id: 105, first_name: "Ahmed", last_name: "Mohammed" },
	{ id: 106, first_name: "Sara", last_name: "Ali" },
];
const MOCK_UNITS = [
	{ id: 501, unit_number: "A-101", unit_price: 125000 },
	{ id: 502, unit_number: "B-202", unit_price: 98000 },
];

const CreateNewContract = () => {
	const t = useTranslations("tenant.contracts.create-new-contract-page");
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const { createContract, isCreating } = useContracts();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
	} = useForm<createContractType>({
		resolver: zodResolver(createContractSchema),
		defaultValues: {
			grace_period_days: 0,
			status: "draft",
			units: [],
		},
	});

	const selectedBillingFrequency = watch("billing_frequency");
	const selectedPenaltyType = watch("termination_penalty_type");

	const unitOptions: MultiSelectOption[] = MOCK_UNITS.map((u) => ({
		value: u.id, // → stored in form, sent to API
		label: u.unit_number, // → shown in pill + dropdown row
		badge: new Intl.NumberFormat("en-US", {
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(u.unit_price), // → "125K" badge on the right
		description: `Price: ${new Intl.NumberFormat("en-US").format(u.unit_price)}`,
		icon: <Building2 className='w-3.5 h-3.5' />,
	}));

	const onSubmit = async (data: createContractType) => {
		try {
			const payload = {
				...data,
				units: data.units,
				customer_id: Number(data.customer_id),
				security_deposit: Number(data.security_deposit),
				duration: Number(data.duration),
				grace_period_days: Number(data.grace_period_days ?? 0),
				custom_billing_months:
					data.billing_frequency === "custom" && data.custom_billing_months
						? Number(data.custom_billing_months)
						: undefined,
				termination_penalty_value: data.termination_penalty_type
					? Number(data.termination_penalty_value)
					: undefined,
			};

			await createContract(payload, {
				onSuccess: () => {
					reset();
					closeButtonRef.current?.click();
				},
			});
		} catch (error) {
			console.error("Error creating contract:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ── Row 1: Customer + Status ── */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("customer-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='customer_id'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("customer-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{MOCK_CUSTOMERS.map((c) => (
											<SelectItem key={c.id} value={String(c.id)}>
												{c.first_name} {c.last_name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.customer_id && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.customer_id.message}
						</p>
					)}
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("status-label")}
					</Label>
					<Controller
						name='status'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("status-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{[
											"draft",
											"active",
											"expired",
											"terminated",
											"suspended",
											"pending",
										].map((s) => (
											<SelectItem key={s} value={s}>
												{t(`status-options.${s}`)}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.status && (
						<p className='text-red-500 text-sm mt-1'>{errors.status.message}</p>
					)}
				</div>

				{/* ── Row 2: Start Date + Grace Period ── */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("start-date-label")}
						<span className='text-red-600'>*</span>
					</Label>
					{/*
					 * ✅ DatePicker is controlled via Controller.
					 * The form stores start_date as a "yyyy-MM-dd" string (what the API expects).
					 * DatePicker receives a Date object for display, and calls onChange with a Date,
					 * which we format back to a string for the form value.
					 */}
					<Controller
						name='start_date'
						control={control}
						render={({ field }) => (
							<DatePicker
								currentDate={field.value ? new Date(field.value) : undefined}
								onChange={(date: Date) =>
									field.onChange(format(date, "yyyy-MM-dd"))
								}
							/>
						)}
					/>
					{errors.start_date && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.start_date.message}
						</p>
					)}
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("grace-period-label")}
					</Label>
					<Input
						type='number'
						min={0}
						className='h-12 px-4'
						placeholder={t("grace-period-placeholder")}
						{...register("grace_period_days", { valueAsNumber: true })}
					/>
					{errors.grace_period_days && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.grace_period_days.message}
						</p>
					)}
				</div>

				{/* ── Row 3: Duration + Duration Unit ── */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("duration-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						placeholder={t("duration-placeholder")}
						{...register("duration", { valueAsNumber: true })}
					/>
					{errors.duration && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.duration.message}
						</p>
					)}
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("duration-unit-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='duration_unit'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("duration-unit-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='month'>
											{t("duration-units.month")}
										</SelectItem>
										<SelectItem value='year'>
											{t("duration-units.year")}
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.duration_unit && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.duration_unit.message}
						</p>
					)}
				</div>

				{/* ── Row 4: Billing Frequency + Custom Billing Months ── */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("billing-frequency-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='billing_frequency'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue
										placeholder={t("billing-frequency-placeholder")}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{[
											"monthly",
											"quarterly",
											"semi_annual",
											"annual",
											"custom",
										].map((f) => (
											<SelectItem key={f} value={f}>
												{t(`billing-frequency-options.${f}`)}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.billing_frequency && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.billing_frequency.message}
						</p>
					)}
				</div>

				{selectedBillingFrequency === "custom" && (
					<div className='md:col-span-6 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("custom-billing-months-label")}
							<span className='text-red-600'>*</span>
						</Label>
						<Input
							type='number'
							min={1}
							className='h-12 px-4'
							placeholder={t("custom-billing-months-placeholder")}
							{...register("custom_billing_months", { valueAsNumber: true })}
						/>
						{errors.custom_billing_months && (
							<p className='text-red-500 text-sm mt-1'>
								{errors.custom_billing_months.message}
							</p>
						)}
					</div>
				)}

				{/* ── Row 5: Security Deposit ── */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("security-deposit-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='number'
						min={0}
						className='h-12 px-4'
						placeholder={t("security-deposit-placeholder")}
						{...register("security_deposit", { valueAsNumber: true })}
					/>
					{errors.security_deposit && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.security_deposit.message}
						</p>
					)}
				</div>

				{/* ── Row 6: Termination Penalty ── */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("termination-penalty-type-label")}
					</Label>
					<Controller
						name='termination_penalty_type'
						control={control}
						render={({ field }) => (
							// "none" sentinel — Radix Select forbids empty string values
							<Select
								value={field.value ?? "none"}
								onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue
										placeholder={t("termination-penalty-type-placeholder")}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='none'>
											{t("termination-penalty-type-none")}
										</SelectItem>
										<SelectItem value='fixed_amount'>
											{t("termination-penalty-options.fixed_amount")}
										</SelectItem>
										<SelectItem value='months_rent'>
											{t("termination-penalty-options.months_rent")}
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				{selectedPenaltyType && (
					<div className='md:col-span-6 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("termination-penalty-value-label")}
							<span className='text-red-600'>*</span>
						</Label>
						<Input
							type='number'
							min={0}
							className='h-12 px-4'
							placeholder={t("termination-penalty-value-placeholder")}
							{...register("termination_penalty_value", {
								valueAsNumber: true,
							})}
						/>
						{errors.termination_penalty_value && (
							<p className='text-red-500 text-sm mt-1'>
								{errors.termination_penalty_value.message}
							</p>
						)}
					</div>
				)}

				{/* ── Row 7: Units Multi-Select ── */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("units-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='units'
						control={control}
						render={({ field }) => (
							<MultiSelect
								value={field.value ?? []}
								onChange={field.onChange}
								options={unitOptions}
								isLoading={false}
								placeholder={t("units-placeholder")}
								searchPlaceholder='Search units...'
								error={errors.units?.message as string | undefined}
							/>
						)}
					/>
					{errors.units && (
						<p className='text-red-500 text-sm mt-1'>{errors.units.message}</p>
					)}
				</div>

				{/* ── Notes ── */}
				<div className='col-span-full'>
					<Separator className='mx-2 w-auto mb-4' />
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("notes-label")}
					</Label>
					<Textarea
						className='h-24 px-4 py-2 resize-none'
						placeholder={t("notes-placeholder")}
						{...register("notes")}
					/>
					{errors.notes && (
						<p className='text-red-500 text-sm mt-1'>{errors.notes.message}</p>
					)}
				</div>
			</div>

			<Separator className='mx-2 w-auto my-4' />

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

export default CreateNewContract;
