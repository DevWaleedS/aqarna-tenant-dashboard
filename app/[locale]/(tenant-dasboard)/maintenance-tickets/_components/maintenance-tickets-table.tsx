"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import PagesDialog from "@/components/dailogs/pages-dialog";
import UpdateTicket from "./update-ticket";

interface MaintenanceTicketsTableProps {
	tickets: any[];
	isLoading: boolean;
	searchQuery?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
	low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	medium:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_COLORS: Record<string, string> = {
	open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	in_progress:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	resolved:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
	cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const MaintenanceTicketsTable = ({
	tickets,
	isLoading,
	searchQuery,
}: MaintenanceTicketsTableProps) => {
	const t = useTranslations("tenant.maintenance-tickets");
	const updateT = useTranslations(
		"tenant.maintenance-tickets.update-ticket-page",
	);

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "dd MMM yyyy");
		} catch {
			return dateStr;
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-8'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (tickets.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{searchQuery
						? t("no_tickets_found_matching_search")
						: t("no_tickets_available")}
				</p>
			</div>
		);
	}

	return (
		<Table className='table-auto border-spacing-0 border-separate'>
			<TableHeader>
				<TableRow className='border-0'>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-s rounded-tl-lg rtl:rounded-tl-none rtl:rounded-tr-lg'>
						{t("table.id")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12'>
						{t("table.subject")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.unit")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.customer")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.priority")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.status")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.scheduled_at")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 text-center'>
						{t("table.created_at")}
					</TableHead>
					<TableHead className='bg-neutral-100 dark:bg-slate-700 border-t border-neutral-200 dark:border-slate-600 overflow-hidden px-4 h-12 border-e rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg text-center'>
						{t("table.actions")}
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{tickets.map((ticket: any) => (
					<TableRow key={ticket.id}>
						{/* ID */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-sm text-neutral-500'>
							#{ticket.id}
						</TableCell>

						{/* Subject */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e'>
							<p className='font-medium max-w-xs truncate'>{ticket.subject}</p>
							{ticket.description && (
								<p className='text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 max-w-xs truncate'>
									{ticket.description}
								</p>
							)}
						</TableCell>

						{/* Unit */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
							{ticket.unit_id ?? "—"}
						</TableCell>

						{/* Customer */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
							{ticket.customer_id ?? "—"}
						</TableCell>

						{/* Priority */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
							<span
								className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
									PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS["medium"]
								}`}>
								{ticket.priority}
							</span>
						</TableCell>

						{/* Status */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
							<span
								className={`px-2.5 py-1 rounded-full text-xs font-medium ${
									STATUS_COLORS[ticket.status] ?? STATUS_COLORS["open"]
								}`}>
								{ticket.status?.replace("_", " ")}
							</span>
						</TableCell>

						{/* Scheduled At */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
							{formatDate(ticket.scheduled_at)}
						</TableCell>

						{/* Created At */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center text-sm'>
							{formatDate(ticket.created_at)}
						</TableCell>

						{/* Actions: Edit only (no delete — tickets are customer-created) */}
						<TableCell className='py-3 px-4 border-b border-neutral-200 dark:border-slate-600 first:border-s last:border-e text-center'>
							<PagesDialog
								pageTitle={updateT("title")}
								className='max-w-2xl!'
								button={
									<Button
										size='icon'
										variant='ghost'
										className='rounded-[50%] text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'>
										<Pencil className='w-4 h-4' />
									</Button>
								}>
								<UpdateTicket ticketId={ticket.id} />
							</PagesDialog>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default MaintenanceTicketsTable;
