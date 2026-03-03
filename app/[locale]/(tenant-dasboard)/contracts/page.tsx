"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useTranslations } from "next-intl";
import ContractsTable from "./_components/contracts-table";
import { Button } from "@/components/ui/button";
import { CircleOff, Plus } from "lucide-react";
import { useState } from "react";

import MultiFunctionsTable from "@/components/multi-functions-table";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import PagesDialog from "@/components/dailogs/pages-dialog";
import { cn } from "@/lib/utils";
import CreateNewContract from "./_components/create-new-contract";
import { useContracts } from "@/hooks/queries/useContractsQuery";

const STATUS_OPTIONS = [
	"all",
	"draft",
	"active",
	"expired",
	"terminated",
	"suspended",
	"pending",
];

const Contracts = () => {
	const t = useTranslations("tenant.contracts");
	const conformMessages = useTranslations("confirmation-dialog");
	const bulkMessages = useTranslations("tenant.contracts.bulk_actions");

	const { contracts, isLoading, terminateContract } = useContracts();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
	const itemsPerPage = 10;

	// ── Filter ──────────────────────────────────────────────────────────────
	const filteredContracts = contracts.filter((contract: any) => {
		const customerName = contract.customer
			? `${contract.customer.first_name} ${contract.customer.last_name}`.toLowerCase()
			: "";
		const contractNumber = (contract.contract_number ?? "").toLowerCase();
		const query = searchQuery.toLowerCase();

		const matchesSearch =
			contractNumber.includes(query) || customerName.includes(query);

		const matchesStatus =
			statusFilter === "all" || contract.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// ── Pagination ───────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedContracts = filteredContracts.slice(
		startIndex,
		startIndex + itemsPerPage,
	);

	// ── Handlers ─────────────────────────────────────────────────────────────
	const handlePageChange = (page: number) => setCurrentPage(page);

	const handleSelectAll = (checked: boolean) => {
		setSelectedIds(checked ? paginatedContracts.map((c: any) => c.id) : []);
	};

	const handleSelectOne = (id: string | number, checked: boolean) => {
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((sid) => sid !== id),
		);
	};

	const handleTerminate = async (id: string | number) => {
		await terminateContract({ id });
	};

	const handleTerminateSelected = async () => {
		for (const id of selectedIds) {
			await terminateContract({ id });
		}
		setSelectedIds([]);
	};

	const isAllSelected =
		paginatedContracts.length > 0 &&
		selectedIds.length === paginatedContracts.length;

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			<MultiFunctionsTable
				AddNewPageButton={
					<PagesDialog
						button={
							<Button className={cn(`w-auto h-11`)}>
								<Plus className='w-5 h-5' />
								{t("create-new-contract")}
							</Button>
						}
						pageTitle={t("create-new-contract")}>
						<CreateNewContract />
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
				totalItems={filteredContracts.length}
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
									confirmText={conformMessages("confirm-terminate-button-text")}
									title={conformMessages("title")}
									icon={<CircleOff className='w-5 h-5' />}
									trigger={
										<Button
											size='sm'
											variant='destructive'
											className='btn px-2.5! py-2.5! flex items-center bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 hover:bg-red-200 hover:dark:bg-red-600/30'>
											<CircleOff className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
											{bulkMessages("terminate-selected")}
										</Button>
									}
									onConfirm={handleTerminateSelected}>
									{conformMessages("message_multiple_terminate", {
										count: selectedIds.length,
									})}
								</ConfirmationDialog>
							</div>
						</div>
					)
				}>
				<ContractsTable
					contracts={paginatedContracts}
					isLoading={isLoading}
					onTerminate={handleTerminate}
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

export default Contracts;
