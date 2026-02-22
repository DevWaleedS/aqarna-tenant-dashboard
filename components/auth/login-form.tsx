"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/contexts/LoadingContext";
import { loginSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { useLocale, useTranslations } from "next-intl";
import { decryptData, encryptData } from "@/lib/utils";

const REMEMBERED_EMAIL_KEY = "remembered_email";

const LoginForm = () => {
	const t = useTranslations("auth.sign-in");
	const locale = useLocale();
	const isRTL = locale === "ar";

	const [showPassword, setShowPassword] = useState(false);
	const [isPending, startTransition] = useTransition();
	const { loading, setLoading } = useLoading();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			remember_me: false,
		},
	});

	// Load remembered email on mount
	useEffect(() => {
		try {
			const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);

			if (rememberedEmail) {
				form.setValue("email", decryptData(rememberedEmail));
				form.setValue("remember_me", true);
			}
		} catch (error) {
			console.error("Failed to load remembered email:", error);
		}
	}, [form]);

	const onSubmit = async (values: z.infer<typeof loginSchema>) => {
		setLoading(true);
		setIsSubmitting(true);

		try {
			const res = await signIn("credentials", {
				email: values.email,
				password: values.password,
				remember_me: values.remember_me,
				locale: locale,
				redirect: false,
			});

			if (res?.error) {
				toast.error(res.error);
				// Don't save email on failed login
				localStorage.removeItem(REMEMBERED_EMAIL_KEY);
			} else if (res?.ok) {
				// Handle remember me - save or remove email
				if (values.remember_me) {
					localStorage.setItem(REMEMBERED_EMAIL_KEY, encryptData(values.email));
				} else {
					localStorage.removeItem(REMEMBERED_EMAIL_KEY);
				}
				toast.success(t("logged-in-successfully"));
				// Small delay before redirect for better UX
				setTimeout(() => {
					window.location.href = `/${locale}/home`;
				}, 200);
			}
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Form {...form}>
				<form
					ref={formRef}
					onSubmit={form.handleSubmit(onSubmit)}
					className='space-y-5'>
					{/* Email Field */}
					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className='relative'>
										<Mail className='absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200' />
										<Input
											{...field}
											type='email'
											placeholder={t("email-placeholder")}
											name='email'
											className='ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary shadow-none! ring-0!'
											disabled={loading}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Password Field */}
					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className='relative'>
										<Lock className='absolute start-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200' />
										<Input
											{...field}
											type={showPassword ? "text" : "password"}
											placeholder={t("password-placeholder")}
											name='password'
											className='ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary shadow-none! ring-0!'
											disabled={loading}
										/>
										<Button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className={`absolute ${
												isRTL ? "left-4" : "right-4"
											} top-1/2 transform -translate-y-1/2 p-0! bg-transparent hover:bg-transparent text-muted-foreground h-[unset]`}>
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

					{/* Remember Me & Forgot Password */}
					<div className='mt-2 flex justify-between items-center'>
						<FormField
							control={form.control}
							name='remember_me'
							render={({ field }) => (
								<div className='flex items-center gap-2'>
									<Checkbox
										id='remember'
										checked={field.value}
										onCheckedChange={(checked) => {
											field.onChange(checked === true);

											// If unchecking, remove stored email immediately
											if (!checked) {
												localStorage.removeItem(REMEMBERED_EMAIL_KEY);
											}
										}}
										className='border border-neutral-500 w-4.5 h-4.5'
									/>
									<label htmlFor='remember' className='text-sm cursor-pointer'>
										{t("remember-me-label")}
									</label>
								</div>
							)}
						/>

						<Link
							href={`/${locale}/auth/forgot-password`}
							className='text-primary font-medium hover:underline text-sm'>
							{t("forgot-password-link")}
						</Link>
					</div>

					{/* Submit Button */}
					<Button
						type='submit'
						className='w-full rounded-lg h-13 text-sm mt-2'
						disabled={loading || isPending}>
						{isSubmitting || isPending ? (
							<>
								<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
								{t("sign-in-button-loading-text")}
							</>
						) : (
							t("sign-in-button")
						)}
					</Button>
				</form>
			</Form>
		</>
	);
};

export default LoginForm;
