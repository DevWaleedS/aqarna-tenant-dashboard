"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TagsInputComponent } from "@/components/ui/TagsInputComponent";

import { addPackageFormSchema, AddPackageFormSchemaType } from "@/lib/zod";

import { usePackages } from "@/hooks/queries/central/usePackages";
import { cn } from "@/lib/utils";
import { useRef } from "react";

const ValidateForm = () => {
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const t = useTranslations("central.packages.add-new-package-form");
	const { createPackage, isCreating } = usePackages();

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

	const onSubmit = (data: AddPackageFormSchemaType) => {
		const payload = {
			...data,
			monthly_price: Math.round(data.monthly_price * 100),
			yearly_price: Math.round(data.yearly_price * 100),
			max_properties: Number(data.max_properties),
			max_units: Number(data.max_units),
			features: data.features ?? [],
		};

		createPackage(payload, {
			onSuccess: () => {
				reset({
					features: [],
				});
				closeButtonRef.current?.click();
			},
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			{/* Hidden close button for programmatic use */}

			<DialogClose ref={closeButtonRef} className='hidden' />
			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* LEFT */}
				<div className='md:col-span-6 col-span-12 flex flex-col gap-4'>
					<div>
						<Label htmlFor='name' className='mb-2'>
							{t("package-name-input-label")}
						</Label>
						<Input id='name' className='h-12 px-4' {...register("name")} />
						{errors.name && (
							<p className='text-red-500 text-sm'>{errors.name.message}</p>
						)}
					</div>

					<div>
						<Label htmlFor='description' className='mb-2'>
							{t("description-input-label")}
						</Label>
						<Textarea
							id='description'
							className='h-32 resize-none'
							{...register("description")}
						/>
						{errors.description && (
							<p className='text-red-500 text-sm'>
								{errors.description.message}
							</p>
						)}
					</div>

					<div>
						<Label htmlFor='max_properties' className='mb-2'>
							{t("max_properties-input-label")}
						</Label>
						<Input
							id='max_properties'
							type='number'
							className='h-12 px-4'
							{...register("max_properties", { valueAsNumber: true })}
						/>
						{errors.max_properties && (
							<p className='text-red-500 text-sm'>
								{errors.max_properties.message}
							</p>
						)}
					</div>

					<div>
						<Label htmlFor='max_units' className='mb-2'>
							{t("max_units-input-label")}
						</Label>
						<Input
							id='max_units'
							type='number'
							className='h-12 px-4'
							{...register("max_units", { valueAsNumber: true })}
						/>
						{errors.max_units && (
							<p className='text-red-500 text-sm'>{errors.max_units.message}</p>
						)}
					</div>
				</div>

				{/* RIGHT */}
				<div className='md:col-span-6 col-span-12 flex flex-col gap-4'>
					<div>
						<Label htmlFor='yearly_price' className='mb-2'>
							{t("yearly_price-input-label")}
						</Label>
						<Input
							id='yearly_price'
							type='number'
							step='0.01'
							className='h-12 px-4'
							{...register("yearly_price", { valueAsNumber: true })}
						/>
						{errors.yearly_price && (
							<p className='text-red-500 text-sm'>
								{errors.yearly_price.message}
							</p>
						)}
					</div>

					<div>
						<Label htmlFor='monthly_price' className='mb-2'>
							{t("monthly_price-input-label")}
						</Label>
						<Input
							id='monthly_price'
							type='number'
							step='0.01'
							className='h-12 px-4'
							{...register("monthly_price", { valueAsNumber: true })}
						/>
						{errors.monthly_price && (
							<p className='text-red-500 text-sm'>
								{errors.monthly_price.message}
							</p>
						)}
					</div>

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
									value={field.value ?? []}
									onChange={field.onChange}
									placeholder={t("features-placeholder")}
								/>
							)}
						/>
						{errors.features && (
							<p className='text-red-500 text-sm'>{errors.features.message}</p>
						)}
					</div>
				</div>
			</div>

			<Separator className='my-4' />

			<div className='flex justify-center gap-3'>
				<Button type='submit' disabled={isCreating} className='h-12 px-14'>
					{isCreating ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							{t("creating-package")}
						</>
					) : (
						t("create-package-button")
					)}
				</Button>

				<DialogClose asChild>
					<Button
						type='button'
						variant='outline'
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
