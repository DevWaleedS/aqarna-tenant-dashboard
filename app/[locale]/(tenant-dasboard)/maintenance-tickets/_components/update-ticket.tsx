"use client";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	updateMaintenanceTicketSchema,
	updateMaintenanceTicketType,
} from "@/lib/zod";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { DatePicker } from "@/components/shared/date-picker";
import { format } from "date-fns";
import {
	useMaintenanceTicket,
	useMaintenanceTickets,
} from "@/hooks/queries/tenants/useMaintenanceTicketsQuery";

interface UpdateTicketProps {
	ticketId: number | string;
	onClose?: () => void;
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

const UpdateTicket = ({ ticketId, onClose }: UpdateTicketProps) => {
	const t = useTranslations("tenant.maintenance-tickets.update-ticket-page");
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const { ticket, isLoading } = useMaintenanceTicket(ticketId);
	const { updateTicket, isUpdating } = useMaintenanceTickets();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<updateMaintenanceTicketType>({
		resolver: zodResolver(updateMaintenanceTicketSchema),
		defaultValues: {
			status: undefined,
			priority: undefined,
			admin_notes: "",
			scheduled_at: undefined,
		},
	});

	// ── Pre-fill editable fields from existing ticket data ───────────────────
	useEffect(() => {
		if (!ticket) return;
		reset({
			status: ticket.status,
			priority: ticket.priority,
			admin_notes: ticket.admin_notes ?? "",
			scheduled_at: ticket.scheduled_at ?? undefined,
		});
	}, [ticket, reset]);

	const onSubmit = async (data: updateMaintenanceTicketType) => {
		try {
			await updateTicket(
				{ id: ticketId, data },
				{
					onSuccess: () => {
						closeButtonRef.current?.click();
						onClose?.();
					},
				},
			);
		} catch (error) {
			console.error("Error updating ticket:", error);
		}
	};

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		try {
			return format(new Date(dateStr), "dd MMM yyyy, HH:mm");
		} catch {
			return dateStr;
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!ticket) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					Ticket not found
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogClose ref={closeButtonRef} className='hidden' />

			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ════ Ticket Information (read-only) ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("ticket-info-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Subject */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("subject-label")}
					</Label>
					<Input className='h-12 px-4' value={ticket.subject ?? "—"} readOnly />
				</div>

				{/* Description */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("description-label")}
					</Label>
					<Textarea
						className='h-24 px-4 py-2 resize-none'
						value={ticket.description ?? "—"}
						readOnly
						disabled
					/>
				</div>

				{/* Unit + Customer */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("unit-label")}
					</Label>
					<Input className='h-12 px-4' value={ticket.unit_id ?? "—"} readOnly />
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("customer-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={ticket.customer_id ?? "—"}
						readOnly
					/>
				</div>

				{/* Current status + priority badges */}
				<div className='md:col-span-6 col-span-12 flex items-center gap-3'>
					<span
						className={`px-3 py-1.5 rounded-full text-xs font-medium ${
							STATUS_COLORS[ticket.status] ?? STATUS_COLORS["open"]
						}`}>
						{ticket.status?.replace("_", " ")}
					</span>
					<span
						className={`px-3 py-1.5 rounded-full text-xs font-medium ${
							PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS["medium"]
						}`}>
						{ticket.priority}
					</span>
					<span className='text-xs text-neutral-400 dark:text-neutral-500'>
						{formatDate(ticket.created_at)}
					</span>
				</div>

				{/* Images (read-only preview) */}
				{ticket.images && ticket.images.filter(Boolean).length > 0 && (
					<div className='col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("images-label")}
						</Label>
						<div className='flex flex-wrap gap-2'>
							{ticket.images.filter(Boolean).map((img: string, i: number) => (
								<a
									key={i}
									href={img}
									target='_blank'
									rel='noopener noreferrer'
									className='block'>
									<img
										src={img}
										alt={`ticket-image-${i}`}
										className='w-20 h-20 rounded-lg object-cover border border-neutral-200 dark:border-slate-600 hover:opacity-80 transition-opacity'
									/>
								</a>
							))}
						</div>
					</div>
				)}

				{/* ════ Admin Actions (editable) ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("admin-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Status */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("status-label")}
					</Label>
					<Controller
						name='status'
						control={control}
						render={({ field }) => (
							<Select
								value={field.value ?? "none"}
								onValueChange={(v) =>
									field.onChange(v === "none" ? undefined : v)
								}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("status-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{[
											"open",
											"in_progress",
											"resolved",
											"closed",
											"cancelled",
										].map((s) => (
											<SelectItem key={s} value={s}>
												{t(`status-options.${s}`)}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.status && (
						<p className='text-red-500 text-sm mt-1'>{errors.status.message}</p>
					)}
				</div>

				{/* Priority */}
				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("priority-label")}
					</Label>
					<Controller
						name='priority'
						control={control}
						render={({ field }) => (
							<Select
								value={field.value ?? "none"}
								onValueChange={(v) =>
									field.onChange(v === "none" ? undefined : v)
								}>
								<SelectTrigger className='h-12! px-4 w-full'>
									<SelectValue placeholder={t("priority-placeholder")} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{["low", "medium", "high", "urgent"].map((p) => (
											<SelectItem key={p} value={p}>
												{t(`priority-options.${p}`)}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.priority && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.priority.message}
						</p>
					)}
				</div>

				{/* Scheduled At */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("scheduled-at-label")}
					</Label>
					<Controller
						name='scheduled_at'
						control={control}
						render={({ field }) => (
							<DatePicker
								currentDate={field.value ? new Date(field.value) : undefined}
								onChange={(date: Date) => field.onChange(date.toISOString())}
							/>
						)}
					/>
					{errors.scheduled_at && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.scheduled_at.message}
						</p>
					)}
				</div>

				{/* Admin Notes */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("admin-notes-label")}
					</Label>
					<Textarea
						className='h-24 px-4 py-2 resize-none'
						placeholder={t("admin-notes-placeholder")}
						{...register("admin_notes")}
					/>
					{errors.admin_notes && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.admin_notes.message}
						</p>
					)}
				</div>
			</div>

			<Separator className='w-auto my-4' />

			<div className='flex items-center justify-center gap-3'>
				<DialogClose asChild>
					<Button
						type='button'
						className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-14 py-2.75 rounded-lg'>
						{t("cancel-button-text")}
					</Button>
				</DialogClose>
				<Button
					type='submit'
					disabled={isUpdating}
					className='h-12 text-base px-14 py-3 rounded-lg'>
					{isUpdating ? (
						<>
							<Loader2 className='animate-spin h-4.5 w-4.5 mr-2 rtl:mr-0 rtl:ml-2' />
							{t("save-button-loading-text")}
						</>
					) : (
						t("save-button-text")
					)}
				</Button>
			</div>
		</form>
	);
};

export default UpdateTicket;
