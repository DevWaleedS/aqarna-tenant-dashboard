"use client";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	updatePropertySchema,
	updatePropertyType,
	PROPERTY_AMENITIES,
} from "@/lib/zod";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2, Check } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useProperty, useProperties } from "@/hooks/queries/usePropertiesQuery";
import { cn } from "@/lib/utils";
import InputPhoneCountryInput from "@/components/shared/InputPhoneCountryInput";
import LocationPickerInput from "@/components/location-picker-input";

interface EditCurrentPropertyProps {
	propertyId: number | string;
	onClose?: () => void;
}

const EditCurrentProperty = ({
	propertyId,
	onClose,
}: EditCurrentPropertyProps) => {
	const tCreate = useTranslations("tenant.properties.create-new-property-page");
	const tEdit = useTranslations("tenant.properties.edit-current-property-page");
	const tAmenities = useTranslations("tenant.properties.amenities");
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const { property, isLoading } = useProperty(propertyId);
	const { updateProperty, isUpdating } = useProperties();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm<updatePropertyType>({
		resolver: zodResolver(updatePropertySchema),
	});

	const selectedAmenities = watch("amenities") ?? [];
	// ↓ NEW — watch the two coord fields so LocationPickerInput stays in sync
	const latValue = watch("latitude");
	const lngValue = watch("longitude");

	const toggleAmenity = (amenity: (typeof PROPERTY_AMENITIES)[number]) => {
		const current = selectedAmenities;
		if (current.includes(amenity)) {
			setValue(
				"amenities",
				current.filter((a) => a !== amenity),
			);
		} else {
			setValue("amenities", [...current, amenity]);
		}
	};

	// Pre-fill form when property loads
	useEffect(() => {
		if (!property) return;
		reset({
			name: property.name ?? "",
			type: property.type,
			address_line_1: property.address_line_1 ?? "",
			address_line_2: property.address_line_2 ?? "",
			building_number: property.building_number ?? "",
			floors_count: property.floors_count,
			area: property.area,
			concierge_phone: property.concierge_phone ?? "",
			latitude: property.latitude ?? "",
			longitude: property.longitude ?? "",
			amenities: property.amenities ?? [],
		});
	}, [property, reset]);

	const onSubmit = async (data: updatePropertyType) => {
		try {
			await updateProperty(
				{ id: propertyId, data },
				{
					onSuccess: () => {
						closeButtonRef.current?.click();
						onClose?.();
					},
				},
			);
		} catch (error) {
			console.error("Error updating property:", error);
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!property) {
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

				{/* Name */}
				<div className='md:col-span-8 col-span-12'>
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
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("type-label")}
					</Label>
					<Controller
						name='type'
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
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

				{/* Building Number + Floors + Area */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("building-number-label")}
					</Label>
					<Input
						className='h-12 px-4 font-mono'
						placeholder={tCreate("building-number-placeholder")}
						{...register("building_number")}
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("floors-count-label")}
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						placeholder={tCreate("floors-count-placeholder")}
						{...register("floors_count", { valueAsNumber: true })}
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("area-label")}
					</Label>
					<Input
						type='number'
						min={0}
						step='0.01'
						className='h-12 px-4'
						placeholder={tCreate("area-placeholder")}
						{...register("area", { valueAsNumber: true })}
					/>
				</div>

				{/* Concierge Phone */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("concierge-phone-label")}
					</Label>
					<Controller
						name='concierge_phone'
						control={control}
						render={({ field }) => (
							<InputPhoneCountryInput
								value={field.value}
								placeholder={tCreate("concierge-phone-placeholder")}
								onPhoneChange={(phone: string) => {
									setValue("concierge_phone", phone);
								}}
							/>
						)}
					/>
				</div>

				{/* ════ Address ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{tCreate("address-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("address-line-1-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={tCreate("address-line-1-placeholder")}
						{...register("address_line_1")}
					/>
					{errors.address_line_1 && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.address_line_1.message}
						</p>
					)}
				</div>

				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("address-line-2-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={tCreate("address-line-2-placeholder")}
						{...register("address_line_2")}
					/>
				</div>

				{/* ── NEW: Location Picker replaces the two raw lat/lng inputs ── */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tEdit("location-label")}
					</Label>
					<LocationPickerInput
						latitude={latValue ?? ""}
						longitude={lngValue ?? ""}
						onLocationChange={(lat, lng) => {
							setValue("latitude", lat, { shouldValidate: true });
							setValue("longitude", lng, { shouldValidate: true });
						}}
					/>
					{(errors.latitude || errors.longitude) && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.latitude?.message ?? errors.longitude?.message}
						</p>
					)}
				</div>

				{/* ════ Amenities ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{tCreate("amenities-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-3'>
						{tCreate("amenities-label")}
					</Label>
					<div className='flex flex-wrap gap-2'>
						{PROPERTY_AMENITIES.map((amenity) => {
							const isSelected = selectedAmenities.includes(amenity);
							return (
								<button
									key={amenity}
									type='button'
									onClick={() => toggleAmenity(amenity)}
									className={cn(
										"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
										isSelected
											? "bg-primary text-primary-foreground border-primary"
											: "bg-neutral-50 dark:bg-slate-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-slate-600 hover:border-primary hover:text-primary",
									)}>
									{isSelected && <Check className='w-3 h-3' />}
									{tAmenities(amenity)}
								</button>
							);
						})}
					</div>
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

export default EditCurrentProperty;
