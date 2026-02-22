import {
	activateCustomerAPI,
	blacklistCustomerAPI,
	createCustomerAPI,
	deleteCustomerAPI,
	getCustomerAPI,
	getCustomersAPI,
	getCustomersLookupAPI,
	updateCustomerAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── All customers (full list) ────────────────────────────────────────────────
export const useCustomers = () => {
	const queryClient = useQueryClient();

	const {
		data: customersData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["customers"],
		queryFn: getCustomersAPI,
	});

	// Create
	const createMutation = useMutation({
		mutationFn: createCustomerAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			queryClient.invalidateQueries({ queryKey: ["customers-lookup"] });
			toast.success(res?.message || "Customer created successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to create customer",
			);
		},
	});

	// Update
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: any }) =>
			updateCustomerAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			queryClient.invalidateQueries({ queryKey: ["customers-lookup"] });
			toast.success(res?.message || "Customer updated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to update customer",
			);
		},
	});

	// Delete
	const deleteMutation = useMutation({
		mutationFn: deleteCustomerAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			queryClient.invalidateQueries({ queryKey: ["customers-lookup"] });
			toast.success(res?.message || "Customer deleted successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to delete customer",
			);
		},
	});

	// Blacklist
	const blacklistMutation = useMutation({
		mutationFn: blacklistCustomerAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			toast.success(res?.message || "Customer blacklisted");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to blacklist customer",
			);
		},
	});

	// Activate
	const activateMutation = useMutation({
		mutationFn: activateCustomerAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			toast.success(res?.message || "Customer activated");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to activate customer",
			);
		},
	});

	return {
		customers: customersData?.data || [],
		meta: customersData?.meta,
		isLoading,
		error,
		refetch,
		createCustomer: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateCustomer: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteCustomer: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
		blacklistCustomer: blacklistMutation.mutateAsync,
		isBlacklisting: blacklistMutation.isPending,
		activateCustomer: activateMutation.mutateAsync,
		isActivating: activateMutation.isPending,
	};
};

// ── Single customer ──────────────────────────────────────────────────────────
export const useCustomer = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["customer", id],
		queryFn: () => getCustomerAPI(id!),
		enabled: !!id,
	});

	return {
		customer: data?.data,
		isLoading,
		error,
	};
};

// ── Lookup list (id + name) — for selects/dropdowns ─────────────────────────
export const useCustomersLookup = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["customers-lookup"],
		queryFn: getCustomersLookupAPI,
	});

	return {
		customersLookup: data?.data || [],
		isLoading,
	};
};
