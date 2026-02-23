"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useTranslations } from "next-intl";
import { useState } from "react";
import MultiFunctionsTable from "@/components/multi-functions-table";

import MaintenanceTicketsTable from "./_components/maintenance-tickets-table";
import { useMaintenanceTickets } from "@/hooks/queries/tenants/useMaintenanceTicketsQuery";

const STATUS_OPTIONS = [
	"all",
	"open",
	"in_progress",
	"resolved",
	"closed",
	"cancelled",
];

const MaintenanceTickets = () => {
	const t = useTranslations("tenant.maintenance-tickets");

	const { tickets, isLoading } = useMaintenanceTickets();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// ── Filter ───────────────────────────────────────────────────────────────
	const filteredTickets = tickets.filter((ticket: any) => {
		const subject = (ticket.subject ?? "").toLowerCase();
		const description = (ticket.description ?? "").toLowerCase();
		const query = searchQuery.toLowerCase();

		const matchesSearch =
			subject.includes(query) || description.includes(query);

		const matchesStatus =
			statusFilter === "all" || ticket.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// ── Pagination ───────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedTickets = filteredTickets.slice(
		startIndex,
		startIndex + itemsPerPage,
	);

	const handlePageChange = (page: number) => setCurrentPage(page);

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			<MultiFunctionsTable
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
				totalItems={filteredTickets.length}>
				<MaintenanceTicketsTable
					tickets={paginatedTickets}
					isLoading={isLoading}
					searchQuery={searchQuery}
				/>
			</MultiFunctionsTable>
		</>
	);
};

export default MaintenanceTickets;
