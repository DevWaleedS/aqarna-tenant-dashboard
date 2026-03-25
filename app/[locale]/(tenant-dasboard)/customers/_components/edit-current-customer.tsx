"use client";
import React, { useEffect, useRef } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateCustomerSchema, updateCustomerType } from "@/lib/zod";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomer, useCustomers } from "@/hooks/queries/useCustomers";
import InputPhoneCountryInput from "@/components/shared/InputPhoneCountryInput";
import AvatarUploader from "@/components/shared/avatar-uploader";

interface EditCurrentCustomerProps {
	customerId: number | string;
	onClose?: () => void;
}

const EditCurrentCustomer = ({
	customerId,
	onClose,
}: EditCurrentCustomerProps) => {
	const t = useTranslations("tenant.customers.create-new-customer-page");
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const { customer, isLoading } = useCustomer(customerId);
	const { updateCustomer, isUpdating } = useCustomers();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm<updateCustomerType>({
		resolver: zodResolver(updateCustomerSchema),
		defaultValues: {
			avatar: undefined, // ← added
			emergency_contact: [],
			vehicles: [],
			pets: [],
		},
	});

	const selectedType = watch("type");

	// ── Populate form once customer data loads ────────────────────────────────
	useEffect(() => {
		if (!customer) return;
		reset({
			avatar: undefined, // always start with no new file selected
			type: customer.type,
			name: customer.name ?? "",
			email: customer.email ?? "",
			dial_code: String(customer.dial_code ?? ""),
			phone: customer.phone ?? "",
			secondary_dial_code: String(customer.secondary_dial_code ?? ""),
			secondary_phone: customer.secondary_phone ?? "",
			nid_no: customer.nid_no ?? "",
			cr_no: customer.cr_no ?? "",
			tin: customer.tin ?? "",
			address: customer.address ?? "",
			notes: customer.notes ?? "",
			emergency_contact: customer.emergency_contact ?? [],
			vehicles: customer.vehicles ?? [],
			pets: customer.pets ?? [],
		});
	}, [customer, reset]);

	// ── Dynamic arrays ────────────────────────────────────────────────────────
	const {
		fields: emergencyFields,
		append: appendEmergency,
		remove: removeEmergency,
	} = useFieldArray({ control, name: "emergency_contact" });

	const {
		fields: vehicleFields,
		append: appendVehicle,
		remove: removeVehicle,
	} = useFieldArray({ control, name: "vehicles" });

	const {
		fields: petFields,
		append: appendPet,
		remove: removePet,
	} = useFieldArray({ control, name: "pets" });

	// ── Submit with FormData ──────────────────────────────────────────────────
	const onSubmit = async (data: updateCustomerType) => {
		try {
			const formData = new FormData();

			// ── Avatar (only append if a new file was selected) ──
			if (data.avatar) formData.append("avatar", data.avatar);

			// ── Basic ────────────────────────────────────────────
			formData.append("type", data.type ?? "");
			formData.append("name", data.name ?? "");
			formData.append("email", data.email ?? "");

			// ── Identification ───────────────────────────────────
			if (data.nid_no) formData.append("nid_no", data.nid_no);
			if (data.cr_no) formData.append("cr_no", data.cr_no);
			if (data.tin) formData.append("tin", data.tin);

			// ── Contact ──────────────────────────────────────────
			formData.append("phone", data.phone ?? "");
			formData.append("dial_code", data.dial_code ?? "");

			if (data.secondary_phone) {
				formData.append("secondary_phone", data.secondary_phone);
				formData.append("secondary_dial_code", data.secondary_dial_code ?? "");
			}

			if (data.address) formData.append("address", data.address);
			if (data.notes) formData.append("notes", data.notes);

			// ── Emergency contacts ───────────────────────────────
			data.emergency_contact?.forEach((contact, i) => {
				formData.append(`emergency_contact[${i}][name]`, contact.name ?? "");
				formData.append(`emergency_contact[${i}][phone]`, contact.phone ?? "");
				formData.append(
					`emergency_contact[${i}][relation]`,
					contact.relation ?? "",
				);
			});

			// ── Vehicles ─────────────────────────────────────────
			data.vehicles?.forEach((vehicle, i) => {
				formData.append(`vehicles[${i}][make]`, vehicle.make ?? "");
				formData.append(`vehicles[${i}][model]`, vehicle.model ?? "");
				formData.append(
					`vehicles[${i}][model_year]`,
					String(vehicle.model_year ?? ""),
				);
				formData.append(`vehicles[${i}][color]`, vehicle.color ?? "");
				formData.append(
					`vehicles[${i}][plate_number]`,
					vehicle.plate_number ?? "",
				);
			});

			// ── Pets ─────────────────────────────────────────────
			data.pets?.forEach((pet, i) => {
				formData.append(`pets[${i}][type]`, pet.type ?? "");
				formData.append(`pets[${i}][name]`, pet.name ?? "");
				formData.append(`pets[${i}][breed]`, pet.breed ?? "");
			});

			await updateCustomer(
				{ id: customerId, data: formData },
				{
					onSuccess: () => {
						closeButtonRef.current?.click();
						onClose?.();
					},
				},
			);
		} catch (error) {
			console.error("Error updating customer:", error);
		}
	};

	// ── Loading / not found ───────────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!customer) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("no_customer_available")}
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ════ Avatar ════ */}
				<div className='col-span-12 flex flex-col items-center py-4'>
					<Controller
						name='avatar'
						control={control}
						render={() => (
							<AvatarUploader
								currentUrl={customer?.avatar ?? undefined}
								onChange={(file) =>
									setValue("avatar", file ?? undefined, {
										shouldValidate: true,
									})
								}
								error={errors.avatar?.message as string | undefined}
								uploadLabel={t("avatar-upload")}
								changeLabel={t("avatar-change")}
								removeLabel={t("avatar-remove")}
								hint={t("avatar-hint")}
							/>
						)}
					/>
				</div>
				{/* ── Type ── */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("type-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='type'
						control={control}
						render={({ field }) => (
							<Select
								key={field.value} // ← forces remount when value changes from undefined → "business"
								value={field.value}
								onValueChange={field.onChange}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("type-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='individual'>
											{t("type-options.individual")}
										</SelectItem>
										<SelectItem value='business'>
											{t("type-options.business")}
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.type && (
						<p className='text-red-500 text-sm mt-1'>{errors.type.message}</p>
					)}
				</div>

				{/* ════ Basic Information ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("basic-info-section")}
					</h6>
					<Separator className='w-auto' />
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

				{/* Email */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("email-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						type='email'
						className='h-12 px-4'
						placeholder={t("email-placeholder")}
						{...register("email")}
					/>
					{errors.email && (
						<p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
					)}
				</div>

				{/* ════ Identification ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("id-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{selectedType === "individual" && (
					<div className='md:col-span-6 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("nid-label")}
						</Label>
						<Input
							className='h-12 px-4'
							placeholder={t("nid-placeholder")}
							{...register("nid_no")}
						/>
						{errors.nid_no && (
							<p className='text-red-500 text-sm mt-1'>
								{errors.nid_no.message}
							</p>
						)}
					</div>
				)}

				{selectedType === "business" && (
					<>
						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("cr-label")}
							</Label>
							<Input
								className='h-12 px-4'
								placeholder={t("cr-placeholder")}
								{...register("cr_no")}
							/>
							{errors.cr_no && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.cr_no.message}
								</p>
							)}
						</div>
						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("tin-label")}
							</Label>
							<Input
								className='h-12 px-4'
								placeholder={t("tin-placeholder")}
								{...register("tin")}
							/>
							{errors.tin && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.tin.message}
								</p>
							)}
						</div>
					</>
				)}

				{/* ════ Contact Details ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("contact-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Primary Phone */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("phone-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='phone'
						control={control}
						render={({ field }) => (
							<InputPhoneCountryInput
								value={field.value}
								placeholder={t("phone-placeholder")}
								onPhoneChange={(phone: string, dialCode: string) => {
									setValue("phone", phone);
									setValue("dial_code", dialCode);
								}}
							/>
						)}
					/>
					{errors.phone && (
						<p className='text-red-500 text-sm mt-1'>{errors.phone.message}</p>
					)}
				</div>

				{/* Secondary Phone */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("secondary-phone-label")}
					</Label>
					<Controller
						name='secondary_phone'
						control={control}
						render={({ field }) => (
							<InputPhoneCountryInput
								value={field.value}
								placeholder={t("secondary-phone-placeholder")}
								onPhoneChange={(phone: string, dialCode: string) => {
									setValue("secondary_phone", phone);
									setValue("secondary_dial_code", dialCode);
								}}
							/>
						)}
					/>
				</div>

				{/* Address */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("address-label")}
					</Label>
					<Textarea
						className='h-20 px-4 py-2 resize-none'
						placeholder={t("address-placeholder")}
						{...register("address")}
					/>
				</div>

				{/* ════ Emergency Contacts ════ */}
				<div className='col-span-12 mt-2'>
					<div className='flex items-center justify-between mb-1'>
						<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200'>
							{t("emergency-contacts-section")}
						</h6>
						<Button
							type='button'
							size='sm'
							variant='outline'
							onClick={() =>
								appendEmergency({ name: "", phone: "", relation: "" })
							}
							className='h-8 text-xs gap-1'>
							<Plus className='w-3 h-3' />
							{t("add-emergency-contact")}
						</Button>
					</div>
					<Separator className='w-auto' />
				</div>

				{emergencyFields.map((field, index) => (
					<div
						key={field.id}
						className='col-span-12 grid grid-cols-12 gap-3 p-3 border border-neutral-200 dark:border-slate-600 rounded-lg'>
						<div className='md:col-span-4 col-span-12'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("emergency-contact-name-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("emergency-contact-name-placeholder")}
								{...register(`emergency_contact.${index}.name`)}
							/>
						</div>
						<div className='md:col-span-4 col-span-12'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("emergency-contact-phone-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("emergency-contact-phone-placeholder")}
								{...register(`emergency_contact.${index}.phone`)}
							/>
						</div>
						<div className='md:col-span-3 col-span-10'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("emergency-contact-relation-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("emergency-contact-relation-placeholder")}
								{...register(`emergency_contact.${index}.relation`)}
							/>
						</div>
						<div className='md:col-span-1 col-span-2 flex items-end'>
							<Button
								type='button'
								size='icon'
								variant='ghost'
								onClick={() => removeEmergency(index)}
								className='h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'>
								<Trash2 className='w-4 h-4' />
							</Button>
						</div>
					</div>
				))}

				{/* ════ Vehicles ════ */}
				<div className='col-span-12 mt-2'>
					<div className='flex items-center justify-between mb-1'>
						<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200'>
							{t("vehicles-section")}
						</h6>
						<Button
							type='button'
							size='sm'
							variant='outline'
							onClick={() =>
								appendVehicle({
									make: "",
									model: "",
									model_year: new Date().getFullYear(),
									color: "",
									plate_number: "",
								})
							}
							className='h-8 text-xs gap-1'>
							<Plus className='w-3 h-3' />
							{t("add-vehicle")}
						</Button>
					</div>
					<Separator className='w-auto' />
				</div>

				{vehicleFields.map((field, index) => (
					<div
						key={field.id}
						className='col-span-12 grid grid-cols-12 gap-3 p-3 border border-neutral-200 dark:border-slate-600 rounded-lg'>
						<div className='md:col-span-3 col-span-6'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("vehicle-make-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("vehicle-make-placeholder")}
								{...register(`vehicles.${index}.make`)}
							/>
						</div>
						<div className='md:col-span-3 col-span-6'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("vehicle-model-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("vehicle-model-placeholder")}
								{...register(`vehicles.${index}.model`)}
							/>
						</div>
						<div className='md:col-span-2 col-span-4'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("vehicle-year-label")}
							</Label>
							<Input
								type='number'
								className='h-10 px-3'
								placeholder={t("vehicle-year-placeholder")}
								{...register(`vehicles.${index}.model_year`, {
									valueAsNumber: true,
								})}
							/>
						</div>
						<div className='md:col-span-2 col-span-4'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("vehicle-color-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("vehicle-color-placeholder")}
								{...register(`vehicles.${index}.color`)}
							/>
						</div>
						<div className='md:col-span-2 col-span-3'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("vehicle-plate-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("vehicle-plate-placeholder")}
								{...register(`vehicles.${index}.plate_number`)}
							/>
						</div>
						<div className='col-span-12 md:col-span-1 flex md:items-end justify-end'>
							<Button
								type='button'
								size='icon'
								variant='ghost'
								onClick={() => removeVehicle(index)}
								className='h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'>
								<Trash2 className='w-4 h-4' />
							</Button>
						</div>
					</div>
				))}

				{/* ════ Pets ════ */}
				<div className='col-span-12 mt-2'>
					<div className='flex items-center justify-between mb-1'>
						<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200'>
							{t("pets-section")}
						</h6>
						<Button
							type='button'
							size='sm'
							variant='outline'
							onClick={() => appendPet({ type: "", name: "", breed: "" })}
							className='h-8 text-xs gap-1'>
							<Plus className='w-3 h-3' />
							{t("add-pet")}
						</Button>
					</div>
					<Separator className='w-auto' />
				</div>

				{petFields.map((field, index) => (
					<div
						key={field.id}
						className='col-span-12 grid grid-cols-12 gap-3 p-3 border border-neutral-200 dark:border-slate-600 rounded-lg'>
						<div className='md:col-span-4 col-span-12'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("pet-type-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("pet-type-placeholder")}
								{...register(`pets.${index}.type`)}
							/>
						</div>
						<div className='md:col-span-4 col-span-12'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("pet-name-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("pet-name-placeholder")}
								{...register(`pets.${index}.name`)}
							/>
						</div>
						<div className='md:col-span-3 col-span-10'>
							<Label className='text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1 block'>
								{t("pet-breed-label")}
							</Label>
							<Input
								className='h-10 px-3'
								placeholder={t("pet-breed-placeholder")}
								{...register(`pets.${index}.breed`)}
							/>
						</div>
						<div className='md:col-span-1 col-span-2 flex items-end'>
							<Button
								type='button'
								size='icon'
								variant='ghost'
								onClick={() => removePet(index)}
								className='h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'>
								<Trash2 className='w-4 h-4' />
							</Button>
						</div>
					</div>
				))}

				{/* ════ Notes ════ */}
				<div className='col-span-full mt-2'>
					<Separator className='w-auto mb-4' />
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("notes-label")}
					</Label>
					<Textarea
						className='h-20 px-4 py-2 resize-none'
						placeholder={t("notes-placeholder")}
						{...register("notes")}
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

export default EditCurrentCustomer;
