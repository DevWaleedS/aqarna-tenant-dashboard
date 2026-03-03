"use client";

import { resendVerificationEmailAPI, verifyEmailAPI } from "@/apis/endpoints";
import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* =======================
   Verify Email Hook
======================= */
export const useVerifyEmail = () => {
	const router = useRouter();
	const locale = useLocale();

	return useMutation({
		mutationFn: ({ email, code }: { email: string; code: string }) =>
			verifyEmailAPI({ email, code }),

		onSuccess: (res) => {
			toast.success(res?.message || "Email verified successfully!");
			// Small delay before redirect for UX
			setTimeout(() => {
				router.push(`/${locale}/home`);
			}, 300);
		},

		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message ||
					"Invalid or expired verification code",
			);
		},
	});
};

/* =======================
   Resend Verification Hook
======================= */
export const useResendVerification = () => {
	return useMutation({
		mutationFn: (email: string) => resendVerificationEmailAPI({ email }),

		onSuccess: (res) => {
			toast.success(res?.message || "A new code has been sent to your email");
		},

		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to resend verification code",
			);
		},
	});
};
