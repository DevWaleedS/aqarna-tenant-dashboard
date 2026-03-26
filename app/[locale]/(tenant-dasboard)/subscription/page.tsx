"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { format, differenceInDays, parseISO } from "date-fns";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertCircle,
	ArrowUpCircle,
	BadgeCheck,
	Building2,
	CalendarCheck2,
	CalendarClock,
	CheckCircle2,
	ChevronRight,
	CreditCard,
	Hash,
	Home,
	Layers,
	Loader2,
	RefreshCcw,
	ShieldCheck,
	Sparkles,
	Users,
	XCircle,
	Zap,
} from "lucide-react";
import {
	useSubscription,
	usePackagesLookup,
} from "@/hooks/queries/useSubscription";
import {
	renewSubscriptionSchema,
	renewSubscriptionType,
	upgradeSubscriptionSchema,
	upgradeSubscriptionType,
} from "@/lib/zod";
import { cn } from "@/lib/utils";

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<
	string,
	{ bg: string; text: string; icon: React.ReactNode }
> = {
	active: {
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-700 dark:text-green-400",
		icon: <BadgeCheck className='w-4 h-4' />,
	},
	trial: {
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-700 dark:text-blue-400",
		icon: <Sparkles className='w-4 h-4' />,
	},
	expired: {
		bg: "bg-red-100 dark:bg-red-900/30",
		text: "text-red-700 dark:text-red-400",
		icon: <XCircle className='w-4 h-4' />,
	},
	cancelled: {
		bg: "bg-gray-100 dark:bg-gray-800",
		text: "text-gray-600 dark:text-gray-400",
		icon: <XCircle className='w-4 h-4' />,
	},
	pending: {
		bg: "bg-yellow-100 dark:bg-yellow-900/30",
		text: "text-yellow-700 dark:text-yellow-400",
		icon: <AlertCircle className='w-4 h-4' />,
	},
};

// ── Info cell ──────────────────────────────────────────────────────────────────
const InfoCell = ({
	icon,
	label,
	value,
	mono = false,
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	mono?: boolean;
}) => (
	<div className='flex items-start gap-3'>
		<div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5'>
			{icon}
		</div>
		<div>
			<p className='text-xs text-neutral-500 dark:text-neutral-400 mb-0.5'>
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
);

