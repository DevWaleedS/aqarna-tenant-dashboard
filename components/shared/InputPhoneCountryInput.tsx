"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
	parsePhoneNumber,
	getCountryCallingCode,
	CountryCode,
} from "libphonenumber-js";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PhoneInputProps extends Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	"value" | "onChange"
> {
	disabled?: boolean;
	value?: string;
	onPhoneChange?: (phone: string, dialCode: string, isValid: boolean) => void;
	defaultCountry?: CountryCode;
	error?: boolean;
}

// Arabic/Middle Eastern countries
const arabicCountries: CountryCode[] = [
	"EG",
	"SA",
	"AE",
	"JO",
	"LB",
	"IQ",
	"SY",
	"YE",
	"KW",
	"OM",
	"QA",
	"BH",
	"PS",
	"MA",
	"DZ",
	"TN",
	"LY",
	"SD",
	"SO",
	"DJ",
	"MR",
	"KM",
];

const countryNames: Record<string, string> = {
	EG: "Egypt",
	SA: "Saudi Arabia",
	AE: "United Arab Emirates",
	JO: "Jordan",
	LB: "Lebanon",
	IQ: "Iraq",
	SY: "Syria",
	YE: "Yemen",
	KW: "Kuwait",
	OM: "Oman",
	QA: "Qatar",
	BH: "Bahrain",
	PS: "Palestine",
	MA: "Morocco",
	DZ: "Algeria",
	TN: "Tunisia",
	LY: "Libya",
	SD: "Sudan",
	SO: "Somalia",
	DJ: "Djibouti",
	MR: "Mauritania",
	KM: "Comoros",
};

const countryFlags: Record<string, string> = {
	EG: "🇪🇬",
	SA: "🇸🇦",
	AE: "🇦🇪",
	JO: "🇯🇴",
	LB: "🇱🇧",
	IQ: "🇮🇶",
	SY: "🇸🇾",
	YE: "🇾🇪",
	KW: "🇰🇼",
	OM: "🇴🇲",
	QA: "🇶🇦",
	BH: "🇧🇭",
	PS: "🇵🇸",
	MA: "🇲🇦",
	DZ: "🇩🇿",
	TN: "🇹🇳",
	LY: "🇱🇾",
	SD: "🇸🇩",
	SO: "🇸🇴",
	DJ: "🇩🇯",
	MR: "🇲🇷",
	KM: "🇰🇲",
};

