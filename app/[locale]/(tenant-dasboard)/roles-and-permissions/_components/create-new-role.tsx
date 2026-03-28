"use client";

import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Info, Loader2, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { createRoleSchema, createRoleType } from "@/lib/zod";
import { useRoles } from "@/hooks/queries/useRoles";
import PermissionsPicker from "./permissions-picker";

// TODO: replace with usePermissions() hook when API is available
const AVAILABLE_PERMISSIONS = [
	"users.read",
	"users.create",
	"users.update",
	"users.delete",
	"roles.read",
	"roles.create",
	"roles.update",
	"roles.delete",
	"properties.read",
	"properties.create",
	"properties.update",
	"properties.delete",
	"units.read",
	"units.create",
	"units.update",
	"units.delete",
	"contracts.read",
	"contracts.create",
	"contracts.update",
	"contracts.delete",
	"customers.read",
	"customers.create",
	"customers.update",
	"customers.delete",
	"maintenance.read",
	"maintenance.create",
	"maintenance.update",
	"maintenance.delete",
	"meters.read",
	"meters.create",
	"meters.update",
	"meters.delete",
	"reports.read",
	"reports.export",
	"settings.read",
	"settings.update",
];

const CreateNewRole = () => {
	const t = useTranslations("tenant.roles.create-page");
	const closeRef = useRef<HTMLButtonElement>(null);
	const { createRole, isCreating } = useRoles();

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
	} = useForm<createRoleType>({
		resolver: zodResolver(createRoleSchema),
		defaultValues: { name: "", permissions: [] },
	});

	const selectedPermissions = watch("permissions");

	const onSubmit = async (data: createRoleType) => {
		try {
			await createRole(
				{ name: data.name, permissions: data.permissions },
				{
					onSuccess: () => {
						reset();
						closeRef.current?.click();
					},
				},
			);
		} catch (err) {
			console.error("Error creating role:", err);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-4'>
				{/* ════ Role name ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1 flex items-center gap-2'>
						<Shield className='w-4 h-4 text-primary' />
						{t("name-section")}
					</h6>
					<Separator className='mb-4' />

					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("name-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={t("name-placeholder")}
						{...register("name")}
					/>
					{errors.name ? (
						<p className='text-red-500 text-xs mt-1.5'>{errors.name.message}</p>
					) : (
						<p className='flex items-center gap-1 text-neutral-400 dark:text-neutral-500 text-xs mt-1.5'>
							<Info className='w-3 h-3' />
							{t("name-hint")}
						</p>
					)}
				</div>

				{/* ════ Permissions ════ */}
				<div className='col-span-12'>
					<div className='flex items-center justify-between mb-1'>
						<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2'>
							<Shield className='w-4 h-4 text-primary' />
							{t("permissions-section")}
						</h6>
						{selectedPermissions.length > 0 && (
							<span className='text-xs text-neutral-400 dark:text-neutral-500'>
								{t("selected-count", { count: selectedPermissions.length })}
							</span>
						)}
					</div>
					<p className='text-xs text-neutral-400 dark:text-neutral-500 mb-3'>
						{t("permissions-hint")}
					</p>
					<Separator className='mb-4' />

					<Controller
						name='permissions'
						control={control}
						render={({ field }) => (
							<PermissionsPicker
								available={AVAILABLE_PERMISSIONS}
								value={field.value}
								onChange={field.onChange}
								searchPlaceholder={t("search-permissions")}
								error={errors.permissions?.message as string | undefined}
							/>
						)}
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
					className='h-12 text-base px-14 rounded-lg gap-2'>
					{isCreating ? (
						<>
							<Loader2 className='animate-spin h-4 w-4' />
							{t("save-button-loading-text")}
						</>
					) : (
						<>
							<Shield className='h-4 w-4' />
							{t("save-button-text")}
						</>
					)}
				</Button>
			</div>
		</form>
	);
};

export default CreateNewRole;
