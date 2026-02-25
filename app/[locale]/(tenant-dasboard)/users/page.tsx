"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import MultiFunctionsTable from "@/components/multi-functions-table";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import { cn } from "@/lib/utils";

import UsersTable from "./_components/users-table";
import CreateNewUser from "./_components/create-new-user";
import { useUsers } from "@/hooks/queries/tenants/useUsersQuery";

const ROLE_OPTIONS = ["all", "admin", "manager", "staff", "viewer"];

const Users = () => {
	const t = useTranslations("tenant.users");
	const conformMessages = useTranslations("confirmation-dialog");
	const bulkMessages = useTranslations("tenant.users.bulk_actions");

	const { users, isLoading, deleteUser } = useUsers();

	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
	const itemsPerPage = 10;

	// ── Filter ────────────────────────────────────────────────────────────────
	const filteredUsers = users.filter((user: any) => {
		const name = (user.name ?? "").toLowerCase();
		const email = (user.email ?? "").toLowerCase();
		const query = searchQuery.toLowerCase();

		const matchesSearch = name.includes(query) || email.includes(query);

		const matchesRole =
			roleFilter === "all" ||
			(user.roles ?? []).some((r: string) => r.toLowerCase() === roleFilter);

		return matchesSearch && matchesRole;
	});

	// ── Pagination ────────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedUsers = filteredUsers.slice(
		startIndex,
		startIndex + itemsPerPage,
	);

	// ── Handlers ─────────────────────────────────────────────────────────────
	const handlePageChange = (page: number) => setCurrentPage(page);

	const handleSelectAll = (checked: boolean) => {
		setSelectedIds(checked ? paginatedUsers.map((u: any) => u.id) : []);
	};

	const handleSelectOne = (id: string | number, checked: boolean) => {
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((sid) => sid !== id),
		);
	};

	const handleDelete = async (id: string | number) => {
		await deleteUser(id);
	};

	const handleDeleteSelected = async () => {
		for (const id of selectedIds) {
			await deleteUser(id);
		}
		setSelectedIds([]);
	};

	const isAllSelected =
		paginatedUsers.length > 0 && selectedIds.length === paginatedUsers.length;

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			<MultiFunctionsTable
				AddNewPageButton={
					<PagesDialog
						button={
							<Button className={cn("w-auto h-11 gap-2")}>
								<Plus className='w-4 h-4' />
								{t("create-new-user")}
							</Button>
						}
						pageTitle={t("create-new-user")}>
						<CreateNewUser />
					</PagesDialog>
				}
				searchPlaceholder={t("search-placeholder")}
				filterByStatusPlaceholder={t("filter-by-role")}
				searchQuery={searchQuery}
				statusOptions={ROLE_OPTIONS}
				onSearchChange={setSearchQuery}
				statusFilter={roleFilter}
				onStatusChange={setRoleFilter}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				totalItems={filteredUsers.length}
				selectedCount={selectedIds.length}
				customBulkActions={
					selectedIds.length > 0 && (
						<div className='w-full flex items-center justify-between gap-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300'>
							<span className='text-sm font-medium text-neutral-900 dark:text-white'>
								{selectedIds.length} {bulkMessages("selected")}
							</span>
							<ConfirmationDialog
								type='danger'
								confirmText={conformMessages("confirm-delete-button-text")}
								title={conformMessages("title")}
								icon={<Trash2 className='w-5 h-5' />}
								trigger={
									<Button
										size='sm'
										className='btn px-3! py-2! flex items-center gap-1.5 bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30 h-9 text-xs'>
										<Trash2 className='w-3.5 h-3.5' />
										{bulkMessages("delete-selected")}
									</Button>
								}
								onConfirm={handleDeleteSelected}>
								{conformMessages("message_multiple_delete", {
									count: selectedIds.length,
								})}
							</ConfirmationDialog>
						</div>
					)
				}>
				<UsersTable
					users={paginatedUsers}
					isLoading={isLoading}
					onDelete={handleDelete}
					selectedIds={selectedIds}
					onSelectAll={handleSelectAll}
					onSelectOne={handleSelectOne}
					isAllSelected={isAllSelected}
					searchQuery={searchQuery}
				/>
			</MultiFunctionsTable>
		</>
	);
};

export default Users;