export default function InputPhoneCountryInput({
	disabled,
	value = "",
	onPhoneChange,
	defaultCountry = "EG",
	placeholder = "Enter phone number",
	className = "",
	error = false,
	...props
}: PhoneInputProps) {
	const t = useTranslations("input-phone-number");
	const countryNameTrans = useTranslations("input-phone-number.countries");

	const [country, setCountry] = useState<CountryCode>(defaultCountry);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [isValid, setIsValid] = useState<boolean | null>(null);
	const [touched, setTouched] = useState(false);

	const countries = useMemo(() => {
		return arabicCountries
			.map((code) => ({
				code,
				name: countryNames[code] || code,
				flag: countryFlags[code] || "🏳️",
				dialCode: `+${getCountryCallingCode(code)}`,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, []);

	const filteredCountries = useMemo(() => {
		if (!search) return countries;
		const s = search.toLowerCase();
		return countries.filter(
			(c) =>
				c.name.toLowerCase().includes(s) ||
				c.code.toLowerCase().includes(s) ||
				c.dialCode.includes(s),
		);
	}, [countries, search]);

	const selectedCountry =
		countries.find((c) => c.code === country) || countries[0];

	// Sync external value to internal state
	useEffect(() => {
		if (value) {
			// Extract just the number without country code
			const numericOnly = value.replace(/\D/g, "");
			setPhoneNumber(numericOnly);
		} else {
			setPhoneNumber("");
		}
	}, [value]);

	const handlePhoneChange = (val: string) => {
		setPhoneNumber(val);
		setTouched(true);

		let valid = false;
		if (val.length > 0) {
			const fullNumber = `+${getCountryCallingCode(country)}${val}`;
			try {
				const parsed = parsePhoneNumber(fullNumber, country);
				valid = parsed ? parsed.isValid() : false;
			} catch {
				valid = false;
			}
		}

		setIsValid(val.length > 0 ? valid : null);
		// Return phone number, dial code, and validity
		onPhoneChange?.(val, `+${getCountryCallingCode(country)}`, valid);
	};

	const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		handlePhoneChange(e.target.value.replace(/\D/g, ""));
	};

	const handleCountrySelect = (code: CountryCode) => {
		setCountry(code);
		setIsOpen(false);
		setSearch("");

		let valid = false;
		if (phoneNumber.length > 0) {
			const fullNumber = `+${getCountryCallingCode(code)}${phoneNumber}`;
			try {
				const parsed = parsePhoneNumber(fullNumber, code);
				valid = parsed ? parsed.isValid() : false;
			} catch {
				valid = false;
			}
			setIsValid(valid);
		}

		// Return phone number, dial code, and validity
		onPhoneChange?.(phoneNumber, `+${getCountryCallingCode(code)}`, valid);
	};

	const showError = error || (touched && isValid === false);

	return (
		<div className={cn("relative", className)}>
			<div className='flex w-full'>
				{/* Country selector */}
				<div className='shrink-0 px-1.5 flex items-center justify-center border border-neutral-300 dark:border-slate-500 border-e-0 rounded-s-lg rounded-e-none'>
					<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
						<Popover.Trigger asChild>
							<button
								disabled={disabled}
								type='button'
								aria-label='Select country'
								className='inline-flex items-center justify-between gap-1 bg-transparent border-0 outline-none h-full'>
								<div className='flex items-center gap-1'>
									<span className='text-lg'>{selectedCountry.flag}</span>
									<span className='text-sm dark:text-neutral-300'>
										{selectedCountry.dialCode}
									</span>
								</div>
								<ChevronDown className='w-5 h-5 text-gray-500' />
							</button>
						</Popover.Trigger>
						<Popover.Portal>
							<Popover.Content
								className='w-80 bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-500 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden'
								sideOffset={4}
								align='start'>
								<div className='p-3 border-b border-gray-200 dark:border-gray-700'>
									<input
										type='text'
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder={t("search-countries")}
										aria-label={t("search-countries")}
										className='w-full border border-neutral-300 px-5 h-12 rounded-lg focus:border-primary dark:focus:border-primary dark:bg-slate-800 dark:text-gray-100'
										autoFocus
									/>
								</div>
								<div className='overflow-y-auto max-h-80'>
									{filteredCountries.map((c) => (
										<button
											key={c.code}
											type='button'
											onClick={() => handleCountrySelect(c.code)}
											className={cn(
												"w-full flex items-center gap-3 px-4 py-3 text-left rtl:text-start transition-colors",
												c.code === country
													? "bg-blue-50 dark:bg-primary/25"
													: "hover:bg-gray-100 dark:hover:bg-gray-700",
											)}>
											<span className='text-xl'>{c.flag}</span>
											<span className='flex-1 text-sm text-gray-900 dark:text-gray-100'>
												{countryNameTrans(c.name)}
											</span>
											<span
												dir='ltr'
												className='text-sm text-[#4b5563]  dark:text-neutral-300'>
												{c.dialCode}
											</span>
											{c.code === country && (
												<Check className='w-4 h-4 text-primary' />
											)}
										</button>
									))}
									{filteredCountries.length === 0 && (
										<div className='px-3 py-8 text-center text-[#4b5563] dark:text-neutral-300 text-sm'>
											{t("no-countries-found")}
										</div>
									)}
								</div>
							</Popover.Content>
						</Popover.Portal>
					</Popover.Root>
				</div>

				{/* Phone input */}
				<input
					disabled={disabled}
					type='tel'
					value={phoneNumber}
					onChange={handleInputChange}
					onBlur={(e) => {
						setTouched(true);
						if (props.onBlur) props.onBlur(e);
					}}
					aria-invalid={showError}
					aria-describedby={showError ? "phone-error" : undefined}
					autoComplete='tel'
					placeholder={placeholder}
					{...props}
					className={cn(
						"w-full placeholder:text-muted-foreground text-base md:text-sm border px-4 py-2 h-12 border-neutral-300 dark:border-slate-500 dark:bg-slate-800 dark:text-gray-100 focus:border-primary dark:focus:border-primary focus-visible:border-primary rounded-e-lg rtl:rounded-e-none rtl:rounded-s-lg rounded-s-none shadow-none rtl:text-end transition-colors",
						showError ? "border-red-500 focus:ring-red-500" : "",
					)}
				/>
			</div>

			{touched && isValid === false && phoneNumber.length > 0 && (
				<p className='text-sm text-red-600'>
					{t("please-enter-a-valid")} {selectedCountry.name} {t("phone-number")}
				</p>
			)}
		</div>
	);
}

// Validation helper
export const validatePhoneNumber = (value: string, country?: CountryCode) => {
	if (!value) return true;
	try {
		const parsed = parsePhoneNumber(value, country);
		return parsed ? parsed.isValid() : "Invalid phone number format";
	} catch {
		return "Invalid phone number format";
	}
};
