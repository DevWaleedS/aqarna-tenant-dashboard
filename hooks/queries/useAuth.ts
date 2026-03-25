"use client";

import {
	recoverAccountAPI,
	logoutAPI,
	resetPasswordAPI,
	getCurrentUserAPI,
	loginAPI,
} from "@/apis/endpoints";
import {
	clearAuth,
	getAuthToken,
	setAuthToken,
	setAuthUser,
	StoredUser,
} from "@/lib/auth-token";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { encryptData } from "@/lib/utils";

/* =======================
   Type Definitions
======================= */

type RecoverAccountResponse = { message: string };
type ResetPasswordResponse = { message: string };
type LogoutResponse = { message?: string };
type ApiError = AxiosError<{ message: string }>;

export interface AuthUser {
	id: number | string;
	name: string;
	email: string;
	avatar?: string;
	roles?: string[];
	permissions?: string[];
	verification_required?: boolean;
}

/* =======================
   Current User
======================= */

export const useCurrentUser = () => {
	const currentUserInfo = useQuery({
		queryKey: ["currentUser"],
		queryFn: getCurrentUserAPI,
		refetchOnWindowFocus: true,
		enabled: !!getAuthToken(), // replaces useSession check
		staleTime: 5 * 60 * 1000,
		retry: false,
	});

	return {
		userData: currentUserInfo.data?.data as AuthUser | undefined,
	};
};

/* =======================
   Login Hook
======================= */

interface LoginPayload {
	email: string;
	password: string;
	remember_me: boolean;
	locale?: string;
}

export const useLogin = () => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const locale = useLocale();

	return useMutation({
		mutationFn: async (payload: LoginPayload) => {
			// Step 1: login → token
			const loginRes = await loginAPI({
				email: payload.email,
				password: payload.password,
				remember_me: payload.remember_me,
			});

			if (!loginRes?.token) {
				throw new Error(
					loginRes?.message || "Login failed — no token returned",
				);
			}

			// Step 2: persist token so AxiosAuth interceptor picks it up
			setAuthToken(loginRes.token, payload.remember_me);

			// Step 3: fetch full user profile
			const userRes = await getCurrentUserAPI();
			const user = userRes?.data as AuthUser | undefined;

			if (!user?.id) {
				throw new Error("Failed to fetch user profile");
			}

			// Step 4: persist minimal user for middleware
			const storedUser: StoredUser = {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar,
				isEmailVerified: !user.verification_required,
			};
			setAuthUser(storedUser, payload.remember_me);

			// Step 5: prime React Query cache
			queryClient.setQueryData(["currentUser"], userRes);

			return { user, token: loginRes.token };
		},

		onSuccess: ({ user }) => {
			if (user.verification_required) {
				router.push(
					`/${locale}/auth/verify-email?email=${encodeURIComponent(user.email)}`,
				);
				return;
			}
			toast.success("Logged in successfully");
			setTimeout(() => {
				window.location.href = `/${locale}/home`;
			}, 200);
		},

		onError: (error: any) => {
			clearAuth();
			queryClient.removeQueries({ queryKey: ["currentUser"] });
			toast.error(
				error?.response?.data?.message ||
					error?.message ||
					"Invalid email or password",
			);
		},
	});
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
		mutationFn: logoutAPI, // replaces LogoutAPI + signOut

		onSuccess: async (res) => {
			clearAuth(); // remove auth_token + auth_user cookies
			queryClient.clear();

			if (res?.message) {
				toast.success(res.message);
			}

			// Hard redirect so all in-memory state is cleared
			window.location.href = "/auth/login";
		},

		onError: (error) => {
			// Logout locally even if server call fails
			clearAuth();
			queryClient.clear();
			window.location.href = "/auth/login";

			toast.error(
				error?.response?.data?.message || "Logout failed. Please try again.",
			);
		},
	});
};
