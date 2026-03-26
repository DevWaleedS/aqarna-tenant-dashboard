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
import TerminateContractDialog from "@/components/dailogs/terminate-contract-dialog";

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

	const { contracts, isLoading } = useContracts();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
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
				totalItems={filteredContracts.length}>
				<ContractsTable
					contracts={paginatedContracts}
					isLoading={isLoading}
					searchQuery={searchQuery}
				/>
			</MultiFunctionsTable>
		</>
	);
};

export default Contracts;