// ── Package Select shared sub-component ───────────────────────────────────────
const PackageSelect = ({
	value,
	onChange,
	packages,
	isLoading,
	placeholder,
}: {
	value: string;
	onChange: (val: string) => void;
	packages: { id: number; name: string }[];
	isLoading: boolean;
	placeholder: string;
}) => (
	<Select value={value} onValueChange={onChange} disabled={isLoading}>
		<SelectTrigger className='h-12! px-4 w-full'>
			{isLoading ? (
				<span className='flex items-center gap-2 text-neutral-400'>
					<Loader2 className='w-3.5 h-3.5 animate-spin' />
					Loading packages...
				</span>
			) : (
				<SelectValue placeholder={placeholder} />
			)}
		</SelectTrigger>
		<SelectContent>
			<SelectGroup>
				{packages.map((pkg) => (
					<SelectItem key={pkg.id} value={String(pkg.id)}>
						{pkg.name}
					</SelectItem>
				))}
			</SelectGroup>
		</SelectContent>
	</Select>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const Subscription = () => {
	const t = useTranslations("tenant.subscription");
	const locale = useLocale();
	const [renewDialogOpen, setRenewDialogOpen] = useState(false);
	const [renewResult, setRenewResult] = useState<{
		payment_token: string;
		transaction_id: number;
	} | null>(null);
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	const {
		subscription,
		pkg,
		isLoading,
		renewSubscription,
		isRenewing,
		upgradeSubscription,
		isUpgrading,
	} = useSubscription();

	const { packagesLookup, isLoading: packagesLoading } = usePackagesLookup();

	// ── Renew form ──────────────────────────────────────────────────────────
	const {
		control: renewControl,
		handleSubmit: handleRenewSubmit,
		formState: { errors: renewErrors },
		reset: resetRenew,
	} = useForm<renewSubscriptionType>({
		resolver: zodResolver(renewSubscriptionSchema),
		defaultValues: { package_id: undefined },
	});

	// ── Upgrade form ────────────────────────────────────────────────────────
	const {
		control: upgradeControl,
		handleSubmit: handleUpgradeSubmit,
		formState: { errors: upgradeErrors },
		reset: resetUpgrade,
		watch: watchUpgrade,
	} = useForm<upgradeSubscriptionType>({
		resolver: zodResolver(upgradeSubscriptionSchema),
		defaultValues: { package_id: undefined, billing_cycle: undefined },
	});

	// Dates & days remaining
	const endDate = subscription?.ends_at ? parseISO(subscription.ends_at) : null;
	const daysLeft = endDate ? differenceInDays(endDate, new Date()) : null;
	const expiresSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
	const isExpired = daysLeft !== null && daysLeft < 0;

	const statusKey = subscription?.status ?? "pending";
	const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES["active"];

	// ── Handlers ─────────────────────────────────────────────────────────────
	const handleRenew = async (data: renewSubscriptionType) => {
		const res = await renewSubscription(data);
		if (res?.data) {
			setRenewResult(res.data);
			resetRenew();
		}
	};

	const onUpgradeSubmit = async (data: upgradeSubscriptionType) => {
		await upgradeSubscription(data, {
			onSuccess: () => {
				resetUpgrade();
				setUpgradeOpen(false);
			},
		});
	};

	const handleRenewClose = (open: boolean) => {
		setRenewDialogOpen(open);
		if (!open) {
			setRenewResult(null);
			resetRenew();
		}
	};

	// ── Loading ───────────────────────────────────────────────────────────────
	if (isLoading) {
		return (
			<>
				<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />
				<div className='flex justify-center items-center py-24'>
					<Loader2 className='animate-spin h-9 w-9 text-primary' />
				</div>
			</>
		);
	}
	console.log("pkg", pkg);

	// ── No subscription ───────────────────────────────────────────────────────
	if (!subscription && !pkg) {
		return (
			<>
				<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />
				<div className='mt-8 flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800/30'>
					<div className='w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center'>
						<CreditCard className='w-8 h-8 text-primary' />
					</div>
					<h3 className='text-xl font-bold text-neutral-800 dark:text-neutral-100'>
						{t("current-plan-card.no-subscription")}
					</h3>
					<p className='text-sm text-neutral-500 dark:text-neutral-400 max-w-sm text-center'>
						{t("current-plan-card.no-subscription-desc")}
					</p>
					<Button
						onClick={() => setUpgradeOpen(true)}
						className='mt-2 gap-2 px-8 h-11'>
						<Sparkles className='w-4 h-4' />
						{t("upgrade-section.upgrade-button")}
					</Button>
				</div>

				<UpgradeDialog
					open={upgradeOpen}
					onOpenChange={setUpgradeOpen}
					control={upgradeControl}
					handleSubmit={handleUpgradeSubmit}
					errors={upgradeErrors}
					isUpgrading={isUpgrading}
					onSubmit={onUpgradeSubmit}
					packages={packagesLookup}
					packagesLoading={packagesLoading}
					t={t}
				/>
			</>
		);
	}

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			{/* ── Expiry / expired alert banner ───────────────────────────── */}
			{(expiresSoon || isExpired) && (
				<div
					className={cn(
						"mt-5 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium",
						isExpired
							? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
							: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400",
					)}>
					<AlertCircle className='w-4 h-4 shrink-0' />
					{isExpired
						? t("current-plan-card.expired-notice")
						: t("current-plan-card.expires-soon")}
					{!isExpired && daysLeft !== null && (
						<span className='ml-1 font-bold'>
							({t("current-plan-card.days-remaining", { days: daysLeft })})
						</span>
					)}
					<Button
						size='sm'
						onClick={() => setRenewDialogOpen(true)}
						className='ml-auto h-8 px-4 text-xs gap-1.5'>
						<RefreshCcw className='w-3.5 h-3.5' />
						{t("current-plan-card.renew-button")}
					</Button>
				</div>
			)}

			<div className='mt-6 grid grid-cols-12 gap-5'>
				{/* ── Left column: current plan ──────────────────────────────── */}
				<div className='lg:col-span-7 col-span-12 space-y-5'>
					{/* Current Plan card */}
					<div className='rounded-2xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm'>
						{/* Card header */}
						<div className='px-6 pt-6 pb-4 flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
									<CreditCard className='w-5 h-5' />
								</div>
								<div>
									<p className='text-xs text-neutral-500 dark:text-neutral-400'>
										{t("info-cards.plan")}
									</p>
									<h2 className='text-lg font-bold text-neutral-800 dark:text-neutral-100'>
										{pkg?.name[locale] ?? "—"}
									</h2>
								</div>
							</div>

							{/* Status badge */}
							<span
								className={cn(
									"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
									statusStyle.bg,
									statusStyle.text,
								)}>
								{statusStyle.icon}
								{t(`status.${statusKey}`)}
							</span>
						</div>

						<Separator />

						{/* Details grid */}
						<div className='p-6 grid sm:grid-cols-2 grid-cols-1 gap-5'>
							<InfoCell
								icon={<CalendarCheck2 className='w-4 h-4' />}
								label={t("current-plan-card.start-date-label")}
								value={
									subscription?.starts_at
										? format(parseISO(subscription.starts_at), "dd MMM yyyy")
										: "—"
								}
							/>
							<InfoCell
								icon={<CalendarClock className='w-4 h-4' />}
								label={t("current-plan-card.end-date-label")}
								value={endDate ? format(endDate, "dd MMM yyyy") : "—"}
							/>
							<InfoCell
								icon={<RefreshCcw className='w-4 h-4' />}
								label={t("current-plan-card.billing-cycle-label")}
								value={
									subscription?.billing_cycle
										? t(`billing_cycle.${subscription.billing_cycle}`)
										: "—"
								}
							/>
							<InfoCell
								icon={
									subscription?.auto_renew ? (
										<CheckCircle2 className='w-4 h-4' />
									) : (
										<XCircle className='w-4 h-4' />
									)
								}
								label='Auto-renew'
								value={
									subscription?.auto_renew
										? t("current-plan-card.auto-renew-on")
										: t("current-plan-card.auto-renew-off")
								}
							/>
						</div>

						{/* Days remaining progress */}
						{daysLeft !== null &&
							daysLeft >= 0 &&
							subscription?.billing_cycle && (
								<div className='px-6 pb-5'>
									<div className='flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5'>
										<span>
											{t("current-plan-card.days-remaining", {
												days: daysLeft,
											})}
										</span>
										<span>
											{subscription.billing_cycle === "yearly"
												? "365 days"
												: "30 days"}
										</span>
									</div>
									<div className='h-2 rounded-full bg-neutral-100 dark:bg-slate-700 overflow-hidden'>
										<div
											className={cn(
												"h-full rounded-full transition-all",
												expiresSoon ? "bg-yellow-400" : "bg-primary",
											)}
											style={{
												width: `${Math.min(
													100,
													(daysLeft /
														(subscription.billing_cycle === "yearly"
															? 365
															: 30)) *
														100,
												)}%`,
											}}
										/>
									</div>
								</div>
							)}

						{/* Action buttons */}
						<div className='px-6 pb-6 flex flex-wrap gap-3'>
							<Button
								onClick={() => setRenewDialogOpen(true)}
								variant='outline'
								className='gap-2 h-10'>
								<RefreshCcw className='w-4 h-4' />
								{t("current-plan-card.renew-button")}
							</Button>
							<Button
								onClick={() => setUpgradeOpen(true)}
								className='gap-2 h-10'>
								<ArrowUpCircle className='w-4 h-4' />
								{t("upgrade-section.upgrade-button")}
							</Button>
						</div>
					</div>
				</div>

				{/* ── Right column: package details ─────────────────────────── */}
				<div className='lg:col-span-5 col-span-12 space-y-5'>
					{/* Package info card */}
					<div className='rounded-2xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm'>
						{/* Gradient header */}
						<div className='px-6 py-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10'>
							<div className='flex items-center gap-2 mb-1'>
								<Zap className='w-4 h-4 text-primary' />
								<p className='text-xs font-medium text-primary'>
									{t("package-card.title")}
								</p>
							</div>
							<h3 className='text-2xl font-extrabold text-neutral-800 dark:text-neutral-100'>
								{pkg?.name[locale] ?? "—"}
							</h3>
							{pkg?.description && (
								<p className='text-sm text-neutral-500 dark:text-neutral-400 mt-1'>
									{pkg.description[locale]}
								</p>
							)}

							{/* Price display */}
							{(pkg?.price_monthly || pkg?.price_yearly) && (
								<div className='mt-3 flex items-end gap-1'>
									<span className='text-3xl font-extrabold text-neutral-900 dark:text-white'>
										{new Intl.NumberFormat("en-US").format(
											subscription?.billing_cycle === "yearly"
												? (pkg?.price_yearly ?? 0)
												: (pkg?.price_monthly ?? 0),
										)}
									</span>
									<span className='text-sm text-neutral-500 dark:text-neutral-400 mb-1'>
										{subscription?.billing_cycle === "yearly"
											? t("package-card.price-yearly")
											: t("package-card.price-monthly")}
									</span>
								</div>
							)}
						</div>

						<Separator />

						{/* Features / limits */}
						<div className='p-6 space-y-3'>
							<p className='text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide'>
								{t("package-card.features-title")}
							</p>

							{[
								{
									icon: <Home className='w-4 h-4' />,
									label: pkg?.max_properties
										? t("package-card.max-properties", {
												count: pkg.max_properties,
											})
										: t("package-card.unlimited") + " Properties",
								},
								{
									icon: <Building2 className='w-4 h-4' />,
									label: pkg?.max_units
										? t("package-card.max-units", { count: pkg.max_units })
										: t("package-card.unlimited") + " Units",
								},
								{
									icon: <Users className='w-4 h-4' />,
									label: pkg?.max_users
										? t("package-card.max-users", { count: pkg.max_users })
										: t("package-card.unlimited") + " Users",
								},
								...(pkg?.features[locale]?.map((f: string) => ({
									icon: <ShieldCheck className='w-4 h-4' />,
									label: f,
								})) ?? []),
							].map((item, i) => (
								<div key={i} className='flex items-center gap-3'>
									<div className='w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0'>
										{item.icon}
									</div>
									<span className='text-sm text-neutral-700 dark:text-neutral-300 capitalize'>
										{item.label}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Quick stats strip */}
					<div className='grid grid-cols-2 gap-3'>
						{[
							{
								icon: <Layers className='w-4 h-4' />,
								label: t("info-cards.billing"),
								value: subscription?.billing_cycle
									? t(`billing_cycle.${subscription.billing_cycle}`)
									: "—",
							},
							{
								icon: <Hash className='w-4 h-4' />,
								label: "Subscription ID",
								value: subscription?.id ? `#${subscription.id}` : "—",
								mono: true,
							},
						].map(({ icon, label, value, mono }) => (
							<div
								key={label}
								className='flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900'>
								<div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0'>
									{icon}
								</div>
								<div className='min-w-0'>
									<p className='text-xs text-neutral-500 dark:text-neutral-400 truncate'>
										{label}
									</p>
									<p
										className={cn(
											"text-sm font-bold text-neutral-800 dark:text-neutral-100 truncate",
											mono && "font-mono",
										)}>
										{value}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ════════════════════════════════════════════════════════════════
			    RENEW DIALOG — requires selecting a package (body: { package_id })
			══════════════════════════════════════════════════════════════════ */}
			<Dialog open={renewDialogOpen} onOpenChange={handleRenewClose}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<RefreshCcw className='w-5 h-5 text-primary' />
							{renewResult
								? t("renew-dialog.success-title")
								: t("renew-dialog.title")}
						</DialogTitle>
						<DialogDescription>
							{renewResult
								? t("renew-dialog.success-desc")
								: t("renew-dialog.description")}
						</DialogDescription>
					</DialogHeader>

					{renewResult ? (
						/* ── Renewal success state ── */
						<div className='space-y-4 py-2'>
							<div className='p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3'>
								<CheckCircle2 className='w-5 h-5 text-green-600 dark:text-green-400 shrink-0' />
								<p className='text-sm text-green-700 dark:text-green-400 font-medium'>
									{t("renew-dialog.success-desc")}
								</p>
							</div>

							<div className='space-y-3'>
								<div>
									<Label className='text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5 block'>
										{t("renew-dialog.payment-token-label")}
									</Label>
									<div className='p-3 rounded-lg bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-600 font-mono text-sm text-neutral-700 dark:text-neutral-300 break-all'>
										{renewResult.payment_token}
									</div>
								</div>
								<div>
									<Label className='text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5 block'>
										{t("renew-dialog.transaction-id-label")}
									</Label>
									<div className='p-3 rounded-lg bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-600 font-mono text-sm font-semibold text-neutral-800 dark:text-neutral-100'>
										#{renewResult.transaction_id}
									</div>
								</div>
							</div>

							<DialogClose asChild>
								<Button className='w-full h-11 mt-2'>
									{t("renew-dialog.close")}
								</Button>
							</DialogClose>
						</div>
					) : (
						/* ── Renew form — select package + confirm ── */
						<form
							onSubmit={handleRenewSubmit(handleRenew)}
							className='space-y-4 py-2'>
							{/* Current plan summary */}
							<div className='p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-2'>
								<div className='flex items-center justify-between text-sm'>
									<span className='text-neutral-500 dark:text-neutral-400'>
										{t("current-plan-card.package-label")}
									</span>
									<span className='font-semibold text-neutral-800 dark:text-neutral-100'>
										{pkg?.name[locale] ?? "—"}
									</span>
								</div>
								<div className='flex items-center justify-between text-sm'>
									<span className='text-neutral-500 dark:text-neutral-400'>
										{t("current-plan-card.billing-cycle-label")}
									</span>
									<span className='font-semibold text-neutral-800 dark:text-neutral-100 capitalize'>
										{subscription?.billing_cycle ?? "—"}
									</span>
								</div>
								{endDate && (
									<div className='flex items-center justify-between text-sm'>
										<span className='text-neutral-500 dark:text-neutral-400'>
											{t("current-plan-card.end-date-label")}
										</span>
										<span className='font-semibold text-neutral-800 dark:text-neutral-100'>
											{format(endDate, "dd MMM yyyy")}
										</span>
									</div>
								)}
							</div>

							{/* Package selector */}
							<div>
								<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
									{t("upgrade-section.package-id-label")}
									<span className='text-red-600'>*</span>
								</Label>
								<Controller
									name='package_id'
									control={renewControl}
									render={({ field }) => (
										<PackageSelect
											value={field.value ? String(field.value) : ""}
											onChange={(val) => field.onChange(Number(val))}
											packages={packagesLookup}
											isLoading={packagesLoading}
											placeholder={t("upgrade-section.package-id-placeholder")}
										/>
									)}
								/>
								{renewErrors.package_id && (
									<p className='text-red-500 text-sm mt-1'>
										{renewErrors.package_id.message}
									</p>
								)}
							</div>

							<div className='flex gap-3 pt-1'>
								<DialogClose asChild>
									<Button
										type='button'
										variant='outline'
										className='flex-1 h-11 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'>
										{t("renew-dialog.cancel")}
									</Button>
								</DialogClose>
								<Button
									type='submit'
									disabled={isRenewing}
									className='flex-1 h-11 gap-2'>
									{isRenewing ? (
										<>
											<Loader2 className='animate-spin w-4 h-4' />
											{t("current-plan-card.renew-loading")}
										</>
									) : (
										<>
											<RefreshCcw className='w-4 h-4' />
											{t("renew-dialog.confirm")}
										</>
									)}
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>

			{/* ── Upgrade Dialog ─────────────────────────────────────────────── */}
			<UpgradeDialog
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
				control={upgradeControl}
				handleSubmit={handleUpgradeSubmit}
				errors={upgradeErrors}
				isUpgrading={isUpgrading}
				onSubmit={onUpgradeSubmit}
				packages={packagesLookup}
				packagesLoading={packagesLoading}
				t={t}
			/>
		</>
	);
};

// ════════════════════════════════════════════════════════════════════════════
// UPGRADE DIALOG — Select package from lookup + choose billing cycle
// ════════════════════════════════════════════════════════════════════════════
interface UpgradeDialogProps {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	control: any;
	handleSubmit: any;
	errors: any;
	isUpgrading: boolean;
	onSubmit: (data: upgradeSubscriptionType) => void;
	packages: { id: number; name: string }[];
	packagesLoading: boolean;
	t: ReturnType<typeof useTranslations>;
}

const UpgradeDialog = ({
	open,
	onOpenChange,
	control,
	handleSubmit,
	errors,
	isUpgrading,
	onSubmit,
	packages,
	packagesLoading,
	t,
}: UpgradeDialogProps) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className='max-w-lg'>
			<DialogHeader>
				<DialogTitle className='flex items-center gap-2'>
					<ArrowUpCircle className='w-5 h-5 text-primary' />
					{t("upgrade-section.title")}
				</DialogTitle>
				<DialogDescription>
					{t("upgrade-section.description")}
				</DialogDescription>
			</DialogHeader>

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-5 py-1'>
				{/* Package Select */}
				<div>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("upgrade-section.package-id-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='package_id'
						control={control}
						render={({ field }) => (
							<PackageSelect
								value={field.value ? String(field.value) : ""}
								onChange={(val) => field.onChange(Number(val))}
								packages={packages}
								isLoading={packagesLoading}
								placeholder={t("upgrade-section.package-id-placeholder")}
							/>
						)}
					/>
					{errors.package_id && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.package_id.message}
						</p>
					)}
				</div>

				{/* Billing cycle toggle cards */}
				<div>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-3'>
						{t("upgrade-section.billing-cycle-label")}
						<span className='text-red-600'>*</span>
					</Label>
					<Controller
						name='billing_cycle'
						control={control}
						render={({ field }) => (
							<div className='grid grid-cols-2 gap-3'>
								{(["monthly", "yearly"] as const).map((cycle) => (
									<button
										key={cycle}
										type='button'
										onClick={() => field.onChange(cycle)}
										className={cn(
											"relative flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
											field.value === cycle
												? "border-primary bg-primary/5 dark:bg-primary/10"
												: "border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-neutral-300 dark:hover:border-slate-600",
										)}>
										{cycle === "yearly" && (
											<span className='absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'>
												SAVE 20%
											</span>
										)}
										<div
											className={cn(
												"w-7 h-7 rounded-lg flex items-center justify-center",
												field.value === cycle
													? "bg-primary/20 text-primary"
													: "bg-neutral-100 dark:bg-slate-800 text-neutral-400",
											)}>
											{cycle === "monthly" ? (
												<CalendarCheck2 className='w-3.5 h-3.5' />
											) : (
												<CalendarClock className='w-3.5 h-3.5' />
											)}
										</div>
										<p className='text-sm font-semibold text-neutral-800 dark:text-neutral-100'>
											{t(`upgrade-section.${cycle}-label`)}
										</p>
										<p className='text-xs text-neutral-500 dark:text-neutral-400'>
											{t(`upgrade-section.${cycle}-desc`)}
										</p>
										{field.value === cycle && (
											<div className='absolute top-2 left-2 w-2 h-2 rounded-full bg-primary' />
										)}
									</button>
								))}
							</div>
						)}
					/>
					{errors.billing_cycle && (
						<p className='text-red-500 text-sm mt-1'>
							{errors.billing_cycle.message}
						</p>
					)}
				</div>

				<Separator />

				<div className='flex gap-3'>
					<DialogClose asChild>
						<Button
							type='button'
							variant='outline'
							className='flex-1 h-11 border-red-200  text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'>
							{t("upgrade-section.cancel-button")}
						</Button>
					</DialogClose>
					<Button
						type='submit'
						disabled={isUpgrading}
						className='flex-1 h-11 gap-2'>
						{isUpgrading ? (
							<>
								<Loader2 className='animate-spin w-4 h-4' />
								{t("upgrade-section.upgrade-loading")}
							</>
						) : (
							<>
								<Sparkles className='w-4 h-4' />
								{t("upgrade-section.upgrade-button")}
							</>
						)}
					</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>
);

export default Subscription;
