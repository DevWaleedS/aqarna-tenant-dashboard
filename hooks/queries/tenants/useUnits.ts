import {
	createUnitAPI,
	deleteUnitAPI,
	getUnitAPI,
	getUnitsAPI,
	getUnitsLookupAPI,
	updateUnitAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── All units (list + CRUD mutations) ────────────────────────────────────────
export const useUnits = () => {
	const queryClient = useQueryClient();

	const {
		data: unitsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["units"],
		queryFn: getUnitsAPI,
	});

	// Create
	const createMutation = useMutation({
		mutationFn: createUnitAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["units-lookup"] });
			toast.success(res?.message || "Unit created successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create unit");
		},
	});

	// Update
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: any }) =>
			updateUnitAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["unit"] });
			queryClient.invalidateQueries({ queryKey: ["units-lookup"] });
			toast.success(res?.message || "Unit updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update unit");
		},
	});

	// Delete
	const deleteMutation = useMutation({
		mutationFn: deleteUnitAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["units-lookup"] });
			toast.success(res?.message || "Unit deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete unit");
		},
	});

	return {
		units: unitsData?.data || [],
		meta: unitsData?.meta,
		isLoading,
		error,
		refetch,
		createUnit: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateUnit: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteUnit: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
};

// ── Single unit ──────────────────────────────────────────────────────────────
export const useUnit = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["unit", id],
		queryFn: () => getUnitAPI(id!),
		enabled: !!id,
	});

	return {
		unit: data?.data,
		isLoading,
		error,
	};
};

// ── Lookup — for Select / ComboBox components ────────────────────────────────
export const useUnitsLookup = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["units-lookup"],
		queryFn: getUnitsLookupAPI,
	});

	return {
		unitsLookup: data?.data || [],
		isLoading,
	};
};
