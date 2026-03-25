"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { verifyEmailSchema, verifyEmailType } from "@/lib/zod";
import {
	useResendVerification,
	useVerifyEmail,
} from "@/hooks/queries/useEmailVerification";
import OtpInput from "./Otp-input";

const RESEND_COOLDOWN = 60; // seconds

interface VerifyEmailFormProps {
	email: string;
}

const VerifyEmailForm = ({ email }: VerifyEmailFormProps) => {
	const t = useTranslations("auth.verify-email");
	const locale = useLocale();

	const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
	const [canResend, setCanResend] = useState(false);

	const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();
	const { mutate: resendCode, isPending: isResending } =
		useResendVerification();

	// Countdown timer
	useEffect(() => {
		if (countdown <= 0) {
			setCanResend(true);
			return;
		}
		const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
		return () => clearTimeout(id);
	}, [countdown]);

	const form = useForm<verifyEmailType>({
		resolver: zodResolver(verifyEmailSchema),
		defaultValues: { code: "" },
	});

	const code = form.watch("code");
	const hasError = !!form.formState.errors.code;

	// Auto-submit when all 6 digits are filled
	useEffect(() => {
		if (code.length === 6 && !hasError) {
			form.handleSubmit(onSubmit)();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code]);

	const onSubmit = (data: verifyEmailType) => {
		verifyEmail({ email, code: data.code });
	};

	console.log("email", email);

	const handleResend = () => {
		if (!canResend || isResending) return;
		resendCode(email, {
			onSuccess: () => {
				setCountdown(RESEND_COOLDOWN);
				setCanResend(false);
				form.reset();
			},
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
				{/* Email display chip */}
				<div className='flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 w-fit mx-auto'>
					<Mail className='w-4 h-4 text-primary shrink-0' />
					<span className='text-sm font-semibold text-neutral-700 dark:text-neutral-200 truncate max-w-56'>
						{email}
					</span>
				</div>

				{/* OTP boxes */}
				<FormField
					control={form.control}
					name='code'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Controller
									name='code'
									control={form.control}
									render={({ field: f }) => (
										<OtpInput
											value={f.value}
											onChange={f.onChange}
											disabled={isVerifying}
											hasError={hasError}
										/>
									)}
								/>
							</FormControl>
							<div className='flex justify-center mt-1'>
								<FormMessage />
							</div>
						</FormItem>
					)}
				/>

				{/* Verify button */}
				<Button
					type='submit'
					disabled={isVerifying || code.length < 6}
					className='w-full rounded-lg h-13 text-sm'>
					{isVerifying ? (
						<>
							<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
							{t("verify-button-loading")}
						</>
					) : (
						<>
							<ShieldCheck className='w-4.5 h-4.5 mr-2' />
							{t("verify-button")}
						</>
					)}
				</Button>

				{/* Resend row */}
				<div className='flex items-center justify-center gap-1.5 text-sm'>
					<span className='text-neutral-500 dark:text-neutral-400'>
						{t("resend-prompt")}
					</span>
					{canResend ? (
						<button
							type='button'
							onClick={handleResend}
							disabled={isResending}
							className='inline-flex items-center gap-1 text-primary font-semibold hover:underline disabled:opacity-60'>
							{isResending ? (
								<>
									<Loader2 className='w-3.5 h-3.5 animate-spin' />
									{t("resend-button-loading")}
								</>
							) : (
								<>
									<RefreshCw className='w-3.5 h-3.5' />
									{t("resend-button")}
								</>
							)}
						</button>
					) : (
						<span className='font-semibold text-neutral-400 dark:text-neutral-500 tabular-nums'>
							{t("resend-countdown", { seconds: countdown })}
						</span>
					)}
				</div>

				{/* Back to login */}
				<div className='flex justify-center'>
					<Link
						href={`/${locale}/auth/login`}
						className='inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors'>
						<ArrowLeft className='w-3.5 h-3.5' />
						{t("back-to-login")}
					</Link>
				</div>
			</form>
		</Form>
	);
};

export default VerifyEmailForm;
