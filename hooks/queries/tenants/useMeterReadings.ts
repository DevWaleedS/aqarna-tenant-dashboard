import {
	createMeterReadingAPI,
	createMeterReadingInvoiceAPI,
	getMeterReadingAPI,
	getMeterReadingsAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── All readings ─────────────────────────────────────────────────────────────
export const useMeterReadings = () => {
	const queryClient = useQueryClient();

	const {
		data: readingsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["meter-readings"],
		queryFn: getMeterReadingsAPI,
	});

	// Create reading
	const createMutation = useMutation({
		mutationFn: createMeterReadingAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["meter-readings"] });
			toast.success(res?.message || "Meter reading created successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to create meter reading",
			);
		},
	});

	// Generate invoice
	const invoiceMutation = useMutation({
		mutationFn: (id: number | string) => createMeterReadingInvoiceAPI(id),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["meter-readings"] });
			toast.success(res?.message || "Invoice generated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to generate invoice",
			);
		},
	});

	return {
		readings: readingsData?.data || [],
		meta: readingsData?.meta,
		isLoading,
		error,
		refetch,
		createReading: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		generateInvoice: invoiceMutation.mutateAsync,
		isGeneratingInvoice: invoiceMutation.isPending,
	};
};

// ── Single reading ───────────────────────────────────────────────────────────
export const useMeterReading = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["meter-reading", id],
		queryFn: () => getMeterReadingAPI(id!),
		enabled: !!id,
	});

	return {
		reading: data?.data,
		isLoading,
		error,
	};
};
