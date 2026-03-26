"use client";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateUnitSchema, updateUnitType } from "@/lib/zod";
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
import { useUnit, useUnits } from "@/hooks/queries/useUnits";
import { usePropertiesLookup } from "@/hooks/queries/usePropertiesQuery";

interface EditCurrentUnitProps {
	unitId: number | string;
	onClose?: () => void;
}

const EditCurrentUnit = ({ unitId, onClose }: EditCurrentUnitProps) => {
	const tCreate = useTranslations("tenant.units.create-new-unit-page");
	const tEdit = useTranslations("tenant.units.edit-current-unit-page");
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const { unit, isLoading } = useUnit(unitId);
	const { updateUnit, isUpdating } = useUnits();
	const { propertiesLookup } = usePropertiesLookup();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<updateUnitType>({
		resolver: zodResolver(updateUnitSchema),
	});

	// Pre-fill form when unit loads
	useEffect(() => {
		if (!unit) return;
		reset({
			property_id: unit.property_id,
			name: unit.name ?? "",
			unit_number: unit.unit_number ?? "",
			floor_number: unit.floor_number,
			type: unit.type,
			status: unit.status,
			area: unit.area,
			monthly_rent: unit.monthly_rent,
			description: unit.description ?? "",
			rooms_count: unit.rooms_count,
			bathrooms_count: unit.bathrooms_count,
			kitchens_count: unit.kitchens_count,
			balconies_count: unit.balconies_count,
			view_type: unit.view_type ?? "",
			furnishing_status: unit.furnishing_status,
			orientation: unit.orientation,
			security_deposit: unit.security_deposit,
			min_lease_term: unit.min_lease_term,
			ac_type: unit.ac_type,
			internet_status: unit.internet_status,
		});
	}, [unit, reset]);

	const onSubmit = async (data: updateUnitType) => {
		try {
			await updateUnit(
				{ id: unitId, data },
				{
					onSuccess: () => {
						closeButtonRef.current?.click();
						onClose?.();
					},
				},
			);
		} catch (error) {
			console.error("Error updating unit:", error);
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!unit) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{tEdit("not-found")}
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ════ Basic Information ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{tCreate("basic-info-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Property ID */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("property-id-label")}
					</Label>
					<Controller
						name='property_id'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value?.toString()}
								value={field.value?.toString()}
								onValueChange={(value) => field.onChange(Number(value))}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue
										placeholder={tCreate("property-id-placeholder")}
									/>
								</SelectTrigger>

								<SelectContent>
									<SelectGroup>
										{propertiesLookup?.map((p: any) => (
											<SelectItem key={p.id} value={p.id.toString()}>
												{p.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				{/* Unit Number */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("unit-number-label")}
					</Label>
					<Input
						className='h-12 px-4 font-mono'
						placeholder={tCreate("unit-number-placeholder")}
						{...register("unit_number")}
					/>
				</div>

				{/* Floor Number */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("floor-number-label")}
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
						placeholder={tCreate("floor-number-placeholder")}
						{...register("floor_number", { valueAsNumber: true })}
					/>
				</div>

				{/* Name */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("name-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={tCreate("name-placeholder")}
						{...register("name")}
					/>
					{errors.name && (
						<p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
					)}
				</div>

				{/* Type */}
				<div className='md:col-span-3 col-span-6'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("type-label")}
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
									<SelectValue placeholder={tCreate("type-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(["residential", "commercial", "industrial"] as const).map(
											(v) => (
												<SelectItem key={v} value={v}>
													{tCreate(`type-options.${v}`)}
												</SelectItem>
											),
										)}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				{/* Status — only on edit */}
				<div className='md:col-span-3 col-span-6'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tEdit("status-label")}
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
									<SelectValue placeholder={tEdit("status-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(
											["vacant", "occupied", "maintenance", "reserved"] as const
										).map((v) => (
											<SelectItem key={v} value={v}>
												{tEdit(`status-options.${v}`)}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				{/* Area + View */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("area-label")}
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
						placeholder={tCreate("area-placeholder")}
						{...register("area", { valueAsNumber: true })}
					/>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("view-type-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={tCreate("view-type-placeholder")}
						{...register("view_type")}
					/>
				</div>

				{/* ════ Rooms & Features ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{tCreate("rooms-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{(
					[
						{ name: "rooms_count", label: tCreate("rooms-count-label") },
						{
							name: "bathrooms_count",
							label: tCreate("bathrooms-count-label"),
						},
						{ name: "kitchens_count", label: tCreate("kitchens-count-label") },
						{
							name: "balconies_count",
							label: tCreate("balconies-count-label"),
						},
					] as const
				).map(({ name, label }) => (
					<div key={name} className='md:col-span-3 col-span-6'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{label}
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
							{...register(name, { valueAsNumber: true })}
						/>
					</div>
				))}

				{/* Furnishing + Orientation + AC + Internet */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("furnishing-label")}
					</Label>
					<Controller
						name='furnishing_status'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value}
								value={field.value}
								onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue
										placeholder={tCreate("furnishing-placeholder")}
									/>
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
												{tCreate(`furnishing-options.${v}`)}
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
						{tCreate("orientation-label")}
					</Label>
					<Controller
						name='orientation'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value}
								value={field.value}
								onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue
										placeholder={tCreate("orientation-placeholder")}
									/>
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
												{tCreate(`orientation-options.${v}`)}
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
						{tCreate("ac-type-label")}
					</Label>
					<Controller
						name='ac_type'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value}
								value={field.value}
								onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={tCreate("ac-type-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(["split", "central", "window", "none"] as const).map(
											(v) => (
												<SelectItem key={v} value={v}>
													{tCreate(`ac-type-options.${v}`)}
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
						{tCreate("internet-label")}
					</Label>
					<Controller
						name='internet_status'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value}
								value={field.value}
								onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={tCreate("internet-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(["wifi", "fiber", "none"] as const).map((v) => (
											<SelectItem key={v} value={v}>
												{tCreate(`internet-options.${v}`)}
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
						{tCreate("financial-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("monthly-rent-label")}
					</Label>
					<Input
						type='number'
						step={1}
						onKeyDown={(e) => {
							if (e.key === "." || e.key === ",") {
								e.preventDefault();
							}
						}}
						className='h-12 px-4'
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
						{tCreate("security-deposit-label")}
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
						{...register("security_deposit", { valueAsNumber: true })}
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("min-lease-label")}
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						{...register("min_lease_term", { valueAsNumber: true })}
					/>
				</div>

				{/* Description */}
				<div className='col-span-12 mt-2'>
					<Separator className='w-auto mb-4' />
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("description-label")}
					</Label>
					<Textarea
						className='h-24 px-4 py-3 resize-none'
						placeholder={tCreate("description-placeholder")}
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
						{tEdit("cancel-button-text")}
					</Button>
				</DialogClose>
				<Button
					type='submit'
					disabled={isUpdating}
					className='h-12 text-base px-14 py-3 rounded-lg'>
					{isUpdating ? (
						<>
							<Loader2 className='animate-spin h-4.5 w-4.5 mr-2 rtl:mr-0 rtl:ml-2' />
							{tEdit("save-button-loading-text")}
						</>
					) : (
						tEdit("save-button-text")
					)}
				</Button>
			</div>
		</form>
	);
};

export default EditCurrentUnit;
