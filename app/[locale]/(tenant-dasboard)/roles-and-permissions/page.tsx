"use client";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

import { useTranslations } from "next-intl";
import RolesTable from "./_components/roles-table";

import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import AddNewRole from "./_components/add-new-role";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

import { useRoles } from "@/hooks/queries/central/UseRoles";
import MultiFunctionsTable from "@/components/multi-functions-table";
import PagesDialog from "@/components/dailogs/pages-dialog";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import Loading from "../../loading";

const ITEMS_PER_PAGE = 10;

const ManageRoles = () => {
	const t = useTranslations("central.roles-and-permissions");
	const conformMessages = useTranslations("confirmation-dialog");
	const bulkMessages = useTranslations("notifications.bulk_actions");
	const { roles, deleteRole, isDeleting, isLoading } = useRoles();

	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

	// Filter roles based on search query
	const filteredRoles = useMemo(() => {
		if (!searchQuery.trim()) return roles;

		const query = searchQuery.toLowerCase();
		return roles.filter(
			(role: any) =>
				role.name.toLowerCase().includes(query) ||
				role.guard_name.toLowerCase().includes(query),
		);
	}, [roles, searchQuery]);

	// Pagination
	const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

	// Reset to page 1 when search changes
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
		setSelectedRoles([]);
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		setSelectedRoles([]);
	};

	// Handle bulk delete
	const handleDeleteSelected = async () => {
		try {
			// Delete all selected roles
			await Promise.all(
				selectedRoles.map((roleId) => deleteRole(roleId.toString())),
			);
			setSelectedRoles([]);
		} catch (error) {
			console.error("Error deleting roles:", error);
		}
	};

	// Check if any selected roles exist in current filtered results
	const selectedCount = selectedRoles.filter((id) =>
		filteredRoles.some((role: any) => role.id === id),
	).length;

	return (
		<>
			<DashboardBreadcrumb
				title={t("roles-page-title")}
				text={t("roles-page-title")}
			/>

			<MultiFunctionsTable
				AddNewPageButton={
					<PagesDialog
						button={
							<Button className={cn(`w-auto h-11`)}>
								<Plus className='w-5 h-5' />
								{t("add-new-role-button")}
							</Button>
						}
						pageTitle={t("add-new-role-button")}>
						<AddNewRole />
					</PagesDialog>
				}
				searchPlaceholder={t("search-placeholder")}
				searchQuery={searchQuery}
				onSearchChange={handleSearchChange}
				statusOptions={[]}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
				totalItems={filteredRoles.length}
				selectedCount={selectedCount}
				customBulkActions={
					selectedCount > 0 && (
						<div className='w-full flex items-center justify-between gap-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300'>
							<span className='text-sm font-medium text-neutral-900 dark:text-white'>
								{selectedCount} {bulkMessages("selected")}
							</span>
							<div className='flex items-center gap-2'>
								<ConfirmationDialog
									type='danger'
									title={conformMessages("title")}
									icon={<Trash2 className='w-5 h-5' />}
									trigger={
										<Button
											size='sm'
											variant='destructive'
											disabled={isDeleting}
											className='bg-red-500 hover:bg-red-600'>
											<Trash2 className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
											{bulkMessages("delete")}
										</Button>
									}
									onConfirm={handleDeleteSelected}>
									{conformMessages("message_multiple", {
										count: selectedCount,
									})}
								</ConfirmationDialog>
							</div>
						</div>
					)
				}
				hasUnreadSelected={false}>
				{isLoading ? (
					<Loading />
				) : paginatedRoles.length === 0 ? (
					<div className='text-center py-12'>
						<p className='text-neutral-500 dark:text-neutral-400'>
							{searchQuery
								? t("no_roles_found_matching_your_search")
								: t("no_roles_available")}
						</p>
					</div>
				) : (
					<RolesTable
						roles={paginatedRoles}
						selectedRoles={selectedRoles}
						setSelectedRoles={setSelectedRoles}
					/>
				)}
			</MultiFunctionsTable>
		</>
	);
};
export default ManageRoles;
