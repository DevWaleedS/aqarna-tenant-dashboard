"use client";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useSetting, Setting } from "@/hooks/queries/useSetting";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";

interface SettingFormProps {
	areaSettings: Setting[];
}

const SettingForm = ({ areaSettings }: SettingFormProps) => {
	const t = useTranslations("central.setting");
	const locale = useLocale();
	const isRTL = locale === "ar";

	const { updateSetting, isUpdating } = useSetting();
	const [formValues, setFormValues] = useState<Record<string, any>>(() => {
		const initial: Record<string, any> = {};
		areaSettings.forEach((setting) => {
			initial[setting.key] = setting.value;
		});
		return initial;
	});

	const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());

	const handleValueChange = (key: string, value: any) => {
		setFormValues((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSaveField = useCallback(
		async (setting: Setting) => {
			const value = formValues[setting.key];

			// Validate that value has changed
			if (value === setting.value) {
				toast.success(t("no-changes"));
				return;
			}

			setSavingKeys((prev) => new Set(prev).add(setting.key));

			try {
				await updateSetting({ key: setting.key, value });
			} catch (error) {
				console.error("Error saving setting:", error);
			} finally {
				setSavingKeys((prev) => {
					const updated = new Set(prev);
					updated.delete(setting.key);
					return updated;
				});
			}
		},
		[formValues, updateSetting, t],
	);

	const renderInput = (setting: Setting) => {
		const isSaving = savingKeys.has(setting.key);
		const currentValue = formValues[setting.key];

		const commonClassNames =
			"h-12 px-4 dark:bg-neutral-800 dark:text-white border-neutral-200 dark:border-neutral-700";

		switch (setting.data_type) {
			case "string":
				return (
					<div
						key={setting.key}
						className={`col-span-12 md:col-span-6 ${isRTL ? "text-right" : ""}`}>
						<Label
							htmlFor={setting.key}
							className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{setting.name}
							<span className='text-neutral-400 text-xs ml-1 rtl:ml-0 rtl:mr-1'>
								({setting.description})
							</span>
						</Label>
						<Input
							id={setting.key}
							type='text'
							className={`${commonClassNames} ${isRTL ? "text-right" : ""}`}
							value={currentValue || ""}
							onChange={(e) => handleValueChange(setting.key, e.target.value)}
							disabled={isSaving}
							dir={isRTL ? "rtl" : "ltr"}
						/>
						<Button
							type='button'
							onClick={() => handleSaveField(setting)}
							disabled={isSaving || currentValue === setting.value}
							className='h-10 text-base px-8  py-1.5 rounded-md mt-2'>
							{isSaving ? (
								<>
									<Loader2 className='h-3.5 w-3.5 animate-spin mr-1' />
									{t("saving")}
								</>
							) : (
								t("save")
							)}
						</Button>
					</div>
				);

			case "integer":
				return (
					<div
						key={setting.key}
						className={`col-span-12 md:col-span-6 ${isRTL ? "text-right" : ""}`}>
						<Label
							htmlFor={setting.key}
							className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{setting.name}
							<span className='text-neutral-400 text-xs ml-1 rtl:ml-0 rtl:mr-1'>
								({setting.description})
							</span>
						</Label>
						<Input
							id={setting.key}
							type='number'
							className={`${commonClassNames} ${isRTL ? "text-right" : ""}`}
							value={currentValue || 0}
							onChange={(e) =>
								handleValueChange(setting.key, parseInt(e.target.value, 10))
							}
							disabled={isSaving}
							dir={isRTL ? "rtl" : "ltr"}
						/>
						<Button
							type='button'
							onClick={() => handleSaveField(setting)}
							disabled={isSaving || currentValue === setting.value}
							className='h-10 text-base px-8  py-1.5 rounded-md mt-2'>
							{isSaving ? (
								<>
									<Loader2 className='h-3.5 w-3.5 animate-spin mr-1' />
									{t("saving")}
								</>
							) : (
								t("save")
							)}
						</Button>
					</div>
				);

			case "boolean":
				return (
					<div
						key={setting.key}
						className={`col-span-12 md:col-span-6 flex items-center gap-4 `}>
						<div>
							<Label
								htmlFor={setting.key}
								className='flex items-baseline font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2 '>
								<Checkbox
									checked={currentValue || false}
									onCheckedChange={(e) => handleValueChange(setting.key, e)}
									disabled={isSaving}
									className='border border-neutral-500 w-4.5 h-4.5 mt-1'
								/>
								{setting.name}

								<span className='text-neutral-400 text-xs ml- rtl:ml-0 rtl:mr-2'>
									({setting.description})
								</span>
							</Label>
							<Button
								type='button'
								onClick={() => handleSaveField(setting)}
								disabled={isSaving || currentValue === setting.value}
								className='h-10 text-base px-8  py-1.5 rounded-md mt-2'>
								{isSaving ? (
									<>
										<Loader2 className='h-3.5 w-3.5 animate-spin mr-1' />
										{t("saving")}
									</>
								) : (
									t("save")
								)}
							</Button>
						</div>
					</div>
				);

			case "array":
				return (
					<div
						key={setting.key}
						className={`col-span-12  ${isRTL ? "text-right" : ""}`}>
						<Label
							htmlFor={setting.key}
							className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{setting.name}
							<span className='text-neutral-400 text-xs ml-1 rtl:ml-0 rtl:mr-1'>
								({setting.description})
							</span>
						</Label>
						<Select
							value={currentValue || ""}
							onValueChange={(value) => handleValueChange(setting.key, value)}
							disabled={isSaving}>
							<SelectTrigger
								className={`w-1/2 h-12 px-4 dark:bg-neutral-800 dark:text-white ${isRTL ? "text-right ml-auto" : ""}`}>
								<SelectValue placeholder={t("select-placeholder")} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{setting.data_variable?.map((option: string) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<Button
							type='button'
							onClick={() => handleSaveField(setting)}
							disabled={isSaving || currentValue === setting.value}
							className='h-10 text-base px-8  py-1.5 rounded-md mt-2'>
							{isSaving ? (
								<>
									<Loader2 className='h-3.5 w-3.5 animate-spin mr-1' />
									{t("saving")}
								</>
							) : (
								t("save")
							)}
						</Button>
					</div>
				);

			case "file":
				return (
					<div
						key={setting.key}
						className={`col-span-12 md:col-span-6 ${isRTL ? "text-right" : ""}`}>
						<Label
							htmlFor={setting.key}
							className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{setting.name}
							<span className='text-neutral-400 text-xs ml-1 rtl:ml-0 rtl:mr-1'>
								({setting.description})
							</span>
						</Label>
						<Input
							id={setting.key}
							type='file'
							className={commonClassNames}
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									handleValueChange(setting.key, file);
								}
							}}
							disabled={isSaving}
						/>
						{currentValue instanceof File && (
							<p
								className={`text-xs text-neutral-500 mt-2 ${isRTL ? "text-right" : ""}`}>
								{currentValue.name}
							</p>
						)}
						<Button
							type='button'
							size='sm'
							onClick={() => handleSaveField(setting)}
							disabled={isSaving || currentValue === setting.value}
							className='h-10 text-base px-8  py-1.5 rounded-md mt-2'>
							{isSaving ? (
								<>
									<Loader2 className='h-3.5 w-3.5 animate-spin mr-1' />
									{t("saving")}
								</>
							) : (
								t("save")
							)}
						</Button>
					</div>
				);

			default:
				return null;
		}
	};

	if (areaSettings.length === 0) {
		return (
			<div className={`text-center py-8 ${isRTL ? "text-right" : ""}`}>
				<p className='text-neutral-600 dark:text-neutral-400'>
					{t("no-settings-available")}
				</p>
			</div>
		);
	}

	return (
		<div
			className={`bg-neutral-100 dark:bg-[#1e2734] rounded-md border  p-6 ${isRTL ? "text-right" : ""}`}>
			<div className={`grid grid-cols-12 gap-6 ${isRTL ? "rtl" : ""}`}>
				{areaSettings.map((setting) => renderInput(setting))}
			</div>
		</div>
	);
};

export default SettingForm;
