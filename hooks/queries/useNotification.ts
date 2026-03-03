import {
	deleteNotificationAPI,
	getNotificationsAPI,
	markAllNotificationsAsReadAPI,
	markNotificationAsReadAPI,
} from "@/apis/endpoints";
import { Notification } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"];

export const useNotifications = () => {
	const queryClient = useQueryClient();

	// Fetch notifications
	const {
		data: notifications,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: NOTIFICATIONS_QUERY_KEY,
		queryFn: getNotificationsAPI,
		refetchInterval: 30000, // Refetch every 30 seconds
		staleTime: 10000, // Consider data stale after 10 seconds
	});

	// Calculate unread count
	const unreadCount =
		notifications?.data?.filter((n: Notification) => !n.read_at).length || 0;

	// Mark all as read mutation
	const markAllAsReadMutation = useMutation({
		mutationFn: markAllNotificationsAsReadAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
			toast.success(res.mess);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to mark notifications as read");
		},
	});

	// Mark single notification as read mutation
	const markAsReadMutation = useMutation({
		mutationFn: (notificationId: string) =>
			markNotificationAsReadAPI(notificationId),
		onMutate: async (notificationId) => {
			// Optimistic update
			await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

			const previousNotifications = queryClient.getQueryData(
				NOTIFICATIONS_QUERY_KEY,
			);

			queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (old: any) => {
				if (!old?.data) return old;
				return {
					...old,
					data: old.data.map((n: Notification) =>
						n.id === notificationId
							? { ...n, read_at: new Date().toISOString() }
							: n,
					),
				};
			});

			return { previousNotifications };
		},
		onError: (err, notificationId, context) => {
			// Rollback on error
			if (context?.previousNotifications) {
				queryClient.setQueryData(
					NOTIFICATIONS_QUERY_KEY,
					context.previousNotifications,
				);
			}
			toast.error(err.message || "Failed to mark notification as read");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
		},
	});

	// Delete notification mutation
	const deleteNotificationMutation = useMutation({
		mutationFn: (notificationId: string) =>
			deleteNotificationAPI(notificationId),
		onMutate: async (notificationId) => {
			// Optimistic update
			await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

			const previousNotifications = queryClient.getQueryData(
				NOTIFICATIONS_QUERY_KEY,
			);

			queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (old: any) => {
				if (!old?.data) return old;
				return {
					...old,
					data: old.data.filter((n: Notification) => n.id !== notificationId),
				};
			});

			return { previousNotifications };
		},
		onError: (err, notificationId, context) => {
			if (context?.previousNotifications) {
				queryClient.setQueryData(
					NOTIFICATIONS_QUERY_KEY,
					context.previousNotifications,
				);
			}
			toast.error(err?.message || "Failed to delete notification");
		},
		onSuccess: (res) => {
			toast.success(res.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
		},
	});

	return {
		notifications: notifications?.data || [],
		unreadCount,
		isLoading,
		error,
		refetch,
		markAllAsRead: markAllAsReadMutation.mutate,
		markAsRead: markAsReadMutation.mutate,
		deleteNotification: deleteNotificationMutation.mutate,
		isMarkingAllAsRead: markAllAsReadMutation.isPending,
		isMarkingAsRead: markAsReadMutation.isPending,
		isDeletingNotification: deleteNotificationMutation.isPending,
	};
};
