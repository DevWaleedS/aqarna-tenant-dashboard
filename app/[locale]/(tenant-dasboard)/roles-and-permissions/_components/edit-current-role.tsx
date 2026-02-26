"use client";

import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Info, Loader2, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateRoleSchema, updateRoleType } from "@/lib/zod";
import { useRole, useRoles } from "@/hooks/queries/tenants/useRoles";
import PermissionsPicker from "./permissions-picker";

// TODO: replace with usePermissions() hook when available
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

interface EditCurrentRoleProps {
	roleId: number | string;
	onClose?: () => void;
}

const EditCurrentRole = ({ roleId, onClose }: EditCurrentRoleProps) => {
	const tEdit = useTranslations("tenant.roles.edit-page");
	const tCreate = useTranslations("tenant.roles.create-page");
	const closeRef = useRef<HTMLButtonElement>(null);

	const { role, isLoading } = useRole(roleId);
	const { updateRole, isUpdating } = useRoles();

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
	} = useForm<updateRoleType>({
		resolver: zodResolver(updateRoleSchema),
		defaultValues: { name: "", permissions: [] },
	});

	useEffect(() => {
		if (!role) return;
		reset({
			name: role.name ?? "",
			permissions: role.permissions ?? [],
		});
	}, [role, reset]);

	const selectedPermissions = watch("permissions");

	const onSubmit = async (data: updateRoleType) => {
		try {
			await updateRole(
				{
					id: roleId,
					data: { name: data.name, permissions: data.permissions ?? [] },
				},
				{
					onSuccess: () => {
						closeRef.current?.click();
						onClose?.();
					},
				},
			);
		} catch (err) {
			console.error("Error updating role:", err);
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8 text-primary' />
			</div>
		);
	}

	if (!role) {
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
				{/* ════ Role name ════ */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{tEdit("name-label")}
					</Label>
					<Input
						className='h-12 px-4'
						placeholder={tEdit("name-placeholder")}
						{...register("name")}
					/>
					{errors.name ? (
						<p className='text-red-500 text-xs mt-1.5'>{errors.name.message}</p>
					) : (
						<p className='flex items-center gap-1 text-neutral-400 dark:text-neutral-500 text-xs mt-1.5'>
							<Info className='w-3 h-3' />
							{tCreate("name-hint")}
						</p>
					)}
				</div>

				{/* ════ Permissions ════ */}
				<div className='col-span-12'>
					<div className='flex items-center justify-between mb-3'>
						<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2'>
							<Shield className='w-4 h-4 text-primary' />
							{tEdit("permissions-section")}
						</h6>
						{selectedPermissions.length > 0 && (
							<span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary'>
								{selectedPermissions.length} selected
							</span>
						)}
					</div>
					<Separator className='mb-4' />

					<Controller
						name='permissions'
						control={control}
						render={({ field }) => (
							<PermissionsPicker
								available={AVAILABLE_PERMISSIONS}
								value={field.value ?? []}
								onChange={field.onChange}
								searchPlaceholder={tCreate("search-permissions")}
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
						{tEdit("cancel-button-text")}
					</Button>
				</DialogClose>
				<Button
					type='submit'
					disabled={isUpdating}
					className='h-12 text-base px-14 rounded-lg gap-2'>
					{isUpdating ? (
						<>
							<Loader2 className='animate-spin h-4 w-4' />
							{tEdit("save-button-loading-text")}
						</>
					) : (
						<>
							<Shield className='h-4 w-4' />
							{tEdit("save-button-text")}
						</>
					)}
				</Button>
			</div>
		</form>
	);
};

export default EditCurrentRole;
