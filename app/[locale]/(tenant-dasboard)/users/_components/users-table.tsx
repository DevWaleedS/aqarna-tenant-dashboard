"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	BadgeCheck,
	Eye,
	Loader2,
	Pencil,
	Shield,
	Trash2,
	User,
	XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import EditCurrentUser from "./edit-current-user";
import ShowCurrentUser from "./show-current-user";
import { cn } from "@/lib/utils";

interface UsersTableProps {
	users: any[];
	isLoading: boolean;
	searchQuery?: string;
	onDelete: (id: string | number) => void;
	selectedIds: (string | number)[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string | number, checked: boolean) => void;
	isAllSelected: boolean;
}

const UsersTable = ({
	users,
	isLoading,
	searchQuery,
	onDelete,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: UsersTableProps) => {
	const t = useTranslations("tenant.users");
	const conformMessages = useTranslations("confirmation-dialog");
	const showT = useTranslations("tenant.users.show-current-user-page");

	const someSelected =
		selectedIds.length > 0 && selectedIds.length < users.length;

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{searchQuery
						? t("no_users_found_matching_search")
						: t("no_users_available")}
				</p>
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
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.user")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.email")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.roles")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.verified")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.joined")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("table.actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{users.map((user: any) => {
					const isSelected = selectedIds.includes(user.id);
					const isVerified = !!user.email_verified_at;

					return (
						<TableRow key={user.id}>
							{/* Checkbox */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(user.id, checked as boolean)
									}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							{/* Avatar + Name */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<div className='flex items-center gap-3'>
									<div className='relative shrink-0'>
										{user.avatar ? (
											<img
												src={user.avatar}
												alt={user.name}
												className='w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-slate-700'
											/>
										) : (
											<div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center'>
												<User className='w-4.5 h-4.5 text-primary/60' />
											</div>
										)}
										{/* Verified dot on avatar */}
										<div
											className={cn(
												"absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900",
												isVerified
													? "bg-green-500"
													: "bg-neutral-300 dark:bg-slate-600",
											)}
										/>
									</div>
									<div>
										<p className='text-sm font-semibold text-neutral-800 dark:text-neutral-100'>
											{user.name ?? "—"}
										</p>
										<p className='text-xs text-neutral-400 dark:text-neutral-500'>
											#{user.id}
										</p>
									</div>
								</div>
							</TableCell>

							{/* Email */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-sm text-neutral-600 dark:text-neutral-300'>
								{user.email ?? "—"}
							</TableCell>

							{/* Roles */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								{user.roles?.length > 0 ? (
									<div className='flex flex-wrap gap-1'>
										{user.roles.slice(0, 2).map((role: string) => (
											<span
												key={role}
												className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium capitalize'>
												<Shield className='w-2.5 h-2.5' />
												{role}
											</span>
										))}
										{user.roles.length > 2 && (
											<span className='px-2 py-0.5 text-[11px] rounded-full bg-neutral-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400'>
												+{user.roles.length - 2}
											</span>
										)}
									</div>
								) : (
									<span className='text-xs text-neutral-400 dark:text-neutral-500 italic'>
										{t("no-roles")}
									</span>
								)}
							</TableCell>

							{/* Email verified */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{isVerified ? (
									<span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium'>
										<BadgeCheck className='w-3 h-3' />
										{t("verified")}
									</span>
								) : (
									<span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-slate-700 text-neutral-500 dark:text-neutral-400 text-xs font-medium'>
										<XCircle className='w-3 h-3' />
										{t("unverified")}
									</span>
								)}
							</TableCell>

							{/* Joined date */}
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm text-neutral-500 dark:text-neutral-400'>
								{user.created_at
									? format(parseISO(user.created_at), "dd MMM yyyy")
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
												className='btn px-2.5! py-2.5! flex items-center bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
												<Trash2 className='w-5 h-5 shrink-0' />
											</Button>
										}
										onConfirm={() => onDelete(user.id)}>
										{conformMessages("delete-message")}
									</ConfirmationDialog>

									<PagesDialog
										pageTitle={showT("edit-title")}
										className='max-w-2xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'>
												<Pencil className='w-4 h-4' />
											</Button>
										}>
										<EditCurrentUser userId={user.id} />
									</PagesDialog>

									<PagesDialog
										pageTitle={showT("title")}
										className='max-w-xl!'
										button={
											<Button
												size='icon'
												variant='ghost'
												className='rounded-[50%] text-blue-500 bg-primary/10 hover:bg-primary/20'>
												<Eye className='w-5 h-5' />
											</Button>
										}>
										<ShowCurrentUser userId={user.id} />
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

export default UsersTable;
