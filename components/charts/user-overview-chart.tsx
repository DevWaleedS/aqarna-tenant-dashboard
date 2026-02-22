"use client";

import dynamic from "next/dynamic";
import React from "react";
import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface UserOverviewChartProps {
	data: number[];
}

const UserOverviewChart = ({ data }: UserOverviewChartProps) => {
	const t = useTranslations("central.home.users-overview");

	// Data is [active, new, total]
	const [activeUsers, newUsers, totalUsers] = data;

	const chartOptions: ApexOptions = {
		series: [activeUsers, newUsers, totalUsers],
		colors: ["#FF9F29", "#487FFF", "#E4F1FF"],
		labels: [t("active"), t("new"), t("total")],
		legend: {
			show: false,
		},
		chart: {
			type: "donut",
			height: 270,
			sparkline: {
				enabled: true,
			},
		},
		stroke: {
			width: 0,
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			enabled: true,
			y: {
				formatter: (value) => value.toLocaleString(),
			},
		},
		responsive: [
			{
				breakpoint: 480,
				options: {
					chart: {
						width: 200,
					},
					legend: {
						position: "bottom",
					},
				},
			},
		],
	};

	return (
		<Chart
			options={chartOptions}
			series={chartOptions.series}
			type='donut'
			height={270}
		/>
	);
};

export default UserOverviewChart;
