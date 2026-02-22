"use client";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addNewUserSchema, addNewUserType } from "@/lib/zod";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import AvatarUpload from "../../../../../../components/shared/avatar-upload";
import ChangePasswordContent from "../change-password-content";
import { DialogClose } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";

import { Loader2 } from "lucide-react";
import { useUsers } from "@/hooks/queries/central/useUsersQuery";
import { useRoles } from "@/hooks/queries/central/UseRoles";

interface ValidateFormProps {
	userId?: string;
	initialData?: any;
}

const ValidateForm = ({ userId, initialData }: ValidateFormProps) => {
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const t = useTranslations("central.users.add-new-user-page");
	const { createUser, updateUser, isCreating, isUpdating } = useUsers();
	const { roles } = useRoles();
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<addNewUserType>({
		resolver: zodResolver(addNewUserSchema),
		defaultValues: initialData || {
			name: "",
			email: "",
			password: "",
			confirmed_password: "",
			roles: [],
		},
	});

	const onSubmit = (data: addNewUserType, event?: React.BaseSyntheticEvent) => {
		event?.preventDefault();

		const formData = {
			name: data.name,
			email: data.email,
			password: data.password,
			password_confirmation: data.confirmed_password,
			roles: data.roles,
			avatar: avatarFile,
		};

		if (userId) {
			// Update existing user
			updateUser(
				{ userId, userData: formData },
				{
					onSuccess: () => {
						reset();
						setAvatarFile(null);

						closeButtonRef.current?.click();
					},
				},
			);
		} else {
			// Create new user
			createUser(formData, {
				onSuccess: () => {
					reset();
					setAvatarFile(null);
					closeButtonRef.current?.click();
				},
			});
		}
	};

	console.log("errors", errors);
	const isPending = isCreating || isUpdating;

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			{/* Hidden close button for programmatic use */}
			<DialogClose ref={closeButtonRef} className='hidden' />
			<h6 className='text-base text-neutral-600 dark:text-neutral-200 mb-4'>
				{t("profile-image")}
			</h6>
			<div className='mb-6 mt-4'>
				<AvatarUpload
					onFileChange={(file) => setAvatarFile(file)}
					initialImage={initialData?.avatar}
				/>
			</div>

			<Separator className='mx-2 w-auto my-4' />
			<div className='grid grid-cols-12 gap-5 pb-6'>
				<div className='md:col-span-6 col-span-12'>
					<div className='flex flex-col gap-4'>
						{/* full name */}
						<div>
							<Label
								htmlFor='name'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("full-name-label")}
								<span className='text-red-600'>*</span>
							</Label>
							<Input
								id='name'
								className='h-12 px-4'
								placeholder={t("full-name-input-placeholder")}
								{...register("name")}
							/>
							{errors.name && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.name.message}
								</p>
							)}
						</div>
						{/* Email */}
						<div>
							<Label
								htmlFor='email'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("email-label")}
								<span className='text-red-600'>*</span>
							</Label>
							<Input
								id='email'
								type='email'
								className='h-12 px-4'
								placeholder={t("email-input-placeholder")}
								{...register("email")}
							/>
							{errors.email && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.email.message}
								</p>
							)}
						</div>

						{/* roles */}
						<div>
							<Label
								htmlFor='roles'
								className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("role-name-label")}
								<span className='text-red-600'>*</span>
							</Label>

							<Controller
								name='roles'
								control={control}
								render={({ field }) => (
									<MultiSelect
										className='h-12 px-4'
										options={roles}
										value={field.value ?? []}
										onChange={field.onChange}
										placeholder={t("role-input-placeholder")}
										labelKey='name'
										valueKey='name'
									/>
								)}
							/>

							{errors.roles && (
								<p className='text-red-500 text-sm mt-1'>
									{errors.roles.message}
								</p>
							)}
						</div>
					</div>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<div className='flex flex-col gap-4'>
						<ChangePasswordContent register={register} errors={errors} />
					</div>
				</div>
			</div>
			<Separator className='mx-2 w-auto my-4' />

			<div className='flex items-center justify-center gap-3'>
				<DialogClose asChild>
					<Button
						type='button'
						variant='outline'
						className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-2.75 rounded-lg'
						disabled={isPending}>
						{t("cancel-button-text")}
					</Button>
				</DialogClose>

				<Button
					type='submit'
					className='h-12 text-base px-14 py-3 rounded-lg'
					disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
							{userId
								? t("save-button-loading-text")
								: t("save-button-loading-text")}
						</>
					) : (
						t("save-button-text")
					)}
				</Button>
			</div>
		</form>
	);
};

export default ValidateForm;
