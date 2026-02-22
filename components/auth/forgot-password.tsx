"use client";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/contexts/LoadingContext";
import { forgotPasswordSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

import { useForm } from "react-hook-form";

import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRecoverAccount } from "@/hooks/queries/central/useAuth";

const ForgotPasswordComponent = () => {
	const t = useTranslations("auth.forgot-password");
	const { mutate: recoverAccount, isPending } = useRecoverAccount();

	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
		try {
			await recoverAccount(values?.email);
		} catch (error: any) {
			console.log("error", error);
		}
	};

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<div className='relative'>
										<Mail className='absolute start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-700 dark:text-neutral-200' />
										<Input
											{...field}
											type='email'
											placeholder={t("email-placeholder")}
											className='ps-13 pe-12 h-14 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary !shadow-none !ring-0'
											disabled={isPending}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type='submit'
						className='w-full rounded-lg h-13 text-sm mt-2'
						disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className='animate-spin h-4.5 w-4.5 mr-2' />
								{t("send-recovery-email-button-loading-text")}
							</>
						) : (
							t("send-recovery-email-button-text")
						)}
					</Button>
				</form>
			</Form>

			<div className='mt-8 text-center text-sm'>
				<p>
					{t("have-account-text")}{" "}
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

export default ForgotPasswordComponent;
