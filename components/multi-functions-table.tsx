import CustomSelect from "@/components/shared/custom-select";
import SearchBox from "@/components/shared/search-box";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TablePagination from "./table-pagination";
import { CheckCheck, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface MultiFunctionsTableProps {
	searchPlaceholder?: string;
	filterByStatusPlaceholder?: string;
	AddNewPageButton?: React.ReactNode;
	children: React.ReactNode;
	statusOptions?: string[];
	searchQuery?: string;
	onSearchChange?: (value: string) => void;
	statusFilter?: string;
	onStatusChange?: (value: string) => void;
	currentPage?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	totalItems?: number;
	selectedCount?: number;
	onMarkSelectedAsRead?: () => void;
	onDeleteSelected?: () => void;
	hasUnreadSelected?: boolean;
	customBulkActions?: React.ReactNode;
}

const MultiFunctionsTable = ({
	searchPlaceholder,
	filterByStatusPlaceholder,
	AddNewPageButton,
	children,
	searchQuery = "",
	statusOptions = [],
	onSearchChange,
	statusFilter = "",
	onStatusChange,
	currentPage = 1,
	totalPages = 1,
	onPageChange,
	totalItems = 0,
	selectedCount = 0,
	onMarkSelectedAsRead,
	onDeleteSelected,
	hasUnreadSelected = false,
	customBulkActions,
}: MultiFunctionsTableProps) => {
	const t = useTranslations("notifications.bulk_actions");

	const handleSearchChange = (value: string) => {
		if (onSearchChange) {
			onSearchChange(value);
		}
	};

	const handleStatusChange = (value: string) => {
		if (onStatusChange) {
			onStatusChange(value.toLowerCase());
		}
	};

	return (
		<>
			<Card className='card h-full p-0! block! border-0 overflow-hidden mb-6'>
				<CardHeader className='border-b border-neutral-200 dark:border-slate-600 py-4! px-6 flex items-center flex-wrap gap-3 justify-between'>
					<div className='w-full flex items-center flex-wrap gap-3'>
						{searchPlaceholder && (
							<SearchBox
								searchPlaceholder={searchPlaceholder}
								value={searchQuery}
								onChange={handleSearchChange}
							/>
						)}
						{filterByStatusPlaceholder && statusOptions.length > 0 && (
							<CustomSelect
								placeholder={filterByStatusPlaceholder}
								options={statusOptions}
								value={statusFilter}
								onChange={handleStatusChange}
							/>
						)}

						{AddNewPageButton && (
							<div className='ml-auto rtl:mr-auto rtl:ml-0'>
								{AddNewPageButton}
							</div>
						)}
					</div>

					{/* Custom Bulk Actions (if provided) or Default Bulk Actions */}
					{customBulkActions
						? customBulkActions
						: selectedCount > 0 && (
								<div className='w-full flex items-center justify-between gap-3 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300'>
									<span className='text-sm font-medium text-neutral-900 dark:text-white'>
										{selectedCount} {t("selected")}
									</span>
									<div className='flex items-center gap-2'>
										{hasUnreadSelected && onMarkSelectedAsRead && (
											<Button
												size='sm'
												variant='outline'
												onClick={onMarkSelectedAsRead}
												className='bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'>
												<CheckCheck className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
												{t("mark_as_read")}
											</Button>
										)}
										{onDeleteSelected && (
											<Button
												size='sm'
												variant='destructive'
												onClick={onDeleteSelected}
												className='bg-red-500 hover:bg-red-600'>
												<Trash2 className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
												{t("delete")}
											</Button>
										)}
									</div>
								</div>
							)}
				</CardHeader>

				<CardContent className='card-body p-6'>{children}</CardContent>

				{totalPages > 1 && (
					<TablePagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={onPageChange}
						totalItems={totalItems}
					/>
				)}
			</Card>
		</>
	);
};

export default MultiFunctionsTable;
