"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

interface ChangePasswordContentProps {
	isEditing?: boolean;
	register: any;
	errors: any;
}

const ChangePasswordContent: React.FC<ChangePasswordContentProps> = ({
	isEditing = false,
	register,
	errors,
}) => {
	const t = useTranslations("central.users.add-new-user-page");
	const locale = useLocale();
	const isRTL = locale === "ar";
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<div>
			{/* New Password Field */}
			<div className='mb-5'>
				<Label
					htmlFor='password'
					className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
					{t("new-password-labe")}{" "}
					{!isEditing && <span className='text-red-600'>*</span>}
				</Label>
				<div className='relative'>
					<Input
						id='password'
						type={showNewPassword ? "text" : "password"}
						placeholder={t("new-password-input-placeholder")}
						{...register("password")}
						className='ps-5 pe-12 h-12 rounded-lg border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary shadow-none! ring-0!'
					/>
					<Button
						type='button'
						onClick={() => setShowNewPassword(!showNewPassword)}
						className={` absolute ${
							isRTL ? "left-4" : "right-4"
						} top-1/2 transform -translate-y-1/2 p-0! bg-transparent hover:bg-transparent text-muted-foreground h-[unset]`}>
						{showNewPassword ? (
							<EyeOff className='w-5 h-5' />
						) : (
							<Eye className='w-5 h-5' />
						)}
					</Button>
				</div>

				{errors.password && (
					<p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>
				)}
			</div>

			{/* Confirm Password Field */}
			<div className='mb-5'>
				<Label
					htmlFor='confirmed_password'
					className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
					{t("confirmed-password-label")}{" "}
					{!isEditing && <span className='text-red-600'>*</span>}
				</Label>
				<div className='relative'>
					<Input
						id='confirmed_password'
						type={showConfirmPassword ? "text" : "password"}
						placeholder={t("confirmed-password-input-placeholder")}
						{...register("confirmed_password")}
						className='ps-5 pe-12 h-12 rounded-lg border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary shadow-none! ring-0!'
					/>

					<Button
						type='button'
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						className={` absolute ${
							isRTL ? "left-4" : "right-4"
						} top-1/2 transform -translate-y-1/2 p-0! bg-transparent hover:bg-transparent text-muted-foreground h-[unset]`}>
						{showConfirmPassword ? (
							<EyeOff className='w-5 h-5' />
						) : (
							<Eye className='w-5 h-5' />
						)}
					</Button>
				</div>

				{errors.confirmed_password && (
					<p className='text-red-500 text-sm mt-1'>
						{errors.confirmed_password.message}
					</p>
				)}
			</div>
		</div>
	);
};

export default ChangePasswordContent;
