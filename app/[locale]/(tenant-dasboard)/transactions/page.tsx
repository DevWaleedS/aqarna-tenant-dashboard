"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	BadgeCheck,
	CalendarClock,
	CreditCard,
	TrendingUp,
	XCircle,
} from "lucide-react";
import MultiFunctionsTable from "@/components/multi-functions-table";
import { useTransactions } from "@/hooks/queries/tenants/useTransactions";
import TransactionsTable from "./_components/transactions-table";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
	"all",
	"pending",
	"paid",
	"failed",
	"refunded",
	"cancelled",
];

const Transactions = () => {
	const t = useTranslations("tenant.transactions");

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
	const itemsPerPage = 10;

	const { transactions, isLoading } = useTransactions();

	// ── Filter ────────────────────────────────────────────────────────────────
	const filtered = transactions.filter((txn) => {
		const query = searchQuery.toLowerCase();
		const matchesSearch =
			!query ||
			txn.details?.toLowerCase().includes(query) ||
			txn.payment_gateway.toLowerCase().includes(query) ||
			txn.payment_method_label.toLowerCase().includes(query) ||
			String(txn.id).includes(query);

		const matchesStatus = statusFilter === "all" || txn.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// ── Pagination ────────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filtered.length / itemsPerPage);
	const paginated = filtered.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	// ── Selection ─────────────────────────────────────────────────────────────
	const handleSelectAll = (checked: boolean) =>
		setSelectedIds(checked ? paginated.map((t) => t.id) : []);

	const handleSelectOne = (id: string | number, checked: boolean) =>
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((sid) => sid !== id),
		);

	const isAllSelected =
		paginated.length > 0 && selectedIds.length === paginated.length;

	// ── Summary stats ─────────────────────────────────────────────────────────
	const totalPaid = transactions
		.filter((t) => t.status === "paid")
		.reduce((sum, t) => sum + t.price, 0);
	const pendingCount = transactions.filter(
		(t) => t.status === "pending",
	).length;
	const failedCount = transactions.filter(
		(t) => t.status === "failed" || t.status === "cancelled",
	).length;

	const statsCards = [
		{
			icon: <TrendingUp className='w-5 h-5' />,
			label: "Total Paid",
			value: new Intl.NumberFormat("en-US", {
				notation: "compact",
				maximumFractionDigits: 1,
			}).format(totalPaid),
			color:
				"bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
		},
		{
			icon: <CreditCard className='w-5 h-5' />,
			label: "Total Transactions",
			value: transactions.length,
			color: "bg-primary/10 text-primary",
		},
		{
			icon: <CalendarClock className='w-5 h-5' />,
			label: "Pending",
			value: pendingCount,
			color:
				"bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
		},
		{
			icon: <XCircle className='w-5 h-5' />,
			label: "Failed / Cancelled",
			value: failedCount,
			color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
		},
	];

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			{/* ── Stats strip ─────────────────────────────────────────────── */}
			{transactions.length > 0 && (
				<div className='mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3'>
					{statsCards.map(({ icon, label, value, color }) => (
						<div
							key={label}
							className='flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900'>
							<div
								className={cn(
									"w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
									color,
								)}>
								{icon}
							</div>
							<div>
								<p className='text-xs text-neutral-400 dark:text-neutral-500 leading-none mb-0.5'>
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
				searchPlaceholder={t("search-placeholder")}
				filterByStatusPlaceholder={t("filter-by-status")}
				searchQuery={searchQuery}
				statusOptions={STATUS_OPTIONS}
				onSearchChange={(q) => {
					setSearchQuery(q);
					setCurrentPage(1);
				}}
				statusFilter={statusFilter}
				onStatusChange={(s) => {
					setStatusFilter(s);
					setCurrentPage(1);
				}}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				totalItems={filtered.length}
				selectedCount={selectedIds.length}>
				<TransactionsTable
					transactions={paginated}
					isLoading={isLoading}
					searchQuery={searchQuery}
					selectedIds={selectedIds}
					onSelectAll={handleSelectAll}
					onSelectOne={handleSelectOne}
					isAllSelected={isAllSelected}
				/>
			</MultiFunctionsTable>
		</>
	);
};

export default Transactions;
