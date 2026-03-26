import {
	createMeterAPI,
	deleteMeterAPI,
	getMeterAPI,
	getMetersAPI,
	getMetersLookupAPI,
	updateMeterAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── All meters ───────────────────────────────────────────────────────────────
export const useMeters = () => {
	const queryClient = useQueryClient();

	const {
		data: metersData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["meters"],
		queryFn: getMetersAPI,
	});

	// Create
	const createMutation = useMutation({
		mutationFn: createMeterAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["meters"] });
			queryClient.invalidateQueries({ queryKey: ["meters-lookup"] });
			toast.success(res?.message || "Meter created successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create meter");
		},
	});

	// Update
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: any }) =>
			updateMeterAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["meters"] });
			queryClient.invalidateQueries({ queryKey: ["meter"] });
			queryClient.invalidateQueries({ queryKey: ["meters-lookup"] });
			toast.success(res?.message || "Meter updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update meter");
		},
	});

	// Delete
	const deleteMutation = useMutation({
		mutationFn: deleteMeterAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["meters"] });
			queryClient.invalidateQueries({ queryKey: ["meters-lookup"] });
			toast.success(res?.message || "Meter deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete meter");
		},
	});

	return {
		meters: metersData?.data || [],
		meta: metersData?.meta,
		isLoading,
		error,
		refetch,
		createMeter: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateMeter: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteMeter: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
};

// ── Single meter ─────────────────────────────────────────────────────────────
export const useMeter = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["meter", id],
		queryFn: () => getMeterAPI(id!),
		enabled: !!id,
	});

	return {
		meter: data?.data,
		isLoading,
		error,
	};
};

// ── Lookup — for Select / ComboBox components ────────────────────────────────
export const useMetersLookup = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["meters-lookup"],
		queryFn: getMetersLookupAPI,
	});

	return {
		metersLookup: data?.data || [],
		isLoading,
	};
};
