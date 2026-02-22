"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { SquarePen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";

import { format } from "date-fns";
import EditRole from "./edit-role/form-validation";
import { useRoles } from "@/hooks/queries/central/UseRoles";
import PagesDialog from "@/components/dailogs/pages-dialog";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";

interface RolesTableProps {
	roles: any[];
	selectedRoles: number[];
	setSelectedRoles: React.Dispatch<React.SetStateAction<number[]>>;
}

const RolesTable = ({
	roles,
	selectedRoles,
	setSelectedRoles,
}: RolesTableProps) => {
	const { deleteRole, isDeleting } = useRoles();
	const t = useTranslations("central.roles-and-permissions.roles-table");
	const conformMessages = useTranslations("confirmation-dialog");

	const handleSelectRole = (roleId: number) => {
		setSelectedRoles((prev) =>
			prev.includes(roleId)
				? prev.filter((id) => id !== roleId)
				: [...prev, roleId],
		);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedRoles(roles.map((role: any) => role.id));
		} else {
			setSelectedRoles([]);
		}
	};

	const handleDeleteRole = (roleId: number) => {
		deleteRole(roleId.toString());
	};

	// Check if all current page roles are selected
	const allSelected =
		roles.length > 0 &&
		roles.every((role: any) => selectedRoles.includes(role.id));

	// Check if some (but not all) current page roles are selected
	const someSelected =
		roles.some((role: any) => selectedRoles.includes(role.id)) && !allSelected;

	if (roles.length === 0) {
		return (
			<div className='flex justify-center items-center py-12 text-neutral-500 dark:text-neutral-400'>
				{t("no_roles_found")}
			</div>
		);
	}

	return (
		<Table className='table-auto border-spacing-0 border-separate'>
			<TableHeader>
				<TableRow className='border-0'>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-s rounded-tl-lg rtl:rounded-tl-none rtl:rounded-tr-lg text-center'>
						<Checkbox
							className='border border-neutral-500 w-4.5 h-4.5 mt-1'
							checked={allSelected}
							onCheckedChange={handleSelectAll}
							ref={(el) => {
								if (el) {
									(el as any).indeterminate = someSelected;
								}
							}}
						/>
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("role_name")}
					</TableHead>

					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("guard_name")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("permissions_count")}
					</TableHead>

					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("date")}
					</TableHead>

					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{roles.map((role: any, index: number) => {
					const isLastRow = index === roles.length - 1;
					const isSelected = selectedRoles.includes(role.id);

					return (
						<TableRow key={role.id}>
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={() => handleSelectRole(role.id)}
									id={`role-${role.id}`}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{role.name}
							</TableCell>
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{role.guard_name}
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{role.permissions_count}
							</TableCell>
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{format(new Date(role.created_at), "dd MMM yyyy")}
							</TableCell>

							<TableCell
								className={`py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e ${
									isLastRow ? "rounded-br-lg" : ""
								} text-center`}>
								<div className='flex justify-center items-center gap-2'>
									<PagesDialog
										pageTitle={t("edit_role")}
										button={
											<Button
												size='icon'
												variant='ghost'
												className='btn px-2.5! py-2.5! flex items-center bg-primary/10 text-primary hover:text-primary/90 hover:bg-primary/5 dark:text-white'>
												<SquarePen className='w-5 h-5 shrink-0' />
											</Button>
										}>
										<EditRole roleId={role.id} />
									</PagesDialog>

									<ConfirmationDialog
										type='danger'
										title={conformMessages("title")}
										icon={<Trash2 className='w-5 h-5' />}
										trigger={
											<Button
												type='button'
												disabled={isDeleting}
												className='btn px-2.5! py-2.5! flex items-center bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
												<Trash2 className='w-5 h-5 shrink-0' />
											</Button>
										}
										onConfirm={() => handleDeleteRole(role.id)}>
										{conformMessages("message")}
									</ConfirmationDialog>
								</div>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

export default RolesTable;
