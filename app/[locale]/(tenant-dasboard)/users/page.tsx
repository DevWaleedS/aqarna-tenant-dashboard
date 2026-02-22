"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import SearchBox from "@/components/shared/search-box";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react";
import UsersGridCard from "./users-grid-card";
import { useTranslations } from "next-intl";
import AddNewUser from "./_add-new-user/page";

import { useState, useMemo } from "react";
import { useUsers } from "@/hooks/queries/central/useUsersQuery";
import PagesDialog from "@/components/dailogs/pages-dialog";
import Loading from "../../loading";
import TablePagination from "@/components/table-pagination";

const ITEMS_PER_PAGE = 12; // 3 rows × 4 columns for grid layout

const Users = () => {
	const t = useTranslations("central.users");
	const { users, isLoading } = useUsers();

	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	// Filter users based on search query
	const filteredUsers = useMemo(() => {
		if (!searchQuery) return users;

		return users.filter(
			(user: any) =>
				user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.designation?.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [users, searchQuery]);

	// Calculate pagination
	const totalItems = filteredUsers.length;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Reset to page 1 when search query changes
	useMemo(() => {
		setCurrentPage(1);
	}, [searchQuery]);

	return (
		<>
			<DashboardBreadcrumb title={t("title")} text={t("title")} />

			<Card className='card h-full p-0! block! border-0 overflow-hidden'>
				<CardHeader className='border-b border-neutral-200 dark:border-slate-600 py-4! px-6 flex items-center flex-wrap gap-3 justify-between'>
					<div className='w-full flex items-center flex-wrap gap-3'>
						<SearchBox
							searchPlaceholder={t("search-placeholder")}
							value={searchQuery}
							onChange={setSearchQuery}
						/>
						<div className='ml-auto rtl:mr-auto rtl:ml-0'>
							<PagesDialog
								button={
									<Button className={cn(`w-auto h-11 `)}>
										<Plus className='w-5 h-5' />
										{t("add-user-button-text")}
									</Button>
								}
								pageTitle={t("add-new-user-page.title")}>
								<AddNewUser />
							</PagesDialog>
						</div>
					</div>
				</CardHeader>

				<CardContent className='card-body p-6'>
					{isLoading ? (
						<Loading />
					) : paginatedUsers.length === 0 ? (
						<div className='text-center py-12'>
							<p className='text-neutral-500 dark:text-neutral-400'>
								{searchQuery
									? t("no-users-found-matching-your-search")
									: t("no-users-available")}
							</p>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-6'>
							<UsersGridCard users={paginatedUsers} />
						</div>
					)}
				</CardContent>

				{!isLoading && totalPages > 1 && (
					<TablePagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
						totalItems={totalItems}
					/>
				)}
			</Card>
		</>
	);
};

export default Users;
