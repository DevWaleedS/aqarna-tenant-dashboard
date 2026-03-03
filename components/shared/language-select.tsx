import * as React from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import LanguageImg1 from "@/public/assets/images/flags/flag1.png";
import LanguageImg3 from "@/public/assets/images/flags/flag3.png";
import { cn } from "@/lib/utils";
import { useSetLanguages } from "@/hooks/queries/useSetLanguage";

const LanguageSelect = () => {
	const t = useTranslations("language");
	const router = useRouter();
	const pathname = usePathname();
	const currentLocale = useLocale();

	// Use the mutation hook
	const { mutate: setLanguage, isPending } = useSetLanguages();

	const handleLanguageChange = (locale: string) => {
		// Determine direction based on locale
		const dir = locale === "ar" ? "rtl" : "ltr";

		// Update document direction and language
		document.documentElement.setAttribute("dir", dir);
		document.documentElement.setAttribute("lang", locale);

		// Call the API to save language preference to backend
		setLanguage(locale, {
			onSuccess: () => {
				// Extract the path without the locale prefix
				const segments = pathname.split("/");
				const pathWithoutLocale = segments.slice(2).join("/");

				// Navigate to the new locale path
				router.push(`/${locale}/${pathWithoutLocale}`);
				router.refresh();
			},
		});
	};

	// Sync with server-rendered direction on mount
	React.useEffect(() => {
		const dir = currentLocale === "ar" ? "rtl" : "ltr";

		// Only update if it's different from what's already set
		// This prevents overriding the server-rendered value
		if (document.documentElement.getAttribute("dir") !== dir) {
			document.documentElement.setAttribute("dir", dir);
		}

		if (document.documentElement.getAttribute("lang") !== currentLocale) {
			document.documentElement.setAttribute("lang", currentLocale);
		}
	}, [currentLocale]);

	return (
		<Select
			value={currentLocale}
			onValueChange={handleLanguageChange}
			disabled={isPending}>
			<SelectTrigger
				className={cn(
					"focus-visible:ring-0 border-0 bg-gray-200/75 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 !h-10 dark:text-white cursor-pointer data-[state=open]:bg-gray-300 dark:data-[state=open]:bg-slate-600 sm:max-w-[unset] max-w-[80px] px-3 data-[placeholder]:text-neutral-800",
					isPending && "opacity-50 cursor-not-allowed",
				)}>
				<SelectValue placeholder={t("select-label")} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectItem
						value='en'
						disabled={currentLocale === "en"}
						className='cursor-pointer'>
						<div className='flex items-center gap-2'>
							<Image
								src={LanguageImg1}
								className='rounded-[50%] sm:flex hidden'
								width={20}
								height={20}
								alt='English Flag'
							/>
							<span>{t("english")}</span>
						</div>
					</SelectItem>

					<SelectItem
						value='ar'
						disabled={currentLocale === "ar"}
						className='cursor-pointer'>
						<div className='flex items-center gap-2'>
							<Image
								src={LanguageImg3}
								className='rounded-[50%] sm:flex hidden'
								width={20}
								height={20}
								alt='Arabic Flag'
							/>
							<span>{t("arabic")}</span>
						</div>
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

export default LanguageSelect;
