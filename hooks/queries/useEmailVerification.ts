"use client";

import { resendVerificationEmailAPI, verifyEmailAPI } from "@/apis/endpoints";
import { getAuthUser, setAuthUser } from "@/lib/auth-token";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* =======================
   Verify Email Hook
======================= */
export const useVerifyEmail = () => {
	const router = useRouter();
	const locale = useLocale();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ email, code }: { email: string; code: string }) =>
			verifyEmailAPI({ email, code }),

		onSuccess: (res) => {
			toast.success(res?.message || "Email verified successfully!");

			// ── Update auth_user cookie so middleware stops redirecting ──────
			const existing = getAuthUser();
			if (existing) {
				setAuthUser({ ...existing, isEmailVerified: true });
			}

			// ── Invalidate currentUser so profile re-fetches ─────────────────
			queryClient.invalidateQueries({ queryKey: ["currentUser"] });

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
