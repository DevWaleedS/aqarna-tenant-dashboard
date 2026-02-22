"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2 } from "lucide-react";

import AvatarUpload from "@/components/shared/avatar-upload";
import ChangePasswordContent from "../change-password-content";

import {
	addNewUserSchema,
	addNewUserType,
	editUserSchema,
	editUserType,
} from "@/lib/zod";
import { useUsers, useUser } from "@/hooks/queries/central/useUsersQuery";
import { useRoles } from "@/hooks/queries/central/UseRoles";

interface ValidateFormProps {
	userId?: string;
	isEditMode: boolean;
}

const ValidateForm = ({ userId, isEditMode }: ValidateFormProps) => {
	const t = useTranslations("central.users.add-new-user-page");
	const router = useRouter();

	const { roles } = useRoles();
	const { createUser, updateUser, isCreating, isUpdating } = useUsers();
	const { user, isLoading } = useUser(userId ?? "");

	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	/* ----------------------------- Form Setup ----------------------------- */

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
	} = useForm<addNewUserType | editUserType>({
		resolver: zodResolver(isEditMode ? editUserSchema : addNewUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmed_password: "",
			roles: [],
		},
	});

	const password = watch("password");
	const confirmedPassword = watch("confirmed_password");

	/* ----------------------------- Role Options ----------------------------- */
	const roleOptions = roles.map((role: any) => ({
		id: role.name,
		guard_name: role.name.charAt(0).toUpperCase() + role.name.slice(1),
	}));

	/* ----------------------------- Effects ----------------------------- */

	useEffect(() => {
		if (!user) return;

		reset({
			name: user.name,
			email: user.email,
			password: "",
			confirmed_password: "",
			roles: user.roles ?? [],
		});
	}, [user, reset]);

	/* ----------------------------- Navigation ----------------------------- */

	const handleCancel = () => router.back();

	const navigateToEditProfile = () => {
		if (!userId) return;
		router.push(`/users/${userId}/edit-profile`);
	};

	const navigateToUsersPage = () => {
		router.push("/users");
	};

	/* ----------------------------- Submit ----------------------------- */

	const onSubmit = (data: addNewUserType | editUserType) => {
		if (isEditMode && userId) {
			const payload: any = {
				name: data.name,
				email: data.email,
				roles: data.roles, // string[]
			};

			if (password && confirmedPassword) {
				payload.password = data.password;
				payload.password_confirmation = data.confirmed_password;
			}

			if (avatarFile) {
				payload.avatar = avatarFile;
			}

			updateUser(
				{ userId, userData: payload },
				{
					onSuccess: () => {
						reset();
						setAvatarFile(null);
						navigateToUsersPage();
					},
				},
			);
			return;
		}

		// Create user
		const payload = {
			name: data.name,
			email: data.email,
			password: data.password,
			password_confirmation: data.confirmed_password,
			roles: data.roles,
			avatar: avatarFile,
		};

		createUser(payload, {
			onSuccess: () => {
				reset();
				setAvatarFile(null);
			},
		});
	};
	const isSubmitting = isCreating || isUpdating;
	const isPending = isSubmitting || isLoading;
	const isViewMode = !isEditMode;

	/* ----------------------------------- Render ---------------------------------- */

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<h6 className='text-base text-neutral-600 dark:text-neutral-200 mb-4'>
				{t("profile-image")}
			</h6>

			<div className='mb-6 mt-4'>
				<AvatarUpload
					disabled={isViewMode || isPending}
					initialImage={user?.avatar}
					onFileChange={setAvatarFile}
				/>
			</div>

			<Separator className='my-4' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ----------------------------- Left Column ----------------------------- */}
				<div className='md:col-span-6 col-span-12 space-y-4'>
					{/* Name */}
					<div>
						<Label
							htmlFor='name'
							className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("full-name-label")} <span className='text-red-600'>*</span>
						</Label>
						<Input
							id='name'
							className='h-12 px-4'
							placeholder={t("full-name-input-placeholder")}
							{...register("name")}
							disabled={isViewMode || isPending}
						/>
						{errors.name && (
							<p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
						)}
					</div>

					{/* Email */}
					<div>
						<Label
							htmlFor='email'
							className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("email-label")} <span className='text-red-600'>*</span>
						</Label>
						<Input
							id='email'
							type='email'
							className='h-12 px-4'
							placeholder={t("email-input-placeholder")}
							{...register("email")}
							disabled={isViewMode || isPending}
						/>
						{errors.email && (
							<p className='text-red-500 text-sm mt-1'>
								{errors.email.message}
							</p>
						)}
					</div>

					{/* Roles */}
					<div>
						<Label
							htmlFor='roles'
							className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("role-name-label")} <span className='text-red-600'>*</span>
						</Label>

						<Controller
							name='roles'
							control={control}
							render={({ field }) => (
								<MultiSelect
									className='h-12 px-4'
									options={roleOptions}
									value={field.value ?? []}
									onChange={field.onChange}
									placeholder={t("role-input-placeholder")}
									disabled={isViewMode || isPending}
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

				{/* ---------------------------- Right Column ----------------------------- */}
				<div className='md:col-span-6 col-span-12'>
					{isEditMode && (
						<ChangePasswordContent register={register} errors={errors} />
					)}
				</div>
			</div>

			<Separator className='my-4' />

			<div className='flex items-center justify-center gap-3'>
				{isViewMode ? (
					// View Mode Buttons
					<>
						<Button
							type='button'
							variant='outline'
							onClick={handleCancel}
							className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-2.75 rounded-lg'>
							{t("cancel-button-text")}
						</Button>

						<Button
							type='button'
							onClick={navigateToEditProfile}
							className='h-12 text-base px-14 py-3 rounded-lg'>
							{t("edit-profile")}
						</Button>
					</>
				) : (
					// Edit Mode Buttons
					<>
						<Button
							type='button'
							variant='outline'
							onClick={handleCancel}
							disabled={isPending}
							className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-2.75 rounded-lg'>
							{t("cancel-button-text")}
						</Button>

						<Button
							type='submit'
							disabled={isPending}
							className='h-12 text-base px-14 py-3 rounded-lg'>
							{isPending ? (
								<>
									<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
									{t("save-button-loading-text")}
								</>
							) : (
								t("save-button-text")
							)}
						</Button>
					</>
				)}
			</div>
		</form>
	);
};

export default ValidateForm;
