"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import MultiFunctionsTable from "@/components/multi-functions-table";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import { useRoles } from "@/hooks/queries/tenants/useRoles";

import CreateNewRole from "./_components/create-new-role";
import RolesTable from "./_components/roles-table";

const Roles = () => {
	const t = useTranslations("tenant.roles");
	const conformMessages = useTranslations("confirmation-dialog");

	const { roles, isLoading, deleteRole } = useRoles();

	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
	const itemsPerPage = 10;

	// ── Filter ────────────────────────────────────────────────────────────────
	const filteredRoles = roles.filter((role: any) =>
		role.name?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// ── Pagination ────────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
	const paginatedRoles = filteredRoles.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	// ── Handlers ─────────────────────────────────────────────────────────────
	const handleSelectAll = (checked: boolean) =>
		setSelectedIds(checked ? paginatedRoles.map((r: any) => r.id) : []);

	const handleSelectOne = (id: string | number, checked: boolean) =>
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((sid) => sid !== id),
		);

	const handleDelete = async (id: string | number) => {
		await deleteRole(id);
		setSelectedIds((prev) => prev.filter((sid) => sid !== id));
	};

	const handleDeleteSelected = async () => {
		for (const id of selectedIds) await deleteRole(id);
		setSelectedIds([]);
	};

	const isAllSelected =
		paginatedRoles.length > 0 && selectedIds.length === paginatedRoles.length;

	// ── Summary stats ─────────────────────────────────────────────────────────
	const totalPermissions = roles.reduce(
		(sum: number, r: any) => sum + (r.permissions_count ?? 0),
		0,
	);

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			{/* ── Summary strip ───────────────────────────────────────────── */}
			{roles.length > 0 && (
				<div className='mt-5 grid grid-cols-2 sm:grid-cols-2 gap-3'>
					{[
						{
							icon: <Shield className='w-5 h-5' />,
							label: "Total Roles",
							value: roles.length,
							color: "bg-primary/10 text-primary",
						},
						{
							icon: <ShieldCheck className='w-5 h-5' />,
							label: "Total Permissions",
							value: totalPermissions,
							color:
								"bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
						},
					].map(({ icon, label, value, color }) => (
						<div
							key={label}
							className='flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900'>
							<div
								className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
								{icon}
							</div>
							<div>
								<p className='text-xs text-neutral-400 dark:text-neutral-500'>
									{label}
								</p>
								<p className='text-xl font-extrabold text-neutral-800 dark:text-neutral-100 tabular-nums'>
									{value}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			<MultiFunctionsTable
				AddNewPageButton={
					<PagesDialog
						button={
							<Button className='w-auto h-11 gap-2'>
								<Plus className='w-4 h-4' />
								{t("create-new-role")}
							</Button>
						}
						pageTitle={t("create-new-role")}>
						<CreateNewRole />
					</PagesDialog>
				}
				searchPlaceholder={t("search-placeholder")}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				totalItems={filteredRoles.length}
				selectedCount={selectedIds.length}
				customBulkActions={
					selectedIds.length > 0 && (
						<div className='w-full flex items-center justify-between gap-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300'>
							<span className='text-sm font-medium text-neutral-900 dark:text-white'>
								{selectedIds.length} {t("bulk_actions.selected")}
							</span>
							<ConfirmationDialog
								type='danger'
								confirmText={conformMessages("confirm-delete-button-text")}
								title={conformMessages("title")}
								icon={<Trash2 className='w-5 h-5' />}
								trigger={
									<Button
										size='sm'
										className='h-9 text-xs gap-1.5 bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200'>
										<Trash2 className='w-3.5 h-3.5' />
										{t("bulk_actions.delete-selected")}
									</Button>
								}
								onConfirm={handleDeleteSelected}>
								{conformMessages("delete-message")}
							</ConfirmationDialog>
						</div>
					)
				}>
				<RolesTable
					roles={paginatedRoles}
					isLoading={isLoading}
					searchQuery={searchQuery}
					onDelete={handleDelete}
					selectedIds={selectedIds}
					onSelectAll={handleSelectAll}
					onSelectOne={handleSelectOne}
					isAllSelected={isAllSelected}
				/>
			</MultiFunctionsTable>
		</>
	);
};

export default Roles;
