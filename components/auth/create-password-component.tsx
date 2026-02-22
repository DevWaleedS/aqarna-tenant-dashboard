"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { createPasswordSchema, createPasswordType } from "@/lib/zod";

import { decryptData } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useResetPassword } from "@/hooks/queries/central/useAuth";

const CreatePasswordComponent = () => {
	const t = useTranslations("auth.create-new-password");
	const locale = useLocale();
	const isRTL = locale === "ar";

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const searchParams = useSearchParams();

	// Retrieve encrypted email from localStorage
	const [email, setEmail] = useState<string | null>(null);
	useEffect(() => {
		const encryptedEmail = localStorage.getItem("email");
		if (encryptedEmail) {
			try {
				const decrypted = decryptData(encryptedEmail);
				setEmail(decrypted);
			} catch (err) {
				console.error("Failed to decrypt email:", err);
				localStorage.removeItem("email");
			}
		}
	}, []);

	const { mutate: resetPasswordMutation, isPending } = useResetPassword();

	const form = useForm<createPasswordType>({
		resolver: zodResolver(createPasswordSchema),
		defaultValues: {
			password: "",
			password_confirmation: "",
		},
	});

	const onSubmit = (values: createPasswordType) => {
		if (!email) {
			toast.error("Email not found. Please request a password reset again.");
			return;
		}

		const token =
			searchParams.get("token") || "kkdkkklsd.m;lskn;flksdna;clkansdlk";
		if (!token) {
			toast.error("Reset token is missing.");
			return;
		}

		resetPasswordMutation({
			token,
			email,
			password: values.password,
			password_confirmation: values.password_confirmation,
		});
	};

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
					{/* Password */}
					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className='relative'>
										<Lock
											className={`absolute ${
												isRTL ? "right-4" : "left-4"
											} top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200`}
										/>
										<Input
											{...field}
											type={showPassword ? "text" : "password"}
											placeholder={t("new-password-placeholder")}
											className='ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary'
											disabled={isPending}
										/>
										<Button
											type='button'
											onClick={() => setShowPassword((prev) => !prev)}
											className={`absolute ${
												isRTL ? "left-4" : "right-4"
											} top-1/2 transform -translate-y-1/2 bg-transparent text-muted-foreground hover:bg-transparent p-0 h-[unset]`}>
											{showPassword ? (
												<EyeOff className='w-5 h-5' />
											) : (
												<Eye className='w-5 h-5' />
											)}
										</Button>
									</div>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Confirm Password */}
					<FormField
						control={form.control}
						name='password_confirmation'
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className='relative'>
										<Lock
											className={`absolute ${
												isRTL ? "right-4" : "left-4"
											} top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200`}
										/>
										<Input
											{...field}
											type={showConfirmPassword ? "text" : "password"}
											placeholder={t("confirm-password-placeholder")}
											className='ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary'
											disabled={isPending}
										/>
										<Button
											type='button'
											onClick={() => setShowConfirmPassword((prev) => !prev)}
											className={`absolute ${
												isRTL ? "left-4" : "right-4"
											} top-1/2 transform -translate-y-1/2 bg-transparent text-muted-foreground hover:bg-transparent p-0 h-[unset]`}>
											{showConfirmPassword ? (
												<EyeOff className='w-5 h-5' />
											) : (
												<Eye className='w-5 h-5' />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Submit Button */}
					<Button
						type='submit'
						className='w-full rounded-lg h-13 text-sm mt-2'
						disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className='animate-spin h-4 w-4 mr-2' />
								{t("reset-password-button-loading-text")}
							</>
						) : (
							t("reset-password-button-text")
						)}
					</Button>
				</form>
			</Form>

			<div className='mt-8 text-center text-sm'>
				<p>
					{t("not-now-return-text")}{" "}
					<Link
						href='/auth/login'
						className='text-primary font-semibold hover:underline'>
						{t("back-to-sign-in-link")}
					</Link>
				</p>
			</div>
		</>
	);
};

export default CreatePasswordComponent;
