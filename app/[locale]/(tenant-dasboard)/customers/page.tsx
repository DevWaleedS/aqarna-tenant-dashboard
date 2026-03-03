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
import { useCustomers } from "@/hooks/queries/useCustomers";

import CustomersTable from "./_components/customers-table";
import CreateNewCustomer from "./_components/create-new-customer";

const STATUS_OPTIONS = ["all", "active", "inactive", "blacklisted"];

const Customers = () => {
	const t = useTranslations("tenant.customers");
	const conformMessages = useTranslations("confirmation-dialog");
	const bulkMessages = useTranslations("tenant.customers.bulk_actions");

	const { customers, isLoading, deleteCustomer } = useCustomers();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
	const itemsPerPage = 10;

	// ── Filter ───────────────────────────────────────────────────────────────
	const filteredCustomers = customers.filter((customer: any) => {
		const name = (customer.name ?? "").toLowerCase();
		const email = (customer.email ?? "").toLowerCase();
		const phone = (customer.phone ?? "").toLowerCase();
		const query = searchQuery.toLowerCase();

		const matchesSearch =
			name.includes(query) || email.includes(query) || phone.includes(query);

		const matchesStatus =
			statusFilter === "all" || customer.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// ── Pagination ───────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedCustomers = filteredCustomers.slice(
		startIndex,
		startIndex + itemsPerPage,
	);

	// ── Handlers ─────────────────────────────────────────────────────────────
	const handlePageChange = (page: number) => setCurrentPage(page);

	const handleSelectAll = (checked: boolean) => {
		setSelectedIds(checked ? paginatedCustomers.map((c: any) => c.id) : []);
	};

	const handleSelectOne = (id: string | number, checked: boolean) => {
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((sid) => sid !== id),
		);
	};

	const handleDelete = async (id: string | number) => {
		await deleteCustomer(id);
	};

	const handleDeleteSelected = async () => {
		for (const id of selectedIds) {
			await deleteCustomer(id);
		}
		setSelectedIds([]);
	};

	const isAllSelected =
		paginatedCustomers.length > 0 &&
		selectedIds.length === paginatedCustomers.length;

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			<MultiFunctionsTable
				AddNewPageButton={
					<PagesDialog
						button={
							<Button className={cn(`w-auto h-11`)}>
								<Plus className='w-5 h-5' />
								{t("create-new-customer")}
							</Button>
						}
						pageTitle={t("create-new-customer")}>
						<CreateNewCustomer />
					</PagesDialog>
				}
				searchPlaceholder={t("search-placeholder")}
				filterByStatusPlaceholder={t("filter-by-status")}
				searchQuery={searchQuery}
				statusOptions={STATUS_OPTIONS}
				onSearchChange={setSearchQuery}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				totalItems={filteredCustomers.length}
				selectedCount={selectedIds.length}
				customBulkActions={
					selectedIds.length > 0 && (
						<div className='w-full flex items-center justify-between gap-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300'>
							<span className='text-sm font-medium text-neutral-900 dark:text-white'>
								{selectedIds.length} {bulkMessages("selected")}
							</span>
							<div className='flex items-center gap-2'>
								<ConfirmationDialog
									type='danger'
									confirmText={conformMessages("confirm-delete-button-text")}
									title={conformMessages("title")}
									icon={<Trash2 className='w-5 h-5' />}
									trigger={
										<Button
											size='sm'
											variant='destructive'
											className='btn px-2.5! py-2.5! flex items-center bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
											<Trash2 className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
											{bulkMessages("delete-selected")}
										</Button>
									}
									onConfirm={handleDeleteSelected}>
									{conformMessages("message_multiple_delete", {
										count: selectedIds.length,
									})}
								</ConfirmationDialog>
							</div>
						</div>
					)
				}>
				<CustomersTable
					customers={paginatedCustomers}
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

export default Customers;
