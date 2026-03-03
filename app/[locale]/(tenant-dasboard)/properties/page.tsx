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

import CreateNewProperty from "./_components/create-new-property";

import { useProperties } from "@/hooks/queries/usePropertiesQuery";
import PropertiesTable from "./_components/properties-table";

// Properties filter by type, not status
const TYPE_OPTIONS = ["all", "residential", "commercial", "industrial"];

const Properties = () => {
	const t = useTranslations("tenant.properties");
	const conformMessages = useTranslations("confirmation-dialog");
	const bulkMessages = useTranslations("tenant.properties.bulk_actions");

	const { properties, isLoading, deleteProperty } = useProperties();

	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
	const itemsPerPage = 10;

	// ── Filter ───────────────────────────────────────────────────────────────
	const filteredProperties = properties.filter((property: any) => {
		const name = (property.name ?? "").toLowerCase();
		const address = (property.address_line_1 ?? "").toLowerCase();
		const buildingNumber = (property.building_number ?? "").toLowerCase();
		const query = searchQuery.toLowerCase();

		const matchesSearch =
			name.includes(query) ||
			address.includes(query) ||
			buildingNumber.includes(query);

		const matchesType = typeFilter === "all" || property.type === typeFilter;

		return matchesSearch && matchesType;
	});

	// ── Pagination ───────────────────────────────────────────────────────────
	const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedProperties = filteredProperties.slice(
		startIndex,
		startIndex + itemsPerPage,
	);

	// ── Handlers ─────────────────────────────────────────────────────────────
	const handlePageChange = (page: number) => setCurrentPage(page);

	const handleSelectAll = (checked: boolean) => {
		setSelectedIds(checked ? paginatedProperties.map((p: any) => p.id) : []);
	};

	const handleSelectOne = (id: string | number, checked: boolean) => {
		setSelectedIds((prev) =>
			checked ? [...prev, id] : prev.filter((sid) => sid !== id),
		);
	};

	const handleDelete = async (id: string | number) => {
		await deleteProperty(id);
	};

	const handleDeleteSelected = async () => {
		for (const id of selectedIds) {
			await deleteProperty(id);
		}
		setSelectedIds([]);
	};

	const isAllSelected =
		paginatedProperties.length > 0 &&
		selectedIds.length === paginatedProperties.length;

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			<MultiFunctionsTable
				AddNewPageButton={
					<PagesDialog
						button={
							<Button className={cn(`w-auto h-11`)}>
								<Plus className='w-5 h-5' />
								{t("create-new-property")}
							</Button>
						}
						pageTitle={t("create-new-property")}>
						<CreateNewProperty />
					</PagesDialog>
				}
				searchPlaceholder={t("search-placeholder")}
				filterByStatusPlaceholder={t("filter-by-type")}
				searchQuery={searchQuery}
				statusOptions={TYPE_OPTIONS}
				onSearchChange={setSearchQuery}
				statusFilter={typeFilter}
				onStatusChange={setTypeFilter}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				totalItems={filteredProperties.length}
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
				<PropertiesTable
					properties={paginatedProperties}
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

export default Properties;
