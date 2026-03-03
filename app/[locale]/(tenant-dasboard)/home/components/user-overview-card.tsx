"use client";

import UserOverviewChart from "@/components/charts/user-overview-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useDashboard } from "@/hooks/queries/tenants/useDashboard";

const statusOptions = ["Weekly", "Monthly", "Yearly"];

const UserOverviewCard = () => {
	const usersOverview = useTranslations("central.home.users-overview");
	const filterBy = useTranslations("filter-by");
	const { charts, isLoading } = useDashboard();

	if (isLoading) {
		return (
			<Card className='card animate-pulse'>
				<CardContent className='card-body p-0'>
					<div className='flex items-center justify-between mb-4'>
						<div className='h-6 bg-neutral-200 dark:bg-neutral-600 rounded w-32'></div>
						<div className='h-10 bg-neutral-200 dark:bg-neutral-600 rounded w-24'></div>
					</div>
					<div className='h-64 bg-neutral-200 dark:bg-neutral-600 rounded'></div>
				</CardContent>
			</Card>
		);
	}

	// Extract user overview data [active, new, total]
	const userOverviewData = charts?.user_overview || [0, 0, 0];
	const [activeUsers, newUsers] = userOverviewData;

	return (
		<Card className='card'>
			<CardContent className='card-body p-0'>
				<div className='flex items-center justify-between'>
					<h6 className='mb-3 font-semibold text-lg'>
						{usersOverview("title")}
					</h6>
					<CustomSelect
						placeholder={filterBy(statusOptions[0])}
						options={statusOptions}
					/>
				</div>

				<div className='apexcharts-tooltip-z-none'>
					<UserOverviewChart data={userOverviewData} />
				</div>

				<ul className='flex flex-wrap items-center justify-between mt-4 gap-3'>
					<li className='flex items-center gap-2'>
						<span className='w-3 h-3 rounded-[2px] bg-yellow-500'></span>
						<span className='text-neutral-500 dark:text-neutral-300 text-sm font-normal'>
							{usersOverview("active")}:{" "}
							<span className='text-neutral-500 dark:text-neutral-300 font-semibold'>
								{activeUsers.toLocaleString()}
							</span>
						</span>
					</li>
					<li className='flex items-center gap-2'>
						<span className='w-3 h-3 rounded-[2px] bg-blue-500'></span>
						<span className='text-neutral-500 dark:text-neutral-300 text-sm font-normal'>
							{usersOverview("new")}:{" "}
							<span className='text-neutral-500 dark:text-neutral-300 font-semibold'>
								{newUsers.toLocaleString()}
							</span>
						</span>
					</li>
				</ul>
			</CardContent>
		</Card>
	);
};

export default UserOverviewCard;
