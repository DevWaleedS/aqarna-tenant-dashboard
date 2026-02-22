import { useTranslations } from "next-intl";
import SalesStaticCard from "./components/sales-static-card";
import StatCard from "./components/stat-card";
import TabsWithTableCard from "./components/tabs-with-table-card";
import UserOverviewCard from "./components/user-overview-card";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Suspense } from "react";

export default function HomePage() {
	const t = useTranslations("central.home");
	const loadingText = useTranslations("loading-text");

	return (
		<>
			<DashboardBreadcrumb title={t("title")} text={t("subtitle")} />

			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6'>
				<Suspense
					fallback={
						<LoadingSkeleton height='h-64' text={loadingText("loading-text")} />
					}>
					<StatCard />
				</Suspense>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6'>
				<div className='col-span-12 xl:col-span-8'>
					<Suspense
						fallback={
							<LoadingSkeleton
								height='h-64'
								text={loadingText("loading-text")}
							/>
						}>
						<SalesStaticCard />
					</Suspense>
				</div>

				<div className='col-span-12 xl:col-span-4'>
					<Suspense
						fallback={
							<LoadingSkeleton
								height='h-64'
								text={loadingText("loading-text")}
							/>
						}>
						<UserOverviewCard />
					</Suspense>
				</div>

				<div className='col-span-12'>
					<Suspense
						fallback={
							<LoadingSkeleton
								height='h-64'
								text={loadingText("loading-text")}
							/>
						}>
						<TabsWithTableCard />
					</Suspense>
				</div>

				<div className='col-span-12'></div>
			</div>
		</>
	);
}
