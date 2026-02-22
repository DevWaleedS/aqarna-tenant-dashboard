"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useTranslations } from "next-intl";

import { useState } from "react";
import { useTransactions } from "@/hooks/queries/central/useTransactions";
import TransactionHistoryTable from "./_components/transaction-history-table";
import MultiFunctionsTable from "@/components/multi-functions-table";

const Transactions = () => {
	const t = useTranslations("central.transactions");
	const { transactions, isLoading, confirmTransaction, isConfirming } =
		useTransactions();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const statusOptions = ["all", "Pending", "Confirmed", "Failed", "Cancelled"];

	// Filter transactions
	const filteredTransactions = transactions.filter((transaction: any) => {
		const applicantName =
			transaction.tenant_application?.company_name ||
			transaction.tenant_application?.contact_name ||
			"";

		const matchesSearch =
			applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			transaction.package?.name
				?.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			transaction.status_label
				?.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			transaction.payment_gateway
				?.toLowerCase()
				.includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "pending" && transaction.status === 0) ||
			(statusFilter === "confirmed" && transaction.status === 1) ||
			(statusFilter === "failed" && transaction.status === 2) ||
			(statusFilter === "cancelled" && transaction.status === 3);

		return matchesSearch && matchesStatus;
	});

	// Calculate pagination
	const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedTransactions = filteredTransactions.slice(
		startIndex,
		endIndex,
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	return (
		<>
			<DashboardBreadcrumb title={t("title")} text={t("title")} />

			<MultiFunctionsTable
				filterByStatusPlaceholder={t("filter-by-status")}
				searchPlaceholder={t("search-placeholder")}
				statusOptions={statusOptions}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				totalItems={filteredTransactions.length}>
				<TransactionHistoryTable
					transactions={paginatedTransactions}
					isLoading={isLoading}
					onConfirm={confirmTransaction}
					isConfirming={isConfirming}
				/>
			</MultiFunctionsTable>
		</>
	);
};

export default Transactions;
