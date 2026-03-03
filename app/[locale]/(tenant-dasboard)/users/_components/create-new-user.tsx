"use client";

import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2, Mail, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { createUserSchema, createUserType } from "@/lib/zod";
import { useUsers } from "@/hooks/queries/useUsersQuery";
import { useRoles } from "@/hooks/queries/useRoles";
import MultiSelect, {
	MultiSelectOption,
} from "@/components/shared/multi-select";
import AvatarUploader from "@/components/shared/avatar-uploader";
import ChangePasswordContent from "@/components/shared/change-password-content";

const CreateNewUser = () => {
	const t = useTranslations("tenant.users.add-new-user-page");
	const closeRef = useRef<HTMLButtonElement>(null);
	const { createUser, isCreating } = useUsers();
	const { roles, isLoading: rolesLoading } = useRoles();

	const rolesOptions: MultiSelectOption[] = roles.map((r: any) => ({
		value: r.name,
		label: r.name,
		badge: r.permissions_count > 0 ? `${r.permissions_count} perms` : undefined,
		description: `Guard: ${r.guard_name}`,
		icon: <Shield className='w-3.5 h-3.5' />,
	}));

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<createUserType>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmed_password: "",
			roles: [],
			avatar: undefined,
		},
	});

	const onSubmit = async (data: createUserType) => {
		try {
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("email", data.email);
			formData.append("password", data.password);
			formData.append("password_confirmation", data.confirmed_password);
			data.roles?.forEach((role) => formData.append("roles[]", role));
			if (data.avatar) formData.append("avatar", data.avatar);

			await createUser(formData, {
				onSuccess: () => {
					reset();
					closeRef.current?.click();
				},
			});
		} catch (err) {
			console.error("Error creating user:", err);
		}
	};

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

				{/* ════ Basic Information ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("basic-info-section")}
					</h6>
					<Separator />
				</div>

				{/* Name */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("name-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<div className='relative'>
						<User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rtl:left-[unset] rtl:right-3' />
						<Input
							className='h-12 pl-9 pr-4 rtl:pr-9 rtl:pl-4'
							placeholder={t("name-placeholder")}
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
						{t("email-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<div className='relative'>
						<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none rtl:left-[unset] rtl:right-3' />
						<Input
							type='email'
							className='h-12 pl-9 pr-4 rtl:pr-9 rtl:pl-4'
							placeholder={t("email-placeholder")}
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
						{t("roles-label")}
					</Label>
					<Controller
						name='roles'
						control={control}
						render={({ field }) => (
							<MultiSelect
								value={field.value ?? []}
								onChange={field.onChange}
								options={rolesOptions}
								isLoading={rolesLoading}
								placeholder={t("roles-placeholder")}
								searchPlaceholder='Search roles...'
								error={errors.roles?.message as string | undefined}
							/>
						)}
					/>
				</div>

				{/* ════ Password ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("password-section")}
					</h6>
					<Separator className='mb-4' />
					<ChangePasswordContent
						isEditing={false}
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
						{t("cancel-button-text")}
					</Button>
				</DialogClose>
				<Button
					type='submit'
					disabled={isCreating}
					className='h-12 text-base px-14 rounded-lg'>
					{isCreating ? (
						<>
							<Loader2 className='animate-spin h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2' />
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

export default CreateNewUser;
