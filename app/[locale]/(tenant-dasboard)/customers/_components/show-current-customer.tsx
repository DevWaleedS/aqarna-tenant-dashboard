"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Ban, CheckCircle, Loader2, Star, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import ConfirmationDialog from "@/components/dailogs/confirmation-dialog";
import { useCustomer, useCustomers } from "@/hooks/queries/useCustomers";

interface ShowCurrentCustomerProps {
	customerId: number | string;
	onClose?: () => void;
}

const KYC_COLORS: Record<string, string> = {
	verified:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	pending:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	not_submitted:
		"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_COLORS: Record<string, string> = {
	active:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
	blacklisted: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ShowCurrentCustomer = ({
	customerId,
	onClose,
}: ShowCurrentCustomerProps) => {
	const t = useTranslations("tenant.customers.show-current-customer-page");
	const conformMessages = useTranslations("confirmation-dialog");
	const { customer, isLoading } = useCustomer(customerId);
	const {
		blacklistCustomer,
		isBlacklisting,
		activateCustomer,
		isActivating,
		deleteCustomer,
		isDeleting,
	} = useCustomers();

	const handleBlacklist = async () => {
		await blacklistCustomer(customerId);
		onClose?.();
	};

	const handleActivate = async () => {
		await activateCustomer(customerId);
		onClose?.();
	};

	const handleDelete = async () => {
		await deleteCustomer(customerId);
		onClose?.();
	};

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
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!customer) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("no_customer_available")}
				</p>
			</div>
		);
	}

	const isBlacklisted = customer.status === "blacklisted";
	const isActive = customer.status === "active";

	return (
		<div>
			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* ════ Basic Info ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("basic-info-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Avatar + Name + Rating row */}
				{customer.avatar && (
					<div className='col-span-12 flex items-center gap-4'>
						<img
							src={customer.avatar}
							alt={customer.name}
							className='w-16 h-16 rounded-full object-cover border border-neutral-200 dark:border-slate-600'
						/>
						<div>
							<p className='font-semibold text-neutral-800 dark:text-white'>
								{customer.name}
							</p>
							{customer.rating && (
								<div className='flex items-center gap-1 text-yellow-500 text-sm mt-0.5'>
									<Star className='w-3.5 h-3.5 fill-yellow-400' />
									<span>{customer.rating}</span>
								</div>
							)}
						</div>
					</div>
				)}

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("name-label")}
					</Label>
					<Input className='h-12 px-4' value={customer.name ?? "—"} readOnly />
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("email-label")}
					</Label>
					<Input className='h-12 px-4' value={customer.email ?? "—"} readOnly />
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("type-label")}
					</Label>
					<Input
						className='h-12 px-4 capitalize'
						value={customer.type ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("status-label")}
					</Label>
					<div className='h-12 px-4 flex items-center'>
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${
								STATUS_COLORS[customer.status] ?? STATUS_COLORS["inactive"]
							}`}>
							{customer.status}
						</span>
					</div>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("kyc-label")}
					</Label>
					<div className='h-12 px-4 flex items-center'>
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${
								KYC_COLORS[customer.kyc_status] ?? KYC_COLORS["not_submitted"]
							}`}>
							{customer.kyc_status?.replace("_", " ")}
						</span>
					</div>
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("joined-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={formatDate(customer.created_at)}
						readOnly
					/>
				</div>

				{/* ════ Identification ════ */}
				{(customer.nid_no || customer.cr_no || customer.tin) && (
					<>
						<div className='col-span-12'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("id-section")}
							</h6>
							<Separator className='w-auto' />
						</div>
						{customer.nid_no && (
							<div className='md:col-span-4 col-span-12'>
								<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
									{t("nid-label")}
								</Label>
								<Input className='h-12 px-4' value={customer.nid_no} readOnly />
							</div>
						)}
						{customer.cr_no && (
							<div className='md:col-span-4 col-span-12'>
								<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
									{t("cr-label")}
								</Label>
								<Input className='h-12 px-4' value={customer.cr_no} readOnly />
							</div>
						)}
						{customer.tin && (
							<div className='md:col-span-4 col-span-12'>
								<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
									{t("tin-label")}
								</Label>
								<Input className='h-12 px-4' value={customer.tin} readOnly />
							</div>
						)}
					</>
				)}

				{/* ════ Contact ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("contact-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='md:col-span-6 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("phone-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={
							customer.dial_code
								? `+${customer.dial_code} ${customer.phone}`
								: (customer.phone ?? "—")
						}
						readOnly
					/>
				</div>

				{customer.secondary_phone && (
					<div className='md:col-span-6 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("secondary-phone-label")}
						</Label>
						<Input
							className='h-12 px-4'
							value={
								customer.secondary_dial_code
									? `+${customer.secondary_dial_code} ${customer.secondary_phone}`
									: customer.secondary_phone
							}
							readOnly
						/>
					</div>
				)}

				{customer.address && (
					<div className='col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("address-label")}
						</Label>
						<Textarea
							value={customer.address}
							readOnly
							disabled
							className='h-20 px-4 py-2 resize-none'
						/>
					</div>
				)}

				{/* ════ Emergency Contacts ════ */}
				{customer.emergency_contact?.length > 0 && (
					<>
						<div className='col-span-12'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("emergency-contacts-section")}
							</h6>
							<Separator className='w-auto' />
						</div>
						{customer.emergency_contact.map((ec: any, i: number) => (
							<div
								key={i}
								className='col-span-12 grid grid-cols-3 gap-3 p-3 border border-neutral-200 dark:border-slate-600 rounded-lg'>
								<Input className='h-10 px-3' value={ec.name} readOnly />
								<Input className='h-10 px-3' value={ec.phone} readOnly />
								<Input
									className='h-10 px-3 capitalize'
									value={ec.relation}
									readOnly
								/>
							</div>
						))}
					</>
				)}

				{/* ════ Vehicles ════ */}
				{customer.vehicles?.length > 0 && (
					<>
						<div className='col-span-12'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("vehicles-section")}
							</h6>
							<Separator className='w-auto' />
						</div>
						{customer.vehicles.map((v: any, i: number) => (
							<div
								key={i}
								className='col-span-12 flex flex-wrap gap-2 p-3 border border-neutral-200 dark:border-slate-600 rounded-lg text-sm'>
								<span className='font-semibold'>
									{v.make} {v.model}
								</span>
								<span className='text-neutral-500'>·</span>
								<span>{v.model_year}</span>
								<span className='text-neutral-500'>·</span>
								<span className='capitalize'>{v.color}</span>
								<span className='text-neutral-500'>·</span>
								<span className='font-mono'>{v.plate_number}</span>
							</div>
						))}
					</>
				)}

				{/* ════ Pets ════ */}
				{customer.pets?.length > 0 && (
					<>
						<div className='col-span-12'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("pets-section")}
							</h6>
							<Separator className='w-auto' />
						</div>
						{customer.pets.map((p: any, i: number) => (
							<div
								key={i}
								className='col-span-12 flex flex-wrap gap-2 p-3 border border-neutral-200 dark:border-slate-600 rounded-lg text-sm'>
								<span className='capitalize font-semibold'>{p.type}</span>
								<span className='text-neutral-500'>·</span>
								<span>{p.name}</span>
								{p.breed && (
									<>
										<span className='text-neutral-500'>·</span>
										<span className='text-neutral-500'>{p.breed}</span>
									</>
								)}
							</div>
						))}
					</>
				)}

				{/* ════ Notes ════ */}
				{customer.notes && (
					<div className='col-span-full'>
						<Separator className='w-auto mt-2 mb-4' />
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("notes-label")}
						</Label>
						<Textarea
							value={customer.notes}
							readOnly
							disabled
							className='h-20 px-4 py-2 resize-none'
						/>
					</div>
				)}
			</div>

			<Separator className='w-auto my-4' />

			<div className='flex items-center justify-center gap-3 flex-wrap'>
				{/* Delete */}
				<ConfirmationDialog
					type='danger'
					confirmText={conformMessages("confirm-delete-button-text")}
					title={conformMessages("title")}
					icon={<Trash2 className='w-5 h-5' />}
					trigger={
						<Button
							type='button'
							variant='outline'
							disabled={isDeleting}
							className='h-12 border border-red-600 bg-transparent hover:bg-red-600/20 text-red-600 text-base px-8 rounded-lg'>
							{isDeleting ? (
								<>
									<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
									{t("deleting-button-text")}
								</>
							) : (
								<>
									<Trash2 className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
									{t("delete-button-text")}
								</>
							)}
						</Button>
					}
					onConfirm={handleDelete}>
					{conformMessages("delete-message")}
				</ConfirmationDialog>

				{/* Blacklist / Activate toggle */}
				{isActive ? (
					<ConfirmationDialog
						type='danger'
						confirmText={conformMessages("confirm-terminate-button-text")}
						title={conformMessages("title")}
						icon={<Ban className='w-5 h-5' />}
						trigger={
							<Button
								type='button'
								variant='outline'
								disabled={isBlacklisting}
								className='h-12 border border-orange-500 bg-transparent hover:bg-orange-500/10 text-orange-500 text-base px-8 rounded-lg'>
								{isBlacklisting ? (
									<>
										<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
										{t("blacklisting-button-text")}
									</>
								) : (
									<>
										<Ban className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
										{t("terminate-button-text")}
									</>
								)}
							</Button>
						}
						onConfirm={handleBlacklist}>
						{conformMessages("terminate-message")}
					</ConfirmationDialog>
				) : isBlacklisted ? (
					<ConfirmationDialog
						type='info'
						confirmText={conformMessages("confirm-activate-button-text")}
						title={conformMessages("title")}
						icon={<CheckCircle className='w-5 h-5' />}
						trigger={
							<Button
								type='button'
								disabled={isActivating}
								className='h-12 text-base px-8 rounded-lg'>
								{isActivating ? (
									<>
										<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
										{t("activating-button-text")}
									</>
								) : (
									<>
										<CheckCircle className='w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2' />
										{t("activate-button-text")}
									</>
								)}
							</Button>
						}
						onConfirm={handleActivate}>
						{conformMessages("terminate-message")}
					</ConfirmationDialog>
				) : null}

				<DialogClose asChild>
					<Button className='h-12 text-base px-14 py-3 rounded-lg'>
						{t("close-button-text")}
					</Button>
				</DialogClose>
			</div>
		</div>
	);
};

export default ShowCurrentCustomer;
