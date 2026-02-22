"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { addNewRoleSchema, addNewRoleType } from "@/lib/zod";
import { useTranslations } from "next-intl";

import { Separator } from "@/components/ui/separator";

import { DialogClose } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";

import { Loader2 } from "lucide-react";
import { useRoles } from "@/hooks/queries/central/UseRoles";
import { usePermissions } from "@/hooks/queries/central/UsePermissions";

const AddNewRole = () => {
	const t = useTranslations("central.roles-and-permissions.add-new-role-page");
	const { createRole, isCreating } = useRoles();
	const { permissions, isLoading: isLoadingPermissions } = usePermissions();
	const [isDialogOpen, setIsDialogOpen] = useState(true);

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<addNewRoleType>({
		resolver: zodResolver(addNewRoleSchema),
	});

	const onSubmit = async (data: addNewRoleType) => {
		try {
			await createRole(data);
			reset();
			setIsDialogOpen(false);
		} catch (error) {
			console.error("Error creating role:", error);
		}
	};

	if (isLoadingPermissions) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className='grid grid-cols-12 gap-5 pb-6'>
				<div className='col-span-12'>
					<div className='flex flex-col gap-4'>
						{/* Role name */}
						<div>
							<Label
								htmlFor='name'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("role-name-label")}
								<span className='text-red-600'>*</span>
							</Label>
							<Input
								id='name'
								className='h-12 px-4'
								placeholder={t("role-name-input-placeholder")}
								{...register("name")}
							/>
							{errors.name && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.name.message}
								</p>
							)}
						</div>

						{/* Select permissions */}
						<div>
							<Label
								htmlFor='permissions'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("permissions-label")}
								<span className='text-red-600'>*</span>
							</Label>

							<Controller
								name='permissions'
								control={control}
								render={({ field }) => (
									<MultiSelect
										className='h-12 px-4'
										options={permissions}
										value={field.value ?? []}
										onChange={field.onChange}
										placeholder={t("permissions-input-placeholder")}
										valueKey='name'
										labelKey='name'
									/>
								)}
							/>

							{errors.permissions && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.permissions.message}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
			<Separator className='mx-2 w-auto my-4' />

			<div className='flex items-center justify-center gap-3'>
				<DialogClose asChild>
					<Button
						type='button'
						variant='outline'
						disabled={isCreating}
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
							<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
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

export default AddNewRole;
