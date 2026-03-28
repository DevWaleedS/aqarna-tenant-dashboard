import { getPaymentAPI, submitPaymentAPI } from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

export interface SubmitPaymentData {
	payment_method: "cash" | "cheque" | "bank_transfer";
	cheque_number?: string;
	cheque_image?: File;
	transfer_reference?: string;
	transfer_receipt?: File;
}

export const usePayment = () => {
	const queryClient = useQueryClient();

	// Submit payment mutation
	const submitMutation = useMutation({
		mutationFn: ({ token, data }: { token: string; data: SubmitPaymentData }) =>
			submitPaymentAPI(token, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["tenant-applications"] });
			toast.success(res.message || "Payment submitted successfully!");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to submit payment");
		},
	});

	return {
		submitPayment: submitMutation.mutateAsync,
		isSubmitting: submitMutation.isPending,
		error: submitMutation.error,
	};
};

// Hook for get payment info
export const usePaymentInfo = (token: string) => {
	const {
		data: paymentInfo,
		isLoading,
		error,
	} = useQuery({
		queryKey: [token],
		queryFn: () => getPaymentAPI(token),
		enabled: !!token,
	});

	return {
		paymentInfo: paymentInfo?.data,
		isLoading,
		error,
	};
};
