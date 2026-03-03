"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Eye, Loader2, Pencil, Shield, ShieldOff, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import EditCurrentRole from "./edit-current-role";
import ShowCurrentRole from "./show-current-role";

interface RolesTableProps {
	roles: any[];
	isLoading: boolean;
	searchQuery?: string;
	onDelete: (id: string | number) => void;
	selectedIds: (string | number)[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string | number, checked: boolean) => void;
	isAllSelected: boolean;
}

// Color bands cycling for role avatars
const ROLE_COLORS = [
	"bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
	"bg-blue-100   dark:bg-blue-900/30   text-blue-600   dark:text-blue-400",
	"bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
	"bg-amber-100  dark:bg-amber-900/30  text-amber-600  dark:text-amber-400",
	"bg-rose-100   dark:bg-rose-900/30   text-rose-600   dark:text-rose-400",
];

const RolesTable = ({
	roles,
	isLoading,
	searchQuery,
	onDelete,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: RolesTableProps) => {
	const t = useTranslations("tenant.roles");
	const conformMessages = useTranslations("confirmation-dialog");
	const showT = useTranslations("tenant.roles.show-page");

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < roles.length;

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8 text-primary' />
			</div>
		);
	}

	if (roles.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-16 gap-3 text-neutral-400 dark:text-neutral-500'>
				<ShieldOff className='w-10 h-10 opacity-40' />
				<p className='text-base font-medium'>
					{searchQuery ? t("no_roles_found") : t("no_roles_available")}
				</p>
				{!searchQuery && (
					<p className='text-sm text-neutral-400 dark:text-neutral-500'>
						{t("no_roles_available_desc")}
					</p>
				)}
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
							checked={isAllSelected}
							onCheckedChange={onSelectAll}
							ref={(el) => {
								if (el) (el as any).indeterminate = someSelected;
							}}
						/>
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12'>
						{t("table.role")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12'>
						{t("table.guard")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12'>
						{t("table.permissions")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12 text-center'>
						{t("table.created")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("table.actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{roles.map((role: any, idx: number) => {
					const isSelected = selectedIds.includes(role.id);
					const colorClass = ROLE_COLORS[idx % ROLE_COLORS.length];
					const initials = role.name?.slice(0, 2).toUpperCase() ?? "??";

					return (
						<TableRow key={role.id}>
							{/* Checkbox */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(role.id, checked as boolean)
									}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							{/* Role name + avatar */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<div className='flex items-center gap-3'>
									<div
										className={cn(
											"w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0",
											colorClass,
										)}>
										{initials}
									</div>
									<div>
										<p className='text-sm font-bold text-neutral-800 dark:text-neutral-100 capitalize'>
											{role.name}
										</p>
										<p className='text-xs text-neutral-400 dark:text-neutral-500 font-mono'>
											#{role.id}
										</p>
									</div>
								</div>
							</TableCell>

							{/* Guard */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<span className='text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400'>
									{role.guard_name}
								</span>
							</TableCell>

							{/* Permissions count */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								{role.permissions_count > 0 ? (
									<div className='flex items-center gap-2'>
										<div className='flex-1 max-w-28 h-1.5 rounded-full bg-neutral-100 dark:bg-slate-700 overflow-hidden'>
											<div
												className='h-full rounded-full bg-primary transition-all'
												style={{
													width: `${Math.min(100, (role.permissions_count / 40) * 100)}%`,
												}}
											/>
										</div>
										<span className='text-sm font-bold text-neutral-800 dark:text-neutral-100 tabular-nums'>
											{role.permissions_count}
										</span>
										<span className='text-xs text-neutral-400 dark:text-neutral-500'>
											perms
										</span>
									</div>
								) : (
									<span className='text-xs italic text-neutral-400 dark:text-neutral-500'>
										{t("no-permissions")}
									</span>
								)}
							</TableCell>

							{/* Created date */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm text-neutral-500 dark:text-neutral-400'>
								{role.created_at
									? format(parseISO(role.created_at), "dd MMM yyyy")
									: "—"}
							</TableCell>

							{/* Actions */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<div className='flex justify-center items-center gap-2'>
									<ConfirmationDialog
										type='danger'
										confirmText={conformMessages("confirm-delete-button-text")}
										title={conformMessages("title")}
										icon={<Trash2 className='w-5 h-5' />}
										trigger={
											<Button
												type='button'
												className='btn px-2.5! py-2.5! bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
												<Trash2 className='w-4 h-4 shrink-0' />
											</Button>
										}
										onConfirm={() => onDelete(role.id)}>
										{conformMessages("delete-message")}
									</ConfirmationDialog>

									<PagesDialog
										pageTitle={showT("edit-button-text")}
										className='max-w-2xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'>
												<Pencil className='w-4 h-4' />
											</Button>
										}>
										<EditCurrentRole roleId={role.id} />
									</PagesDialog>

									<PagesDialog
										pageTitle={showT("title")}
										className='max-w-lg!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-blue-500 bg-primary/10 hover:bg-primary/20'>
												<Eye className='w-5 h-5' />
											</Button>
										}>
										<ShowCurrentRole roleId={role.id} />
									</PagesDialog>
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
