"use client";
import { useState } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { useSetting } from "@/hooks/queries/central/useSetting";
import { useTranslations, useLocale } from "next-intl";
import SettingForm from "./_components/validate-form";
import { Loader2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const Setting = () => {
	const t = useTranslations("central.setting");
	const locale = useLocale();
	const isRTL = locale === "ar";
	const isMobile = useIsMobile();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { settings, settingsByArea, isLoadingSettings } = useSetting();
	const [activeArea, setActiveArea] = useState<string>("");

	// Get translated area labels
	const getAreaLabel = (area: string) => {
		return t(`areas.${area}`) || area;
	};

	if (isLoadingSettings) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='flex flex-col items-center gap-3'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
					<p className='text-sm text-neutral-600 dark:text-neutral-400'>
						{t("loading")}
					</p>
				</div>
			</div>
		);
	}

	// Get unique areas and sort them
	const areas = Object.keys(settingsByArea || {}).sort();
	const activeAreaState = activeArea || areas[0] || "general";

	return (
		<>
			<DashboardBreadcrumb title={t("subtitle")} text={t("title")} />

			{/* Responsive Layout */}
			<div className={cn("mt-15 flex", isRTL && "flex-row")}>
				{/* Sidebar - Desktop */}
				<div className={cn("hidden md:block w-65 shrink-0 pe-4")}>
					<div className='sticky top-24 card  rounded-lg border p-5'>
						<SidebarGroup className='p-0'>
							<SidebarMenu>
								{areas.map((area) => (
									<SidebarMenuItem key={area}>
										<SidebarMenuButton
											asChild
											className={cn(
												"cursor-pointer py-5.5 px-3 text-base text-[#4b5563] dark:text-white hover:bg-primary/10 active:bg-primary/10 dark:hover:bg-slate-700",
												isRTL ? "text-right" : "text-left",
												activeAreaState === area
													? "bg-primary hover:bg-primary text-white dark:hover:bg-primary dark:bg-primary hover:text-white"
													: "",
											)}
											onClick={() => setActiveArea(area)}>
											<button
												className={cn(
													"w-full",
													isRTL ? "text-right" : "text-left",
												)}>
												{getAreaLabel(area)}
											</button>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroup>
					</div>
				</div>

				{/* Sidebar - Mobile */}
				{isMobile && sidebarOpen && (
					<div
						className='fixed inset-0 z-40 bg-black/50 md:hidden'
						onClick={() => setSidebarOpen(false)}
					/>
				)}
				{isMobile && sidebarOpen && (
					<div
						className={cn(
							"fixed inset-y-0 z-50 w-64 bg-white dark:bg-neutral-900 overflow-y-auto",
							isRTL
								? "right-0 border-l border-neutral-200 dark:border-neutral-800"
								: "left-0 border-e border-neutral-200 dark:border-neutral-800",
						)}>
						<div className='p-4'>
							<div
								className={cn(
									"flex items-center mb-4 justify-between",
									isRTL && "flex-row-reverse",
								)}>
								<span className='font-semibold text-lg'>{t("title")}</span>
								<button
									onClick={() => setSidebarOpen(false)}
									className='p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded'>
									<X className='w-5 h-5' />
								</button>
							</div>
							<SidebarGroup className='p-0'>
								<SidebarMenu>
									{areas.map((area) => (
										<SidebarMenuItem key={area}>
											<SidebarMenuButton
												asChild
												className={cn(
													"cursor-pointer py-5.5 px-3 text-base text-[#4b5563] dark:text-white hover:bg-primary/10 active:bg-primary/10 dark:hover:bg-slate-700",
													isRTL ? "text-right" : "text-left",
													activeAreaState === area
														? "bg-primary hover:bg-primary text-white dark:hover:bg-primary dark:bg-primary hover:text-white"
														: "",
												)}
												onClick={() => {
													setActiveArea(area);
													setSidebarOpen(false);
												}}>
												<button
													className={cn(
														"w-full",
														isRTL ? "text-right" : "text-left",
													)}>
													{getAreaLabel(area)}
												</button>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroup>
						</div>
					</div>
				)}

				{/* Content Area */}
				<div className='flex-1 min-w-0'>
					{/* Mobile Menu Button */}
					{isMobile && (
						<div
							className={cn(
								"mb-4 flex items-center gap-2 ",
								isRTL && "flex-row-reverse",
							)}>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setSidebarOpen(!sidebarOpen)}
								className={cn(
									"md:hidden rtl:ml-auto gap-2",
									isRTL && "flex-row-reverse",
								)}>
								{isRTL && <span>{getAreaLabel(activeAreaState)}</span>}
								<Menu className='w-4 h-4' />
								{!isRTL && <span>{getAreaLabel(activeAreaState)}</span>}
							</Button>
						</div>
					)}

					<div className=' rounded-lg border card '>
						<SettingForm areaSettings={settingsByArea[activeAreaState] || []} />
					</div>
				</div>
			</div>
		</>
	);
};

export default Setting;
