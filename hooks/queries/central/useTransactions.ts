import {
	confirmTransactionAPI,
	getTransactionAPI,
	getTransactionsAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

export const TRANSACTIONS_QUERY_KEY = ["transactions"];

export const useTransactions = () => {
	const queryClient = useQueryClient();

	// Fetch all transactions
	const {
		data: transaction,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: TRANSACTIONS_QUERY_KEY,
		queryFn: getTransactionsAPI,
	});

	// Confirm transaction mutation
	const confirmTransactionMutation = useMutation({
		mutationFn: (transactionId: string) => confirmTransactionAPI(transactionId),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
			toast.success(res.message);
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to confirm transaction");
		},
	});

	return {
		transactions: transaction?.data || [],
		isLoading,
		error,
		refetch,
		confirmTransaction: confirmTransactionMutation.mutate,
		isConfirming: confirmTransactionMutation.isPending,
	};
};

// Hook for single transaction
export const useTransaction = (transactionId: string) => {
	const {
		data: transactionData,
		isLoading,
		error,
	} = useQuery({
		queryKey: [...TRANSACTIONS_QUERY_KEY, transactionId],
		queryFn: () => getTransactionAPI(transactionId),
		enabled: !!transactionId,
	});

	return {
		transaction: transactionData?.data,
		isLoading,
		error,
	};
};
