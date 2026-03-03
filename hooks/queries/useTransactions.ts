import {
	confirmTransactionAPI,
	getTransactionAPI,
	getTransactionsAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── Transaction types ─────────────────────────────────────────────────────────
export interface TransactionConfirmer {
	id: number;
	name: string;
	email: string;
}

export interface Transaction {
	id: number;
	payment_gateway: string;
	payment_method: string;
	payment_method_label: string;
	price: number;
	formatted_price: string;
	currency: string;
	status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
	status_label: string;
	details: string | null;
	notes: string | null;
	paid_at: string | null;
	confirmed_by: number | null;
	confirmer: TransactionConfirmer | null;
	confirmed_at: string | null;
	cheque_image: string | null;
	transfer_receipt: string | null;
	invoice: string | null;
	created_at: string;
	updated_at: string;
}

// ── All transactions ──────────────────────────────────────────────────────────
export const useTransactions = (params?: Record<string, any>) => {
	const queryClient = useQueryClient();

	const {
		data: transactionsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["transactions", params],
		queryFn: () => getTransactionsAPI(params),
	});

	// Confirm payment
	const confirmMutation = useMutation({
		mutationFn: ({ id, notes }: { id: number | string; notes: string }) =>
			confirmTransactionAPI(id, { notes }),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["transaction"] });
			toast.success(res?.message || "Transaction confirmed successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to confirm transaction",
			);
		},
	});

	return {
		transactions: (transactionsData?.data ?? []) as Transaction[],
		meta: transactionsData?.meta,
		links: transactionsData?.links,
		isLoading,
		error,
		refetch,
		confirmTransaction: confirmMutation.mutateAsync,
		isConfirming: confirmMutation.isPending,
	};
};

// ── Single transaction ────────────────────────────────────────────────────────
export const useTransaction = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["transaction", id],
		queryFn: () => getTransactionAPI(id!),
		enabled: !!id,
	});

	return {
		transaction: data?.data as Transaction | undefined,
		isLoading,
		error,
	};
};
