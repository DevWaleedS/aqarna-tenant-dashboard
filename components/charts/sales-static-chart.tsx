"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SalesStaticChartProps {
	data: number[];
	currency: string;
}

const SalesStaticChart = ({ data, currency }: SalesStaticChartProps) => {
	const chartOptions: ApexOptions = {
		chart: {
			type: "line",
			toolbar: { show: false },
			zoom: { enabled: false },
			dropShadow: {
				enabled: true,
				top: 6,
				left: 0,
				blur: 4,
				color: "#000",
				opacity: 0.1,
			},
		},
		dataLabels: { enabled: false },
		stroke: {
			curve: "smooth",
			colors: ["#487FFF"],
			width: 3,
		},
		markers: {
			size: 0,
			strokeWidth: 3,
			hover: { size: 8 },
		},
		tooltip: {
			enabled: true,
			x: { show: true },
			y: {
				formatter: (value) => `${currency} ${(value / 100).toLocaleString()}`,
			},
		},
		grid: {
			row: { colors: ["transparent", "transparent"], opacity: 0.5 },
			borderColor: "#D1D5DB",
			strokeDashArray: 3,
		},
		yaxis: {
			labels: {
				style: { fontSize: "14px" },
				formatter: (value) => `${currency} ${(value / 100).toLocaleString()}`,
			},
		},
		xaxis: {
			categories: [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			],
			tooltip: { enabled: false },
			labels: { style: { fontSize: "14px" } },
			axisBorder: { show: false },
			crosshairs: {
				show: true,
				width: 20,
				stroke: { width: 0 },
				fill: { type: "solid", color: "#487FFF40" },
			},
		},
	};

	const chartSeries: ApexAxisChartSeries = [
		{
			name: "Transactions",
			data: data,
		},
	];

	return (
		<div className='-m-4'>
			<Chart
				options={chartOptions}
				series={chartSeries}
				type='line'
				height={254}
			/>
		</div>
	);
};

export default SalesStaticChart;
