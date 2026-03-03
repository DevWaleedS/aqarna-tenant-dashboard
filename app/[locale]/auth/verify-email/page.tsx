"use client";

import VerifyEmailForm from "@/components/auth/verify-email-form";
import ThemeLogo from "@/components/shared/theme-logo";
import AuthImage from "@/public/assets/images/auth/forgot-pass-img.png";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

const VerifyEmail = () => {
	const t = useTranslations("auth.verify-email");
	const searchParams = useSearchParams();

	// Email is passed as a query param from middleware: /auth/verify-email?email=...
	const email = searchParams.get("email") ?? "";

	return (
		<section className='bg-white dark:bg-slate-900 flex flex-wrap min-h-screen'>
			{/* Left Image — identical to login */}
			<div className='lg:w-1/2 hidden lg:block'>
				<div className='flex items-center justify-center h-screen flex-col'>
					<Image
						src={AuthImage}
						alt='Auth Illustration'
						className='object-cover w-full h-full'
					/>
				</div>
			</div>

			{/* Right Form */}
			<div className='lg:w-1/2 w-full py-8 px-6 flex flex-col justify-center'>
				<div className='lg:max-w-116 w-full mx-auto'>
					{/* Logo */}
					<div className='mb-2.5 inline-block max-w-72.5'>
						<ThemeLogo />
					</div>

					{/* Icon + Heading */}
					<div className='mb-8'>
						<div className='w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5'>
							<ShieldCheck className='w-7 h-7 text-primary' />
						</div>

						<h4 className='font-semibold mb-2'>{t("title")}</h4>
						<p className='text-neutral-500 dark:text-neutral-300 text-lg'>
							{email ? `${t("subtitle")} ${email}` : t("subtitle-fallback")}
						</p>
					</div>

					{/* Form */}
					<VerifyEmailForm email={email} />
				</div>
			</div>
		</section>
	);
};

export default VerifyEmail;
