import {
	getMaintenanceTicketAPI,
	getMaintenanceTicketsAPI,
	updateMaintenanceTicketAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── All tickets ──────────────────────────────────────────────────────────────
export const useMaintenanceTickets = () => {
	const queryClient = useQueryClient();

	const {
		data: ticketsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["maintenance-tickets"],
		queryFn: getMaintenanceTicketsAPI,
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: any }) =>
			updateMaintenanceTicketAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["maintenance-tickets"] });
			queryClient.invalidateQueries({ queryKey: ["maintenance-ticket"] });
			toast.success(res?.message || "Ticket updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update ticket");
		},
	});

	return {
		tickets: ticketsData?.data || [],
		meta: ticketsData?.meta,
		isLoading,
		error,
		refetch,
		updateTicket: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
	};
};

// ── Single ticket ────────────────────────────────────────────────────────────
export const useMaintenanceTicket = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["maintenance-ticket", id],
		queryFn: () => getMaintenanceTicketAPI(id!),
		enabled: !!id,
	});

	return {
		ticket: data?.data,
		isLoading,
		error,
	};
};
