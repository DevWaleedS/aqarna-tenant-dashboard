import {
	createContractAPI,
	getContractAPI,
	getContractsAPI,
	getContractsLookupAPI,
	terminateContractAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useContracts = () => {
	const queryClient = useQueryClient();

	// Fetch all contracts
	const {
		data: contractsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["contracts"],
		queryFn: getContractsAPI,
	});

	// Create contract mutation
	const createMutation = useMutation({
		mutationFn: createContractAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["contracts"] });
			queryClient.invalidateQueries({ queryKey: ["contracts-lookup"] });
			toast.success(res?.message || "Contract created successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to create contract",
			);
		},
	});

	// Terminate contract mutation
	const terminateMutation = useMutation({
		mutationFn: ({
			id,
			termination_reason,
		}: {
			id: number | string;
			termination_reason: string;
		}) => terminateContractAPI(id, termination_reason),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["contracts"] });
			queryClient.invalidateQueries({ queryKey: ["contracts-lookup"] });
			toast.success(res?.message || "Contract terminated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to terminate contract",
			);
		},
	});

	return {
		contracts: contractsData?.data || [],
		isLoading,
		error,
		refetch,
		createContract: createMutation.mutateAsync,
		isCreating: createMutation.isPending,

		terminateContract: terminateMutation.mutateAsync,
		isTerminating: terminateMutation.isPending,
	};
};

// Hook for single contract
export const useContract = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["contract", id],
		queryFn: () => getContractAPI(id!),
		enabled: !!id,
	});

	return {
		contract: data?.data,
		isLoading,
		error,
	};
};

// ── Lookup — for Select / ComboBox components ────────────────────────────────
export const useContractsLookup = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["contracts-lookup"],
		queryFn: getContractsLookupAPI,
	});

	return {
		contractsLookup: data?.data || [],
		isLoading,
	};
};
