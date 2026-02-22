"use client";

import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TagsInputComponent } from "@/components/ui/TagsInputComponent";

import { cn } from "@/lib/utils";
import { addPackageFormSchema, AddPackageFormSchemaType } from "@/lib/zod";

import { usePackage, usePackages } from "@/hooks/queries/central/usePackages";
interface EditPackageFormProps {
	packageId: string;
}
const ValidateForm = ({ packageId }: EditPackageFormProps) => {
	const t = useTranslations("central.packages.add-new-package-form");
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const { updatePackage, isUpdating } = usePackages();
	const { package: packageData, isLoading } = usePackage(packageId);

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<AddPackageFormSchemaType>({
		resolver: zodResolver(addPackageFormSchema),
		defaultValues: {
			features: [],
		},
	});

	/**
	 * Populate form when package data loads
	 * Using reset() is REQUIRED for:
	 * - correct cancel behavior
	 * - stable RHF state
	 */
	useEffect(() => {
		if (!packageData) return;

		reset({
			name: packageData.name,
			description: packageData.description,
			max_properties: packageData.max_properties,
			max_units: packageData.max_units,
			monthly_price: packageData.monthly_price / 100,
			yearly_price: packageData.yearly_price / 100,
			features: packageData.features ?? [],
		});
	}, [packageData, reset]);

	/**
	 * Submit handler
	 * - Convert prices back to cents
	 * - Close dialog on success
	 */
	const onSubmit = (data: AddPackageFormSchemaType) => {
		updatePackage(
			{
				id: packageId,
				data: {
					...data,
					monthly_price: Math.round(data.monthly_price * 100),
					yearly_price: Math.round(data.yearly_price * 100),
				},
			},
			{
				onSuccess: () => {
					closeButtonRef.current?.click(); // ✅ CLOSE POPUP
				},
			}
		);
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-12'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			{/* Hidden close button for programmatic use */}
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* LEFT COLUMN */}
				<div className='col-span-12 md:col-span-6'>
					<div className='flex flex-col gap-4'>
						{/* Package Name */}
						<div>
							<Label htmlFor='name' className='mb-2'>
								{t("package-name-input-label")}
							</Label>
							<Input
								id='name'
								className='h-12 px-4'
								placeholder={t("package-name-placeholder")}
								{...register("name")}
							/>
							{errors.name && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.name.message}
								</p>
							)}
						</div>

						{/* Description */}
						<div>
							<Label htmlFor='description' className='mb-2'>
								{t("description-input-label")}
							</Label>
							<Textarea
								id='description'
								className='resize-none px-4 py-2'
								placeholder={t("description-placeholder")}
								{...register("description")}
							/>
							{errors.description && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.description.message}
								</p>
							)}
						</div>

						{/* Max Properties */}
						<div>
							<Label htmlFor='max_properties' className='mb-2'>
								{t("max_properties-input-label")}
							</Label>
							<Input
								id='max_properties'
								type='number'
								className='h-12 px-4'
								placeholder={t("max_properties-placeholder")}
								{...register("max_properties", {
									valueAsNumber: true,
								})}
							/>
							{errors.max_properties && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.max_properties.message}
								</p>
							)}
						</div>

						{/* Max Units */}
						<div>
							<Label htmlFor='max_units' className='mb-2'>
								{t("max_units-input-label")}
							</Label>
							<Input
								id='max_units'
								type='number'
								className='h-12 px-4'
								placeholder={t("max_units-placeholder")}
								{...register("max_units", {
									valueAsNumber: true,
								})}
							/>
							{errors.max_units && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.max_units.message}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* RIGHT COLUMN */}
				<div className='col-span-12 md:col-span-6'>
					<div className='flex flex-col gap-4'>
						{/* Yearly Price */}
						<div>
							<Label htmlFor='yearly_price' className='mb-2'>
								{t("yearly_price-input-label")}
							</Label>
							<Input
								id='yearly_price'
								type='number'
								step='0.01'
								className='h-12 px-4'
								placeholder={t("yearly_price-placeholder")}
								{...register("yearly_price", {
									valueAsNumber: true,
								})}
							/>
							{errors.yearly_price && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.yearly_price.message}
								</p>
							)}
						</div>

						{/* Monthly Price */}
						<div>
							<Label htmlFor='monthly_price' className='mb-2'>
								{t("monthly_price-input-label")}
							</Label>
							<Input
								id='monthly_price'
								type='number'
								step='0.01'
								className='h-12 px-4'
								placeholder={t("monthly_price-placeholder")}
								{...register("monthly_price", {
									valueAsNumber: true,
								})}
							/>
							{errors.monthly_price && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.monthly_price.message}
								</p>
							)}
						</div>

						{/* Features */}
						<div>
							<Label htmlFor='features' className='mb-2'>
								{t("features-input-label")}
							</Label>
							<Controller
								name='features'
								control={control}
								render={({ field }) => (
									<TagsInputComponent
										id='features'
										placeholder={t("features-placeholder")}
										value={field.value ?? []}
										onChange={field.onChange}
									/>
								)}
							/>
							{errors.features && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.features.message}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			<Separator className='my-4' />

			{/* ACTIONS */}
			<div className='flex items-center justify-center gap-3'>
				<Button
					type='submit'
					disabled={isUpdating}
					className='h-12 px-14 text-base rounded-lg'>
					{isUpdating ? (
						<>
							<Loader2 className='h-4 w-4 animate-spin mr-2' />
							{t("updating-package")}
						</>
					) : (
						t("edit-package-button")
					)}
				</Button>

				<DialogClose asChild>
					<Button
						type='button'
						variant='outline'
						disabled={isUpdating}
						onClick={() => reset()}
						className={cn(
							"h-12 px-14 border-red-600 text-red-600 hover:bg-red-600/20"
						)}>
						{t("cancel-button-text")}
					</Button>
				</DialogClose>
			</div>
		</form>
	);
};

export default ValidateForm;
