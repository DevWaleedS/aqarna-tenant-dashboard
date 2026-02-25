import {
	createPropertyAPI,
	deletePropertyAPI,
	getPropertiesAPI,
	getPropertiesLookupAPI,
	getPropertyAPI,
	updatePropertyAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── All properties (list + CRUD mutations) ────────────────────────────────────
export const useProperties = () => {
	const queryClient = useQueryClient();

	const {
		data: propertiesData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["properties"],
		queryFn: getPropertiesAPI,
	});

	// Create
	const createMutation = useMutation({
		mutationFn: createPropertyAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			queryClient.invalidateQueries({ queryKey: ["properties-lookup"] });
			toast.success(res?.message || "Property created successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to create property",
			);
		},
	});

	// Update
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: any }) =>
			updatePropertyAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			queryClient.invalidateQueries({ queryKey: ["property"] });
			queryClient.invalidateQueries({ queryKey: ["properties-lookup"] });
			toast.success(res?.message || "Property updated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to update property",
			);
		},
	});

	// Delete
	const deleteMutation = useMutation({
		mutationFn: deletePropertyAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			queryClient.invalidateQueries({ queryKey: ["properties-lookup"] });
			toast.success(res?.message || "Property deleted successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to delete property",
			);
		},
	});

	return {
		properties: propertiesData?.data || [],
		meta: propertiesData?.meta,
		isLoading,
		error,
		refetch,
		createProperty: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateProperty: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteProperty: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
};

// ── Single property ───────────────────────────────────────────────────────────
export const useProperty = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["property", id],
		queryFn: () => getPropertyAPI(id!),
		enabled: !!id,
	});

	return {
		property: data?.data,
		isLoading,
		error,
	};
};

// ── Lookup — for Select / ComboBox components ─────────────────────────────────
export const usePropertiesLookup = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["properties-lookup"],
		queryFn: getPropertiesLookupAPI,
	});

	return {
		propertiesLookup: data?.data || [],
		isLoading,
	};
};
