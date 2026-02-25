"use client";

import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2, Mail, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateUserSchema, updateUserType } from "@/lib/zod";
import { useUser, useUsers } from "@/hooks/queries/tenants/useUsersQuery";
import AvatarUploader from "@/components/shared/avatar-uploader";
import RolesMultiSelect from "@/components/shared/roles-multi-select";
import ChangePasswordContent from "@/components/shared/change-password-content";

interface EditCurrentUserProps {
	userId: number | string;
	onClose?: () => void;
}

const EditCurrentUser = ({ userId, onClose }: EditCurrentUserProps) => {
	const tCreate = useTranslations("tenant.users.add-new-user-page");
	const tEdit = useTranslations("tenant.users.edit-current-user-page");
	const closeRef = useRef<HTMLButtonElement>(null);

	const { user, isLoading } = useUser(userId);
	const { updateUser, isUpdating } = useUsers();

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<
		updateUserType & { password?: string; confirmed_password?: string }
	>({
		resolver: zodResolver(
			updateUserSchema.extend({
				password: updateUserSchema.shape.name?.optional().describe("optional"),
				confirmed_password: updateUserSchema.shape.name
					?.optional()
					.describe("optional"),
			}) as any,
		),
	});

	useEffect(() => {
		if (!user) return;
		reset({
			name: user.name ?? "",
			email: user.email ?? "",
			roles: user.roles ?? [],
		});
	}, [user, reset]);

	const onSubmit = async (data: any) => {
		try {
			const formData = new FormData();
			if (data.name) formData.append("name", data.name);
			if (data.email) formData.append("email", data.email);
			data.roles?.forEach((role: string) => formData.append("roles[]", role));
			if (data.avatar) formData.append("avatar", data.avatar);
			if (data.password) {
				formData.append("password", data.password);
				formData.append("password_confirmation", data.confirmed_password ?? "");
			}

			await updateUser(
				{ id: userId, data: formData },
				{
					onSuccess: () => {
						closeRef.current?.click();
						onClose?.();
					},
				},
			);
		} catch (err) {
			console.error("Error updating user:", err);
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!user) {
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
			<DialogClose ref={closeRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-4'>
				{/* ════ Avatar ════ */}
				<div className='col-span-12 flex flex-col items-center py-4'>
					<Controller
						name='avatar'
						control={control}
						render={() => (
							<AvatarUploader
								currentUrl={user.avatar ?? null}
								onChange={(file) =>
									setValue("avatar", file ?? undefined, {
										shouldValidate: true,
									})
								}
								error={errors.avatar?.message as string | undefined}
								uploadLabel={tCreate("avatar-upload")}
								changeLabel={tCreate("avatar-change")}
								removeLabel={tCreate("avatar-remove")}
								hint={tCreate("avatar-hint")}
							/>
						)}
					/>
				</div>

				{/* ════ Basic Information ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{tCreate("basic-info-section")}
					</h6>
					<Separator />
				</div>

				{/* Name */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("name-label")}
					</Label>
					<div className='relative'>
						<User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rtl:left-[unset] rtl:right-3' />
						<Input
							className='h-12 pl-9 pr-4 rtl:pr-9 rtl:pl-4'
							placeholder={tCreate("name-placeholder")}
							{...register("name")}
						/>
					</div>
					{errors.name && (
						<p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
					)}
				</div>

				{/* Email */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("email-label")}
					</Label>
					<div className='relative'>
						<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rtl:left-[unset] rtl:right-3' />
						<Input
							type='email'
							className='h-12 pl-9 pr-4 rtl:pr-9 rtl:pl-4'
							placeholder={tCreate("email-placeholder")}
							{...register("email")}
						/>
					</div>
					{errors.email && (
						<p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
					)}
				</div>

				{/* Roles */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tCreate("roles-label")}
					</Label>
					<Controller
						name='roles'
						control={control}
						render={({ field }) => (
							<RolesMultiSelect
								value={field.value ?? []}
								onChange={field.onChange}
								placeholder={tCreate("roles-placeholder")}
								hint={tCreate("roles-hint")}
							/>
						)}
					/>
				</div>

				{/* ════ Optional Password Change ════ */}
				<div className='col-span-12 mt-2'>
					<div className='flex items-center justify-between mb-1'>
						<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200'>
							{tEdit("password-section")}
						</h6>
						<span className='text-xs text-neutral-400 dark:text-neutral-500'>
							{tEdit("password-hint")}
						</span>
					</div>
					<Separator className='mb-4' />
					<ChangePasswordContent
						isEditing={true}
						register={register}
						errors={errors}
					/>
				</div>
			</div>

			<Separator className='my-4' />

			<div className='flex items-center justify-center gap-3'>
				<DialogClose asChild>
					<Button
						type='button'
						className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 rounded-lg'>
						{tEdit("cancel-button-text")}
					</Button>
				</DialogClose>
				<Button
					type='submit'
					disabled={isUpdating}
					className='h-12 text-base px-14 rounded-lg'>
					{isUpdating ? (
						<>
							<Loader2 className='animate-spin h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2' />
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

export default EditCurrentUser;
