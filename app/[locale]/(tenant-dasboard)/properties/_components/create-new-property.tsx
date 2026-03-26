"use client";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	createPropertySchema,
	createPropertyType,
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
import { useProperties } from "@/hooks/queries/usePropertiesQuery";
import { cn } from "@/lib/utils";
import InputPhoneCountryInput from "@/components/shared/InputPhoneCountryInput";
import LocationPickerInput from "@/components/location-picker-input";

const CreateNewProperty = () => {
	const t = useTranslations("tenant.properties.create-new-property-page");
	const tAmenities = useTranslations("tenant.properties.amenities");
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const { createProperty, isCreating } = useProperties();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm<createPropertyType>({
		resolver: zodResolver(createPropertySchema),
		defaultValues: {
			name: "",
			type: undefined,
			address_line_1: "",
			address_line_2: "",
			building_number: "",
			floors_count: undefined,
			area: undefined,
			concierge_phone: "",
			latitude: "",
			longitude: "",
			amenities: [],
		},
	});

	const selectedAmenities = watch("amenities") ?? [];
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

	const onSubmit = async (data: createPropertyType) => {
		try {
			await createProperty(data, {
				onSuccess: () => {
					reset();
					closeButtonRef.current?.click();
				},
			});
		} catch (error) {
			console.error("Error creating property:", error);
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

				{/* Name */}
				<div className='md:col-span-8 col-span-12'>
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
				<div className='md:col-span-4 col-span-12'>
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

				{/* Building Number */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("building-number-label")}
					</Label>
					<Input
						className='h-12 px-4 font-mono'
						placeholder={t("building-number-placeholder")}
						{...register("building_number")}
					/>
				</div>

				{/* Floors Count */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("floors-count-label")}
					</Label>
					<Input
						type='number'
						min={1}
						className='h-12 px-4'
						placeholder={t("floors-count-placeholder")}
						{...register("floors_count", { valueAsNumber: true })}
					/>
				</div>

				{/* Area */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("area-label")}
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
						placeholder={t("area-placeholder")}
						{...register("area", { valueAsNumber: true })}
					/>
				</div>

				{/* Concierge Phone */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("concierge-phone-label")}
					</Label>
					<Controller
						name='concierge_phone'
						control={control}
						render={({ field }) => (
							<InputPhoneCountryInput
								value={field.value}
								placeholder={t("concierge-phone-placeholder")}
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
						{t("address-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Address Line 1 */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("address-line-1-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={t("address-line-1-placeholder")}
						{...register("address_line_1")}
					/>
					{errors.address_line_1 && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.address_line_1.message}
						</p>
					)}
				</div>

				{/* Address Line 2 */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("address-line-2-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={t("address-line-2-placeholder")}
						{...register("address_line_2")}
					/>
				</div>

				{/* ── NEW: Location Picker replaces the two raw inputs ─────────────── */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("location-label")}
					</Label>
					<LocationPickerInput
						latitude={latValue ?? ""}
						longitude={lngValue ?? ""}
						onLocationChange={(lat, lng) => {
							setValue("latitude", lat);
							setValue("longitude", lng);
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
						{t("amenities-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-3'>
						{t("amenities-label")}
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

export default CreateNewProperty;
