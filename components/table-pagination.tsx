import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
	currentPage?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	totalItems?: number;
}

const TablePagination = ({
	currentPage = 1,
	totalPages = 1,
	onPageChange,
	totalItems = 0,
}: TablePaginationProps) => {
	const t = useTranslations("pagination");

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages && onPageChange) {
			onPageChange(page);
		}
	};

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("...");
			}

			// Show last page
			pages.push(totalPages);
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className='grid grid-cols-1 md:grid-cols-1'>
			<ul className='pagination flex flex-wrap items-center gap-2 justify-center mt-6 mb-6'>
				{/* Previous Button */}
				<li className='page-item'>
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className={cn(
							"page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-neutral-300 font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-10.5 transition-colors",
							currentPage === 1 &&
								"opacity-50 cursor-not-allowed hover:bg-blue-50 dark:hover:bg-primary/25"
						)}>
						{t("previous")}
					</button>
				</li>

				{/* First Page / Previous Arrow */}
				<li className='page-item'>
					<button
						onClick={() => handlePageChange(1)}
						disabled={currentPage === 1}
						className={cn(
							"page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-neutral-300 font-medium rounded-lg border-0 flex items-center justify-center h-10.5 w-10.5 transition-colors",
							currentPage === 1 &&
								"opacity-50 cursor-not-allowed hover:bg-blue-50 dark:hover:bg-primary/25"
						)}>
						<ChevronsLeft className='w-5 rtl:rotate-180' />
					</button>
				</li>

				{/* Page Numbers */}
				{pageNumbers.map((page, index) => {
					if (page === "...") {
						return (
							<li key={`ellipsis-${index}`} className='page-item'>
								<span className='page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-neutral-300 font-medium rounded-lg border-0 flex items-center justify-center h-10.5 w-10.5'>
									...
								</span>
							</li>
						);
					}

					return (
						<li key={page} className='page-item'>
							<button
								onClick={() => handlePageChange(page as number)}
								className={cn(
									"page-link font-medium rounded-lg border-0 flex items-center justify-center h-10.5 w-10.5 transition-colors",
									currentPage === page
										? "bg-primary dark:bg-primary text-white"
										: "bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-neutral-300 hover:bg-blue-100 dark:hover:bg-primary/30"
								)}>
								{page}
							</button>
						</li>
					);
				})}

				{/* Last Page / Next Arrow */}
				<li className='page-item'>
					<button
						onClick={() => handlePageChange(totalPages)}
						disabled={currentPage === totalPages}
						className={cn(
							"page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-neutral-300 font-medium rounded-lg border-0 flex items-center justify-center h-10.5 w-10.5 transition-colors",
							currentPage === totalPages &&
								"opacity-50 cursor-not-allowed hover:bg-blue-50 dark:hover:bg-primary/25"
						)}>
						<ChevronsRight className='w-5 rtl:rotate-180' />
					</button>
				</li>

				{/* Next Button */}
				<li className='page-item'>
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={cn(
							"page-link bg-blue-50 dark:bg-primary/25 text-neutral-900 dark:text-neutral-300 font-medium rounded-lg border-0 px-5 py-2.5 flex items-center justify-center h-10.5 transition-colors",
							currentPage === totalPages &&
								"opacity-50 cursor-not-allowed hover:bg-blue-50 dark:hover:bg-primary/25"
						)}>
						{t("next")}
					</button>
				</li>
			</ul>

			{/* Show total items */}
			{totalItems > 0 && (
				<p className='text-center text-sm text-gray-600 dark:text-gray-400 mb-4'>
					{t("showing")} {(currentPage - 1) * 10 + 1} {t("to")}{" "}
					{Math.min(currentPage * 10, totalItems)} {t("of")} {totalItems}{" "}
					{t("items")}
				</p>
			)}
		</div>
	);
};

export default TablePagination;
