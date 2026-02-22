// hooks/queries/central/useTenants.ts
import {
	createTenantAPI,
	deleteTenantAPI,
	getTenantAPI,
	getTenantsAPI,
	updateTenantAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

export const useTenants = () => {
	const queryClient = useQueryClient();

	// Fetch all tenants
	const {
		data: tenantsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["tenants"],
		queryFn: getTenantsAPI,
	});

	// Create tenant mutation
	const createMutation = useMutation({
		mutationFn: createTenantAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["tenants"] });
			toast.success(res?.message);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create tenant");
		},
	});

	// Update tenant mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: any }) =>
			updateTenantAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["tenants"] });
			toast.success(res?.message);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update tenant");
		},
	});

	// Delete tenant mutation
	const deleteMutation = useMutation({
		mutationFn: deleteTenantAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["tenants"] });
			toast.success(res?.message);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete tenant");
		},
	});

	return {
		tenants: tenantsData?.data || [],
		meta: tenantsData?.meta,
		isLoading,
		error,
		refetch,
		createTenant: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateTenant: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteTenant: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
};

// Hook for single tenant
export const useTenant = (id?: number) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["tenant", id],
		queryFn: () => getTenantAPI(id!),
		enabled: !!id,
	});

	return {
		tenant: data?.data,
		isLoading,
		error,
	};
};
