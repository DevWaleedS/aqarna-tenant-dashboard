"use client";

import {
	recoverAccountAPI,
	LogoutAPI,
	resetPasswordAPI,
	getCurrentUserAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { encryptData } from "@/lib/utils";

/* =======================
   Type Definitions
======================= */

type RecoverAccountResponse = {
	message: string;
};

type ResetPasswordResponse = {
	message: string;
};

type LogoutResponse = {
	message?: string;
};

type ApiError = AxiosError<{
	message: string;
}>;

/* =======================
   Current User
======================= */

export const useCurrentUser = () => {
	const { status } = useSession();

	const currentUserInfo = useQuery({
		queryKey: ["currentUser"],
		queryFn: getCurrentUserAPI,
		refetchOnWindowFocus: true,
		enabled: status === "authenticated",
	});

	return {
		userData: currentUserInfo.data?.data,
	};
};

/* =======================
   Recover Account Hook
======================= */
export const useRecoverAccount = () => {
	const router = useRouter();

	return useMutation<RecoverAccountResponse, ApiError, string>({
		mutationFn: (email: string) => recoverAccountAPI({ email }),
		onSuccess: (res, email) => {
			toast.success(res.message);
			localStorage.setItem("email", encryptData(email));
			router.push("/auth/create-new-password");
		},
		onError: (error) => {
			console.error("RecoverAccount error:", error);
			toast.error(
				error?.response?.data?.message || "Please enter a valid email",
			);
		},
	});
};

/* =======================
   Reset Password Hook
======================= */
export const useResetPassword = () => {
	const router = useRouter();

	return useMutation<
		ResetPasswordResponse,
		ApiError,
		{
			token?: string;
			email?: string;
			password: string;
			password_confirmation: string;
		}
	>({
		mutationFn: ({ token, email, password, password_confirmation }) =>
			resetPasswordAPI({ token, email, password, password_confirmation }),

		onSuccess: (res) => {
			toast.success(res.message || "Password has been reset successfully");
			router.push("/auth/login");
		},

		onError: (error) => {
			toast.error(
				error?.response?.data?.message ||
					"Failed to reset password. Please try again.",
			);
		},
	});
};

/* =======================
   Logout Hook
======================= */
export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation<LogoutResponse, ApiError, void>({
		mutationFn: LogoutAPI,

		onSuccess: async (res) => {
			queryClient.clear();

			if (res?.message) {
				toast.success(res.message);
			}

			await signOut({ callbackUrl: "/auth/login" });
		},

		onError: (error) => {
			toast.error(
				error?.response?.data?.message || "Logout failed. Please try again.",
			);
		},
	});
};
