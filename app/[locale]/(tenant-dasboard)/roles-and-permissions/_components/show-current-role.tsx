"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import {
	CalendarDays,
	Hash,
	Loader2,
	RefreshCw,
	Shield,
	ShieldCheck,
	ShieldOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { useRole } from "@/hooks/queries/useRoles";
import { cn } from "@/lib/utils";

interface ShowCurrentRoleProps {
	roleId: number | string;
}

// Action color map for permission badges
const ACTION_COLORS: Record<string, string> = {
	read: "bg-blue-50   dark:bg-blue-900/20  text-blue-600   dark:text-blue-400   border-blue-100   dark:border-blue-800",
	create:
		"bg-green-50  dark:bg-green-900/20 text-green-600  dark:text-green-400  border-green-100  dark:border-green-800",
	update:
		"bg-amber-50  dark:bg-amber-900/20 text-amber-600  dark:text-amber-400  border-amber-100  dark:border-amber-800",
	delete:
		"bg-red-50    dark:bg-red-900/20   text-red-600    dark:text-red-400    border-red-100    dark:border-red-800",
	export:
		"bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800",
};

const getActionColor = (action: string) =>
	ACTION_COLORS[action] ??
	"bg-neutral-100 dark:bg-slate-700 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-slate-600";

const ShowCurrentRole = ({ roleId }: ShowCurrentRoleProps) => {
	const t = useTranslations("tenant.roles.show-page");
	const { role, isLoading } = useRole(roleId);

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8 text-primary' />
			</div>
		);
	}

	if (!role) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("not-found")}
				</p>
			</div>
		);
	}

	// Group permissions by resource
	const grouped = (role.permissions ?? []).reduce<Record<string, string[]>>(
		(acc, perm) => {
			const [resource] = perm.split(".");
			const key = resource ?? perm;
			if (!acc[key]) acc[key] = [];
			acc[key].push(perm);
			return acc;
		},
		{},
	);

	return (
		<div>
			{/* ── Hero ─────────────────────────────────────────────────────── */}
			<div className='relative flex flex-col items-center pt-6 pb-8 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent dark:from-primary/15 dark:via-primary/5 rounded-xl mb-4'>
				<div className='w-20 h-20 rounded-2xl bg-primary/15 ring-4 ring-white dark:ring-slate-800 shadow-lg flex items-center justify-center mb-4'>
					<Shield className='w-9 h-9 text-primary' />
				</div>
				<h2 className='text-2xl font-extrabold text-neutral-800 dark:text-neutral-100 capitalize'>
					{role.name}
				</h2>
				<span className='mt-2 text-xs font-mono text-neutral-400 dark:text-neutral-500'>
					guard: {role.guard_name}
				</span>

				{/* Stats row */}
				<div className='mt-4 flex items-center gap-4'>
					<div className='flex flex-col items-center'>
						<span className='text-2xl font-extrabold text-primary'>
							{role.permissions_count}
						</span>
						<span className='text-[11px] text-neutral-400 dark:text-neutral-500'>
							permissions
						</span>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-12 gap-4 pb-4 px-1'>
				{/* Info cells */}
				<div className='col-span-12 grid sm:grid-cols-3 gap-3'>
					{[
						{
							icon: <Hash className='w-4 h-4' />,
							label: "ID",
							value: `#${role.id}`,
							mono: true,
						},
						{
							icon: <CalendarDays className='w-4 h-4' />,
							label: t("created-label"),
							value: role.created_at
								? format(role.created_at, "dd MMM yyyy")
								: "—",
						},
						{
							icon: <RefreshCw className='w-4 h-4' />,
							label: t("updated-label"),
							value: role.updated_at
								? format(role.updated_at, "dd MMM yyyy")
								: "—",
						},
					].map(({ icon, label, value, mono }) => (
						<div
							key={label}
							className='flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-slate-800/60 border border-neutral-100 dark:border-slate-700'>
							<div className='w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5'>
								{icon}
							</div>
							<div>
								<p className='text-[11px] text-neutral-400 dark:text-neutral-500 mb-0.5'>
									{label}
								</p>
								<p
									className={cn(
										"text-sm font-semibold text-neutral-800 dark:text-neutral-100",
										mono && "font-mono",
									)}>
									{value}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* ── Permissions grouped ─────────────────────────────────── */}
				<div className='col-span-12'>
					<div className='flex items-center gap-2 mb-3'>
						<ShieldCheck className='w-4 h-4 text-primary' />
						<h6 className='text-sm font-bold text-neutral-700 dark:text-neutral-200'>
							{t("permissions-label")}
						</h6>
						<span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary ml-auto'>
							{role.permissions_count} total
						</span>
					</div>

					{Object.keys(grouped).length === 0 ? (
						<div className='flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-neutral-200 dark:border-slate-700 text-neutral-400 dark:text-neutral-500'>
							<ShieldOff className='w-7 h-7 mb-2 opacity-50' />
							<p className='text-sm'>{t("no-permissions")}</p>
						</div>
					) : (
						<div className='space-y-2 max-h-64 overflow-y-auto pr-0.5'>
							{Object.entries(grouped).map(([resource, perms]) => (
								<div
									key={resource}
									className='rounded-xl border border-neutral-100 dark:border-slate-700 overflow-hidden'>
									{/* Resource header */}
									<div className='flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-slate-800/60'>
										<Shield className='w-3.5 h-3.5 text-primary shrink-0' />
										<span className='text-sm font-bold text-neutral-700 dark:text-neutral-200 capitalize flex-1'>
											{resource}
										</span>
										<span className='text-[11px] text-neutral-400 dark:text-neutral-500'>
											{perms.length} action{perms.length !== 1 ? "s" : ""}
										</span>
									</div>
									{/* Permission badges */}
									<div className='px-4 py-3 flex flex-wrap gap-1.5'>
										{perms.map((perm) => {
											const action = perm.split(".")[1] ?? perm;
											return (
												<span
													key={perm}
													className={cn(
														"inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize",
														getActionColor(action),
													)}>
													{action}
												</span>
											);
										})}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<Separator className='my-4' />

			<div className='flex justify-center'>
				<DialogClose asChild>
					<Button className='h-12 text-base px-14 rounded-lg'>
						{t("close-button-text")}
					</Button>
				</DialogClose>
			</div>
		</div>
	);
};

export default ShowCurrentRole;
