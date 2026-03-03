"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowDown,
	ArrowUp,
	Medal,
	Newspaper,
	UsersRound,
	Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { useDashboard } from "@/hooks/queries/useDashboard";
import { useSetting } from "@/hooks/queries/useSetting";

interface CardConfig {
	key: "users" | "packages" | "tenants" | "subscriptions" | "transactions";
	title: string;
	icon: React.ElementType;
	iconBg: string;
	gradientFrom: string;
	description: string;
	isAmount?: boolean;
}

const cardsConfig: CardConfig[] = [
	{
		key: "users",
		title: "total-users",
		icon: UsersRound,
		iconBg: "bg-cyan-600",
		gradientFrom: "from-cyan-600/10",
		description: "users-last-30-days",
	},
	{
		key: "packages",
		title: "total-packages",
		icon: Medal,
		iconBg: "bg-purple-600",
		gradientFrom: "from-purple-600/10",
		description: "packages-last-30-days",
	},
	{
		key: "tenants",
		title: "total-tenants",
		icon: UsersRound,
		iconBg: "bg-primary",
		gradientFrom: "from-primary/10",
		description: "tenants-last-30-days",
	},
	{
		key: "subscriptions",
		title: "total-subscription",
		icon: Wallet,
		iconBg: "bg-green-600",
		gradientFrom: "from-green-600/10",
		description: "subscription-last-30-days",
		isAmount: true,
	},
	{
		key: "transactions",
		title: "total-transactions",
		icon: Newspaper,
		iconBg: "bg-red-600",
		gradientFrom: "from-red-600/10",
		description: "transactions-last-30-days",
		isAmount: true,
	},
];

const StatCard = () => {
	const statTranslations = useTranslations("central.home.stat-card");
	const { cards, isLoading } = useDashboard();
	const { settings, settingsByArea, isLoadingSettings } = useSetting();
	const currency = settingsByArea["currency"]?.[0]["value"];

	const formatValue = (value: number, isAmount?: boolean) => {
		if (isAmount) {
			return `${currency} ${(value / 100).toLocaleString()}`;
		}
		return value.toLocaleString();
	};

	const formatGrowth = (growth: number, isAmount?: boolean) => {
		const sign = growth >= 0 ? "+" : "";
		if (isAmount) {
			return `${sign}${currency} ${Math.abs(growth / 100)

				.toLocaleString()}`;
		}
		return `${sign}${growth.toLocaleString()}`;
	};

	const getTrendIcon = (trend: string) => {
		if (trend === "up") return ArrowUp;
		if (trend === "down") return ArrowDown;
		return ArrowUp; // neutral
	};

	const getTrendColor = (trend: string) => {
		if (trend === "up") return "text-green-600 dark:text-green-400";
		if (trend === "down") return "text-red-600 dark:text-red-400";
		return "text-neutral-600 dark:text-neutral-400";
	};

	// Loading state - show skeleton
	if (isLoading || isLoadingSettings) {
		return (
			<>
				{cardsConfig.map((_, index) => (
					<Card
						key={index}
						className='bg-linear-to-r from-neutral-100 to-white dark:to-slate-700 p-0 border border-gray-200 dark:border-neutral-700 rounded-md shadow-none animate-pulse'>
						<CardContent className='p-4'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<div className='h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-24 mb-2'></div>
									<div className='h-8 bg-neutral-200 dark:bg-neutral-600 rounded w-32'></div>
								</div>
								<div className='w-12 h-12 bg-neutral-200 dark:bg-neutral-600 rounded-full'></div>
							</div>
							<div className='mt-4'>
								<div className='h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-40'></div>
							</div>
						</CardContent>
					</Card>
				))}
			</>
		);
	}

	// Render cards - with data or with zeros
	return (
		<>
			{cardsConfig.map((config, index) => {
				// Get card data or use default values
				const cardData = cards?.[config.key] || {
					total: 0,
					growth: 0,
					trend: "neutral",
				};

				const GrowthIcon = getTrendIcon(cardData.trend);
				const growthColor = getTrendColor(cardData.trend);

				return (
					<Card
						key={index}
						className={`bg-linear-to-r ${config.gradientFrom} to-white dark:to-slate-700 p-0 border border-gray-200 dark:border-neutral-700 rounded-md shadow-none`}>
						<CardContent className='p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-neutral-600 dark:text-neutral-300'>
										{statTranslations(config.title)}
									</p>
									<h3 className='text-2xl font-bold text-neutral-900 dark:text-neutral-300 mt-1'>
										{formatValue(cardData.total, config.isAmount)}
									</h3>
								</div>
								<div
									className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center`}>
									<config.icon className='text-white' size={24} />
								</div>
							</div>

							<div className='flex items-center gap-2 text-sm mt-4'>
								<span className={`flex items-center gap-1 ${growthColor}`}>
									<GrowthIcon
										fill='currentColor'
										stroke='none'
										width={14}
										height={14}
									/>
									{formatGrowth(cardData.growth, config.isAmount)}
								</span>
								<span className='text-neutral-500 dark:text-neutral-400 text-[13px]'>
									{statTranslations(config.description)}
								</span>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</>
	);
};

export default StatCard;
