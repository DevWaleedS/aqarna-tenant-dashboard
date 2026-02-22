"use client";
import React, { useEffect } from "react";
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
import { useRole, useRoles } from "@/hooks/queries/central/UseRoles";
import { usePermissions } from "@/hooks/queries/central/UsePermissions";

interface EditRoleProps {
	roleId: number;
}

const EditRole = ({ roleId }: EditRoleProps) => {
	const t = useTranslations("central.roles-and-permissions.add-new-role-page");
	const { role, isLoading: isLoadingRole } = useRole(roleId.toString());
	const { updateRole, isUpdating } = useRoles();
	const { permissions, isLoading: isLoadingPermissions } = usePermissions();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<addNewRoleType>({
		resolver: zodResolver(addNewRoleSchema),
	});

	// Populate form with role data when loaded
	useEffect(() => {
		if (role) {
			setValue("name", role.name);
			// Assuming the API returns permissions as an array
			setValue("permissions", role.permissions || []);
		}
	}, [role, setValue]);

	const onSubmit = async (data: addNewRoleType) => {
		try {
			await updateRole({ roleId: roleId.toString(), roleData: data });
			reset();
		} catch (error) {
			console.error("Error updating role:", error);
		}
	};

	if (isLoadingRole || isLoadingPermissions) {
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
										valueKey='name' // Use 'name' as the value
										labelKey='name' // Display 'name'
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
						disabled={isUpdating}
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

export default EditRole;
