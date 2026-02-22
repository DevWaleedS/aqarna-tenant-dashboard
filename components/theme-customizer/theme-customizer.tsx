"use client";

import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { Settings, X } from "lucide-react";

import { useState } from "react";
import { Button } from "../ui/button";
import ColorCustomization from "./theme-components/color-customization";
import LightDarkMode from "./theme-components/light-dark-mode";
import ThemeLayout from "./theme-components/theme-layout";
import { useTranslations } from "next-intl";

const ThemeCustomizer = () => {
	const [customizationOpen, setCustomizationOpen] = useState(false);
	const direction = useDirection();
	const t = useTranslations("app-setting");

	return (
		<>
			<Button
				className='fixed bottom-12 end-8  p-0! shadow-xl rounded-full w-12.5 h-12.5 bg-primary text-white flex items-center justify-center overflow-hidden z-[2]'
				onClick={() => setCustomizationOpen(true)}>
				<Settings className='w-7! h-7! animate-spin fill-curren' />
			</Button>

			{customizationOpen && (
				<div
					className='overlay fixed w-full h-full bg-black/50 dark:bg-black/50 z-10 duration-700 transition-all'
					onClick={() => setCustomizationOpen(false)}></div>
			)}

			<div
				className={`fixed max-w-105 w-full h-screen bg-white dark:bg-slate-800 top-0 z-[11] shadow-2xl duration-500 transition-transform flex flex-col
                    ${
											direction === "rtl"
												? customizationOpen
													? "end-0 translate-x-0" // RTL open → right side
													: "end-0 translate-x-full hidden" // RTL closed → hide right
												: customizationOpen
												? "end-0 translate-x-0" // LTR open → right side
												: "end-0 translate-x-full hidden" // LTR closed → hide right
										}
                `}>
				<div className='flex items-center gap-6 px-6 py-4 border-b border-neutral-200 dark:border-slate-700 justify-between'>
					<div className=''>
						<h6 className='text-sm dark:text-white'>{t("title")}</h6>
						<p className='text-xs text-neutral-500 dark:text-neutral-200'>
							{t("subtitle")}
						</p>
					</div>
					<div className=''>
						<Button
							className={cn(
								`py-0! px-0! h-[unset] text-neutral-900  bg-transparent shadow-none rounded-md hover:bg-transparent hover:text-primary hover:rotate-90 duration-300`
							)}
							onClick={() => setCustomizationOpen(false)}>
							<X className='w-5! h-5!' />
						</Button>
					</div>
				</div>

				<div className='flex flex-col gap-12 px-6 py-6 overflow-y-auto grow'>
					<LightDarkMode />

					<ColorCustomization />
					<ThemeLayout />
				</div>

				<div className='px-6 py-3 border-t border-neutral-200 dark:border-slate-700'></div>
			</div>
		</>
	);
};

export default ThemeCustomizer;
