"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import {
	BadgeCheck,
	CalendarDays,
	Loader2,
	Mail,
	Shield,
	ShieldAlert,
	User,
	XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/queries/tenants/useUsersQuery";

interface ShowCurrentUserProps {
	userId: number | string;
	onClose?: () => void;
}

const ShowCurrentUser = ({ userId }: ShowCurrentUserProps) => {
	const t = useTranslations("tenant.users.show-current-user-page");

	const { user, isLoading } = useUser(userId);

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!user) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("not-found")}
				</p>
			</div>
		);
	}

	const isVerified = !!user.email_verified_at;
	const joinedDate = user.created_at
		? format(parseISO(user.created_at), "dd MMM yyyy")
		: "—";

	return (
		<div>
			{/* ── Avatar hero section ────────────────────────────────────────── */}
			<div className='relative flex flex-col items-center pt-6 pb-8 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent dark:from-primary/15 dark:via-primary/5 rounded-xl mb-2'>
				{/* Avatar */}
				<div className='relative mb-4'>
					{user.avatar ? (
						<img
							src={user.avatar}
							alt={user.name}
							className='w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg'
						/>
					) : (
						<div className='w-24 h-24 rounded-full bg-primary/15 ring-4 ring-white dark:ring-slate-800 shadow-lg flex items-center justify-center'>
							<User className='w-10 h-10 text-primary/60' />
						</div>
					)}

					{/* Verified dot */}
					<div
						className={cn(
							"absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow",
							isVerified ? "bg-green-500" : "bg-neutral-300 dark:bg-slate-600",
						)}>
						{isVerified ? (
							<BadgeCheck className='w-3.5 h-3.5 text-white' />
						) : (
							<XCircle className='w-3.5 h-3.5 text-white' />
						)}
					</div>
				</div>

				{/* Name + verified badge */}
				<h2 className='text-xl font-bold text-neutral-800 dark:text-neutral-100'>
					{user.name}
				</h2>
				<p className='text-sm text-neutral-500 dark:text-neutral-400 mt-0.5'>
					{user.email}
				</p>

				{/* Status pill */}
				<span
					className={cn(
						"mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
						isVerified
							? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
							: "bg-neutral-100 text-neutral-500 dark:bg-slate-700 dark:text-neutral-400",
					)}>
					{isVerified ? (
						<BadgeCheck className='w-3.5 h-3.5' />
					) : (
						<XCircle className='w-3.5 h-3.5' />
					)}
					{isVerified ? "Email Verified" : "Not Verified"}
				</span>
			</div>

			<div className='grid grid-cols-12 gap-5 pb-6 px-1'>
				{/* ── Info cells ──────────────────────────────────────────────── */}
				<div className='col-span-12 grid sm:grid-cols-2 gap-4'>
					{/* Email */}
					<div className='flex items-start gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-slate-800/60 border border-neutral-100 dark:border-slate-700'>
						<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0'>
							<Mail className='w-4 h-4' />
						</div>
						<div className='min-w-0'>
							<p className='text-xs text-neutral-400 dark:text-neutral-500 mb-0.5'>
								{t("email-label")}
							</p>
							<p className='text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate'>
								{user.email}
							</p>
						</div>
					</div>

					{/* Joined */}
					<div className='flex items-start gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-slate-800/60 border border-neutral-100 dark:border-slate-700'>
						<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0'>
							<CalendarDays className='w-4 h-4' />
						</div>
						<div>
							<p className='text-xs text-neutral-400 dark:text-neutral-500 mb-0.5'>
								{t("joined-label")}
							</p>
							<p className='text-sm font-semibold text-neutral-800 dark:text-neutral-100'>
								{joinedDate}
							</p>
						</div>
					</div>
				</div>

				{/* ── Roles ──────────────────────────────────────────────────── */}
				{user.roles?.length > 0 && (
					<>
						<div className='col-span-12 mt-1'>
							<div className='flex items-center gap-2 mb-3'>
								<Shield className='w-4 h-4 text-primary' />
								<h6 className='text-sm font-semibold text-neutral-700 dark:text-neutral-200'>
									{t("roles-label")}
								</h6>
							</div>
							<div className='flex flex-wrap gap-2'>
								{user.roles.map((role: string) => (
									<span
										key={role}
										className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize'>
										<Shield className='w-3 h-3' />
										{role}
									</span>
								))}
							</div>
						</div>
					</>
				)}

				{/* ── Permissions ─────────────────────────────────────────────── */}
				{user.permissions?.length > 0 && (
					<>
						<div className='col-span-12'>
							<Separator className='mb-4' />
							<div className='flex items-center gap-2 mb-3'>
								<ShieldAlert className='w-4 h-4 text-amber-500' />
								<h6 className='text-sm font-semibold text-neutral-700 dark:text-neutral-200'>
									{t("permissions-label")}
								</h6>
								<span className='text-xs text-neutral-400'>
									({user.permissions.length})
								</span>
							</div>
							<div className='flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1'>
								{user.permissions.map((perm: string) => (
									<span
										key={perm}
										className='inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[11px] font-medium capitalize'>
										{perm.replace(/_/g, " ")}
									</span>
								))}
							</div>
						</div>
					</>
				)}
			</div>

			<Separator className='my-4' />

			<div className='flex items-center justify-center'>
				<DialogClose asChild>
					<Button className='h-12 text-base px-14 rounded-lg'>
						{t("close-button-text")}
					</Button>
				</DialogClose>
			</div>
		</div>
	);
};

export default ShowCurrentUser;
