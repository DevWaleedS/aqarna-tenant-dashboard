"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useSetting } from "@/hooks/queries/useSetting";

// ─── Currency symbol map ──────────────────────────────────────────────────────
const CURRENCY_SYMBOLS: Record<string, string> = {
	SAR: "﷼", // Saudi Riyal
	USD: "$",
	EUR: "€",
	GBP: "£",
	AED: "د.إ",
	KWD: "د.ك",
	QAR: "ر.ق",
	BHD: "د.ب",
	OMR: "ر.ع",
	EGP: "ج.م",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type FontSize =
	| "text-xs"
	| "text-sm"
	| "text-base"
	| "text-lg"
	| "text-xl"
	| "text-2xl"
	| "text-3xl"
	| "text-4xl"
	| "text-5xl"
	| (string & {});

type FontWeight =
	| "font-thin"
	| "font-extralight"
	| "font-light"
	| "font-normal"
	| "font-medium"
	| "font-semibold"
	| "font-bold"
	| "font-extrabold"
	| "font-black"
	| (string & {});

interface PriceDisplayProps {
	/** Numeric price value */
	amount: number;
	/**
	 * ISO currency code — used only when the global settings
	 * endpoint has no currency value. e.g. "SAR" | "USD"
	 */
	currency?: string;
	/** Tailwind font-size class for the price amount */
	amountSize?: FontSize;
	/** Tailwind font-size class for the currency symbol/code */
	currencySize?: FontSize;
	/** Tailwind font-weight class applied to the whole component */
	fontWeight?: FontWeight;
	/** Extra Tailwind classes on the wrapper */
	className?: string;
	/** Number of decimal places (default: 2) */
	decimals?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(amount: number, decimals: number): string {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(amount);
}

function getCurrencySymbol(code: string): string {
	return CURRENCY_SYMBOLS[code.toUpperCase()] ?? code.toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────
const PriceDisplay = ({
	amount,
	currency,
	amountSize = "text-sm",
	currencySize = "text-sm",
	fontWeight = "font-semibold",
	className,
	decimals = 2,
}: PriceDisplayProps) => {
	const locale = useLocale(); // "ar" | "en"
	const isAr = locale === "ar";

	const { settingsByArea } = useSetting();

	// ── Currency resolution ───────────────────────────────────────────────────
	// Priority: 1) global settings endpoint  2) prop  3) render no symbol
	const currencyFromSettings = settingsByArea?.["currency"]?.[0]?.value as
		| string
		| undefined;

	const resolvedCurrency = currencyFromSettings || currency;

	const formattedAmount = formatAmount(amount, decimals);
	const symbol = resolvedCurrency ? getCurrencySymbol(resolvedCurrency) : null;

	// Arabic  → amount · symbol  (RTL natural order)
	// English → symbol · amount
	return (
		<span
			dir={isAr ? "rtl" : "ltr"}
			className={cn("inline-flex items-baseline gap-1", fontWeight, className)}>
			{isAr ? (
				<>
					<span className={cn(amountSize)}>{formattedAmount}</span>
					{symbol && (
						<span className={cn(currencySize, "opacity-75")}>{symbol}</span>
					)}
				</>
			) : (
				<>
					{symbol && (
						<span className={cn(currencySize, "opacity-75")}>{symbol}</span>
					)}
					<span className={cn(amountSize)}>{formattedAmount}</span>
				</>
			)}
		</span>
	);
};

export default PriceDisplay;
