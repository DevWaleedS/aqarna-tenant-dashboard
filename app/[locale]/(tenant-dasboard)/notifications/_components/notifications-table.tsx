"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";

import Image from "next/image";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";

interface NotificationsTableProps {
	notifications: any[];
	isLoading: boolean;
	onMarkAsRead: (id: string) => void;
	onDelete: (id: string) => void;
	selectedIds: string[];
	onSelectAll: (checked: boolean) => void;
	onSelectOne: (id: string, checked: boolean) => void;
	isAllSelected: boolean;
}

const NotificationsTable = ({
	notifications,
	isLoading,
	onMarkAsRead,
	onDelete,
	selectedIds,
	onSelectAll,
	onSelectOne,
	isAllSelected,
}: NotificationsTableProps) => {
	const t = useTranslations("notifications");
	const conformMessages = useTranslations("confirmation-dialog");

	// Check if some (but not all) notifications are selected
	const someSelected =
		selectedIds.length > 0 && selectedIds.length < notifications.length;

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (notifications.length === 0) {
		return (
			<div className='flex justify-center items-center py-12 text-neutral-500 dark:text-neutral-400'>
				{t("no_notifications")}
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
								if (el) {
									(el as any).indeterminate = someSelected;
								}
							}}
						/>
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.title")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.message")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.status")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.time")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("table.actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{notifications.map((notification: any, index: number) => {
					const isLastRow = index === notifications.length - 1;
					const isSelected = selectedIds.includes(notification.id);
					const isRead = !!notification.read_at;

					return (
						<TableRow
							key={notification.id}
							className={!isRead ? "bg-primary/5" : ""}>
							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<Checkbox
									checked={isSelected}
									onCheckedChange={(checked) =>
										onSelectOne(notification.id, checked as boolean)
									}
									id={`notification-${notification.id}`}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<div className='flex items-center gap-2'>
									{!isRead && (
										<span className='w-2 h-2 rounded-full bg-primary'></span>
									)}

									<div
										className='shrink-0 relative w-7 h-7 flex justify-center items-center rounded-full'
										style={{
											backgroundColor: notification.data.color + "33",
										}}>
										<div style={{ color: notification.data.color }}>
											<Image
												src={notification?.data?.icon}
												alt='notification icon'
												width={15}
												height={15}
											/>
										</div>
									</div>
									<span className={!isRead ? "font-semibold" : ""}>
										{notification.title}
									</span>
								</div>
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
								<span className='line-clamp-2'>{notification.message}</span>
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${
										isRead
											? "bg-neutral-100 text-neutral-600 dark:bg-slate-700 dark:text-neutral-300"
											: "bg-primary/10 text-primary"
									}`}>
									{isRead ? t("status.read") : t("status.unread")}
								</span>
							</TableCell>

							<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
								{formatDistanceToNow(new Date(notification.created_at), {
									addSuffix: true,
								})}
							</TableCell>

							<TableCell
								className={`py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e ${
									isLastRow ? "rounded-br-lg rtl:rounded-bl-lg" : ""
								} text-center`}>
								<div className='flex justify-center items-center gap-2'>
									{!isRead && (
										<Button
											size='icon'
											variant='ghost'
											onClick={() => onMarkAsRead(notification.id)}
											className='btn px-2.5! py-2.5! flex items-center bg-primary/10 text-primary hover:text-primary/90 hover:bg-primary/5 dark:text-white'>
											<Eye className='w-5 h-5 shrink-0' />
										</Button>
									)}

									<ConfirmationDialog
										type='danger'
										title={conformMessages("title")}
										icon={<Trash2 className='w-5 h-5' />}
										trigger={
											<Button
												type='button'
												className='btn px-2.5! py-2.5! flex items-center bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
												<Trash2 className='w-5 h-5 shrink-0' />
											</Button>
										}
										onConfirm={() => onDelete(notification.id)}>
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

export default NotificationsTable;
