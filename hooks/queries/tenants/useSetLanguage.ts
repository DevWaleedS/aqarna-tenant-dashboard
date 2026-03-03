"use client";

import { setLanguagesAPI } from "@/apis/endpoints";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

type setLanguagesResponse = {
	message: string;
};

type ApiError = AxiosError<{
	message: string;
}>;

export const useSetLanguages = () => {
	return useMutation<setLanguagesResponse, ApiError, string>({
		mutationFn: (locale: string) => setLanguagesAPI(locale),
		onSuccess: (res) => {
			toast.success(res.message);
		},
		onError: (error) => {
			console.error("set languages error:", error);
			toast.error(error?.response?.data?.message || "");
		},
	});
};
