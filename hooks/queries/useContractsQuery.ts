import {
	createContractAPI,
	getContractAPI,
	getContractsAPI,
	terminateContractAPI,
	updateContractAPI,
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
			toast.success(res?.message || "Contract created successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to create contract",
			);
		},
	});

	// Update contract mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: any }) =>
			updateContractAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["contracts"] });
			toast.success(res?.message || "Contract updated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to update contract",
			);
		},
	});

	// Terminate contract mutation
	const terminateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number | string;
			data?: { reason?: string };
		}) => terminateContractAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["contracts"] });
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
		updateContract: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
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
