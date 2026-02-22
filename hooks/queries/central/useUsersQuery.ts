import {
	createUserAPI,
	deleteUserAPI,
	getUserAPI,
	getUsersAPI,
	updateUserAPI,
	updateUserAvatarAPI,
	updateUserPasswordAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const USERS_QUERY_KEY = ["users"];

export const useUsers = () => {
	const queryClient = useQueryClient();

	// Fetch all users
	const {
		data: usersData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: USERS_QUERY_KEY,
		queryFn: getUsersAPI,
	});

	// Create user mutation
	const createUserMutation = useMutation({
		mutationFn: (userData: any) => createUserAPI(userData),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
			toast.success(res.message || "User created successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create user");
		},
	});

	// Update user mutation
	const updateUserMutation = useMutation({
		mutationFn: ({ userId, userData }: { userId: string; userData: any }) =>
			updateUserAPI(userId, userData),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
			toast.success(res.message || "User updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update user");
		},
	});

	// Delete user mutation
	const deleteUserMutation = useMutation({
		mutationFn: (userId: string) => deleteUserAPI(userId),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
			toast.success(res.message || "User deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete user");
		},
	});

	// Update user password mutation
	const updatePasswordMutation = useMutation({
		mutationFn: (passwordData: any) => updateUserPasswordAPI(passwordData),
		onSuccess: (res) => {
			toast.success(res.message || "Password updated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to update password",
			);
		},
	});

	// Update user avatar mutation
	const updateAvatarMutation = useMutation({
		mutationFn: (avatarFile: File) => updateUserAvatarAPI(avatarFile),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
			toast.success(res.message || "Avatar updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update avatar");
		},
	});

	return {
		users: usersData?.data || [],
		isLoading,
		error,
		refetch,
		createUser: createUserMutation.mutate,
		isCreating: createUserMutation.isPending,
		updateUser: updateUserMutation.mutate,
		isUpdating: updateUserMutation.isPending,
		deleteUser: deleteUserMutation.mutate,
		isDeleting: deleteUserMutation.isPending,
		updatePassword: updatePasswordMutation.mutate,
		isUpdatingPassword: updatePasswordMutation.isPending,
		updateAvatar: updateAvatarMutation.mutate,
		isUpdatingAvatar: updateAvatarMutation.isPending,
	};
};

// Hook for single user
export const useUser = (userId: string) => {
	const {
		data: userData,
		isLoading,
		error,
	} = useQuery({
		queryKey: [...USERS_QUERY_KEY, userId],
		queryFn: () => getUserAPI(userId),
		enabled: !!userId,
	});

	return {
		user: userData?.data,
		isLoading,
		error,
	};
};
