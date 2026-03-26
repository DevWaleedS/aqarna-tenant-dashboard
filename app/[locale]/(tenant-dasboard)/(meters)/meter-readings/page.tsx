"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import MultiFunctionsTable from "@/components/multi-functions-table";
import PagesDialog from "@/components/dailogs/pages-dialog";
import { cn } from "@/lib/utils";
import { useMeterReadings } from "@/hooks/queries/useMeterReadings";
import MeterReadingsTable from "./_components/meter-readings-table";
import CreateNewMeterReading from "./_components/create-new-meter-reading";

// Filter by processed status
const STATUS_OPTIONS = ["all", "pending", "processed"];

const MeterReadings = () => {
	const t = useTranslations("tenant.meter-readings");

	const { readings, isLoading } = useMeterReadings();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);

	const itemsPerPage = 10;

	// ── Filter ───────────────────────────────────────────────────────────────
	const filteredReadings = readings.filter((reading: any) => {
		const meterId = String(reading.meter_id ?? "");
		const contractId = String(reading.contract_id ?? "");
		const query = searchQuery.toLowerCase();

		const matchesSearch = meterId.includes(query) || contractId.includes(query);

		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "processed" && reading.is_processed) ||
			(statusFilter === "pending" && !reading.is_processed);

		return matchesSearch && matchesStatus;
	});

	// ── Pagination ───────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedReadings = filteredReadings.slice(
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
								{t("create-new-reading")}
							</Button>
						}
						pageTitle={t("create-new-reading")}>
						<CreateNewMeterReading />
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
				totalItems={filteredReadings.length}>
				<MeterReadingsTable
					readings={paginatedReadings}
					isLoading={isLoading}
					searchQuery={searchQuery}
				/>
			</MultiFunctionsTable>
		</>
	);
};

export default MeterReadings;
