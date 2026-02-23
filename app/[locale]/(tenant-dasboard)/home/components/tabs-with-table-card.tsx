"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/queries/central/useTransactions";
import { useTranslations } from "next-intl";

import TransactionHistoryTable from "../../transactions/_components/transaction-history-table";

const TabsWithTableCard = () => {
	const t = useTranslations("central.home.tabs-with-table-card");
	const { transactions, isLoading, confirmTransaction, isConfirming } =
		useTransactions();

	return (
		<Card className='card'>
			<CardContent className='px-0'>
				<Tabs defaultValue='latestTenants' className='gap-4'>
					<TabsList className='active-gradient bg-transparent dark:bg-transparent rounded-none h-12.5'>
						<TabsTrigger
							value='latestTenants'
							className='py-2.5 px-4 font-semibold text-lg inline-flex items-center gap-3 dark:bg-transparent text-neutral-600 hover:text-primary dark:text-neutral-300 dark:hover:text-blue-500 data-[state=active]:bg-gradient border-0 border-t-2 border-neutral-200 dark:border-neutral-500 data-[state=active]:border-primary dark:data-[state=active]:border-primary rounded-[0] data-[state=active]:shadow-none cursor-pointer'>
							{t("latest-tenants.title")}
							<span className='text-white px-2 py-0.5 bg-neutral-600 rounded-full text-sm'>
								55
							</span>
						</TabsTrigger>
						<TabsTrigger
							value='latestTransactions'
							className='py-2.5 px-4 font-semibold text-lg inline-flex items-center gap-3 dark:bg-transparent text-neutral-600 hover:text-primary dark:text-neutral-300 dark:hover:text-blue-500 data-[state=active]:bg-gradient border-0 border-t-2 border-neutral-200 dark:border-neutral-500 data-[state=active]:border-primary dark:data-[state=active]:border-primary rounded-[0] data-[state=active]:shadow-none cursor-pointer'>
							{t("latest-transactions.title")}
							<span className='text-white px-2 py-0.5 bg-neutral-600 rounded-full text-sm'>
								{transactions?.slice(0, 5).length || 0}
							</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value='latestTenants'>
						{/* <TenantsTable /> */}
						some data well added here
					</TabsContent>
					<TabsContent value='latestTransactions'>
						<TransactionHistoryTable
							transactions={transactions.slice(0, 5)}
							isLoading={isLoading}
							onConfirm={confirmTransaction}
							isConfirming={isConfirming}
						/>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

export default TabsWithTableCard;
