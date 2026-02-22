"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TogglePackagesPricesProps {
	togglePrice: string;
	setTogglePrice: (price: string) => void;
}

const TogglePackagesPrices = ({
	setTogglePrice,
	togglePrice,
}: TogglePackagesPricesProps) => {
	const t = useTranslations("central.packages");

	return (
		<div className='flex justify-center items-center gap-4 mb-6'>
			<Label
				htmlFor='price-toggle'
				className={
					togglePrice === "monthly_price" ? "text-primary font-medium" : ""
				}>
				{t("monthly_prices")}
			</Label>
			<Switch
				id='price-toggle'
				checked={togglePrice === "yearly_price"}
				onCheckedChange={(checked) =>
					setTogglePrice(checked ? "yearly_price" : "monthly_price")
				}
				className='data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#9ca3af]'
			/>
			<Label
				htmlFor='price-toggle'
				className={
					togglePrice === "yearly_price" ? "text-primary font-medium" : ""
				}>
				{t("yearly_prices")}
			</Label>
		</div>
	);
};

export { TogglePackagesPrices };
