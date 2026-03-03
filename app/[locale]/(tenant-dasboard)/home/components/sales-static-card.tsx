"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import CustomSelect from "@/components/shared/custom-select";
import SalesStaticChart from "@/components/charts/sales-static-chart";
import { useTranslations } from "next-intl";
import { useDashboard } from "@/hooks/queries/useDashboard";
import { useMemo } from "react";
import { useSetting } from "@/hooks/queries/useSetting";

const statusOptions = ["Weekly", "Monthly", "Yearly"];

const SalesStaticCard = () => {
	const transactions = useTranslations("central.home.transactions-statistic");
	const filterBy = useTranslations("filter-by");
	const { charts, isLoading } = useDashboard();

	const { settings, settingsByArea, isLoadingSettings } = useSetting();
	const currency = settingsByArea["currency"]?.[0]["value"];

	// Calculate total and growth from sales chart data
	const salesStats = useMemo(() => {
		if (!charts?.sales_chart) {
			return { total: 0, growth: 0, dailyAverage: 0, trend: "neutral" };
		}

		const total = charts.sales_chart.reduce(
			(sum: number, value: number) => sum + value,
			0,
		);
		const lastMonth = charts.sales_chart[charts.sales_chart.length - 1] || 0;
		const previousMonth =
			charts.sales_chart[charts.sales_chart.length - 2] || 0;

		const growth =
			previousMonth > 0
				? ((lastMonth - previousMonth) / previousMonth) * 100
				: 0;
		const dailyAverage = total / 30; // Approximate daily average

		return {
			total,
			growth,
			dailyAverage,
			trend: growth > 0 ? "up" : growth < 0 ? "down" : "neutral",
		};
	}, [charts]);

	if (isLoading || isLoadingSettings) {
		return (
			<Card className='card animate-pulse'>
				<CardContent className='px-0'>
					<div className='flex flex-wrap items-center justify-between mb-4'>
						<div className='h-6 bg-neutral-200 dark:bg-neutral-600 rounded w-48'></div>
						<div className='h-10 bg-neutral-200 dark:bg-neutral-600 rounded w-32'></div>
					</div>
					<div className='h-64 bg-neutral-200 dark:bg-neutral-600 rounded'></div>
				</CardContent>
			</Card>
		);
	}

	const GrowthIcon = salesStats.trend === "up" ? ArrowUp : ArrowDown;
	const growthColor =
		salesStats.trend === "up"
			? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-600/25 border-green-200 dark:border-green-600/50"
			: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-600/25 border-red-200 dark:border-red-600/50";

	return (
		<Card className='card'>
			<CardContent className='px-0'>
				<div className='flex flex-wrap items-center justify-between'>
					<h6 className='text-lg mb-0'>{transactions("title")}</h6>
					<CustomSelect
						placeholder={filterBy(statusOptions[0])}
						options={statusOptions}
					/>
				</div>

				<div className='flex flex-wrap items-center gap-2 mt-2'>
					<h6 className='mb-0'>
						{currency} {(salesStats.total / 100).toLocaleString()}
					</h6>
					<span
						className={`text-sm font-semibold rounded-full px-2 py-1.5 flex items-center gap-1 border ${growthColor}`}>
						{Math.abs(salesStats.growth).toFixed(1)}%{" "}
						<GrowthIcon width={14} height={14} />
					</span>
					<span className='text-xs font-medium'>
						+ {currency} {(salesStats.dailyAverage / 100).toLocaleString()}{" "}
						{filterBy("per day")}
					</span>
				</div>

				<div className='apexcharts-tooltip-style-1 mt-7'>
					<SalesStaticChart
						data={charts?.sales_chart || []}
						currency={currency}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default SalesStaticCard;
