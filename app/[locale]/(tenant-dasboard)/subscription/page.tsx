"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";

import React, { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Plus, Loader2 } from "lucide-react";
import PackagesCard from "./_components/packages-card";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

import AddNewPackage from "./_components/add-new-package";

import { TogglePackagesPrices } from "./_components/TogglePackagesPrices";

import { usePackages } from "@/hooks/queries/central/usePackages";
import DefaultCardComponent from "@/components/default-card-component";
import PagesDialog from "@/components/dailogs/pages-dialog";

const Subscription = () => {
	const t = useTranslations("central.packages");
	const { packages, isLoading, deletePackage, isDeleting } = usePackages();

	const [togglePrice, setTogglePrice] = React.useState("yearly_price");

	if (isLoading) {
		return (
			<>
				<DashboardBreadcrumb title={t("title")} text={t("title")} />
				<div className='flex justify-center items-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			</>
		);
	}

	return (
		<>
			<DashboardBreadcrumb title={t("title")} text={t("title")} />

			<div className=''>
				<DefaultCardComponent
					title={t("subtitle")}
					component={
						<PagesDialog
							button={
								<Button
									type='button'
									className={cn(
										"h-11.5 btn-blue-600 rounded-lg px-5 py-2.75 flex items-center gap-2",
									)}>
									<Plus className='text-xl' /> {t("add_new_package")}
								</Button>
							}
							pageTitle={t("add_new_package")}>
							<AddNewPackage />
						</PagesDialog>
					}>
					<Suspense
						fallback={<LoadingSkeleton height='h-64' text='Loading...' />}>
						<TogglePackagesPrices
							setTogglePrice={setTogglePrice}
							togglePrice={togglePrice}
						/>
						<div className='flex flex-col gap-6'>
							{packages.length === 0 ? (
								<div className='text-center py-12'>
									<p className='text-gray-500 dark:text-gray-400'>
										{t("no_packages")}
									</p>
								</div>
							) : (
								<div className='grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6'>
									{packages.map((pkg: any) => (
										<PackagesCard
											key={pkg.id}
											packageId={pkg.id}
											priceType={togglePrice}
											price={
												togglePrice === "monthly_price"
													? `$${(pkg.monthly_price / 100).toFixed(2)}`
													: `$${(pkg.yearly_price / 100).toFixed(2)}`
											}
											colorStyle='primary'
											title={pkg.name}
											description={pkg.description}
											features={pkg.features || []}
											maxProperties={pkg.max_properties}
											maxUnits={pkg.max_units}
											onDelete={deletePackage}
											isDeleting={isDeleting}
										/>
									))}
								</div>
							)}
						</div>
					</Suspense>
				</DefaultCardComponent>
			</div>
		</>
	);
};

export default Subscription;
