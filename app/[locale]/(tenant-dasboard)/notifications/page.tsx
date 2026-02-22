"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useTranslations } from "next-intl";
import NotificationsTable from "./_components/notifications-table";

import { Button } from "@/components/ui/button";
import { CheckCheck, Trash2 } from "lucide-react";

import { useState } from "react";
import { useNotifications } from "@/hooks/queries/central/useNotification";
import MultiFunctionsTable from "@/components/multi-functions-table";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";

const Notifications = () => {
	const t = useTranslations("notifications");
	const conformMessages = useTranslations("confirmation-dialog");
	const bulkMessages = useTranslations("notifications.bulk_actions");
	const {
		notifications,
		isLoading,
		markAllAsRead,
		markAsRead,
		deleteNotification,
	} = useNotifications();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const itemsPerPage = 10;

	const statusOptions = ["all", "Read", "Unread"];

	// Filter notifications
	const filteredNotifications = notifications.filter((notification: any) => {
		const matchesSearch =
			notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			notification.message.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "unread" && !notification.read_at) ||
			(statusFilter === "read" && notification.read_at);

		return matchesSearch && matchesStatus;
	});

	// Calculate pagination
	const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedNotifications = filteredNotifications.slice(
		startIndex,
		endIndex,
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(paginatedNotifications.map((n: any) => n.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectOne = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedIds([...selectedIds, id]);
		} else {
			setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
		}
	};

	const handleMarkSelectedAsRead = async () => {
		const unreadSelected = selectedIds.filter((id) => {
			const notification = notifications.find((n: any) => n.id === id);
			return notification && !notification.read_at;
		});

		for (const id of unreadSelected) {
			await markAsRead(id);
		}
		setSelectedIds([]);
	};

	const handleDeleteSelected = async () => {
		for (const id of selectedIds) {
			await deleteNotification(id);
		}
		setSelectedIds([]);
	};

	const isAllSelected =
		paginatedNotifications.length > 0 &&
		selectedIds.length === paginatedNotifications.length;

	const hasUnreadSelected = selectedIds.some((id) => {
		const notification = notifications.find((n: any) => n.id === id);
		return notification && !notification.read_at;
	});

	return (
		<>
			<DashboardBreadcrumb title={t("title")} text={t("title")} />

			<MultiFunctionsTable
				searchPlaceholder={t("search_placeholder")}
				filterByStatusPlaceholder={t("filter_by_status")}
				searchQuery={searchQuery}
				statusOptions={statusOptions}
				onSearchChange={setSearchQuery}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				totalItems={filteredNotifications.length}
				selectedCount={selectedIds.length}
				customBulkActions={
					selectedIds.length > 0 && (
						<div className='w-full flex items-center justify-between gap-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300'>
							<span className='text-sm font-medium text-neutral-900 dark:text-white'>
								{selectedIds.length} {bulkMessages("selected")}
							</span>
							<div className='flex items-center gap-2'>
								{hasUnreadSelected && (
									<Button
										size='sm'
										variant='outline'
										onClick={handleMarkSelectedAsRead}
										className='bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'>
										<CheckCheck className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
										{bulkMessages("mark_as_read")}
									</Button>
								)}
								<ConfirmationDialog
									type='danger'
									title={conformMessages("title")}
									icon={<Trash2 className='w-5 h-5' />}
									trigger={
										<Button
											size='sm'
											variant='destructive'
											className='bg-red-500 hover:bg-red-600'>
											<Trash2 className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
											{bulkMessages("delete")}
										</Button>
									}
									onConfirm={handleDeleteSelected}>
									{conformMessages("message_multiple", {
										count: selectedIds.length,
									})}
								</ConfirmationDialog>
							</div>
						</div>
					)
				}
				hasUnreadSelected={hasUnreadSelected}>
				<NotificationsTable
					notifications={paginatedNotifications}
					isLoading={isLoading}
					onMarkAsRead={markAsRead}
					onDelete={deleteNotification}
					selectedIds={selectedIds}
					onSelectAll={handleSelectAll}
					onSelectOne={handleSelectOne}
					isAllSelected={isAllSelected}
				/>
			</MultiFunctionsTable>
		</>
	);
};

export default Notifications;
