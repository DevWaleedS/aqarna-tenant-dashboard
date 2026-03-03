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

// ── All users + CRUD mutations ────────────────────────────────────────────────
export const useUsers = () => {
	const queryClient = useQueryClient();

	const {
		data: usersData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["users"],
		queryFn: getUsersAPI,
	});

	// Create
	const createMutation = useMutation({
		mutationFn: (formData: FormData) => createUserAPI(formData),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(res?.message || "User created successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create user");
		},
	});

	// Update
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: FormData }) =>
			updateUserAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user"] });
			toast.success(res?.message || "User updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update user");
		},
	});

	// Delete
	const deleteMutation = useMutation({
		mutationFn: deleteUserAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(res?.message || "User deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete user");
		},
	});

	return {
		users: usersData?.data || [],
		meta: usersData?.meta,
		isLoading,
		error,
		refetch,
		createUser: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateUser: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteUser: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
};

// ── Single user ───────────────────────────────────────────────────────────────
export const useUser = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["user", id],
		queryFn: () => getUserAPI(id!),
		enabled: !!id,
	});

	return {
		user: data?.data,
		isLoading,
		error,
	};
};

// ── Update password ───────────────────────────────────────────────────────────
export const useUpdatePassword = () => {
	const updatePasswordMutation = useMutation({
		mutationFn: updateUserPasswordAPI,
		onSuccess: (res) => {
			toast.success(res?.message || "Password updated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to update password",
			);
		},
	});

	return {
		updatePassword: updatePasswordMutation.mutateAsync,
		isUpdatingPassword: updatePasswordMutation.isPending,
	};
};

// ── Update avatar ─────────────────────────────────────────────────────────────
export const useUpdateAvatar = () => {
	const queryClient = useQueryClient();

	const updateAvatarMutation = useMutation({
		mutationFn: (formData: FormData) => updateUserAvatarAPI(formData),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user"] });
			toast.success(res?.message || "Avatar updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update avatar");
		},
	});

	return {
		updateAvatar: updateAvatarMutation.mutateAsync,
		isUpdatingAvatar: updateAvatarMutation.isPending,
	};
};

// ── Roles list (for multi-select) ─────────────────────────────────────────────
import { getRolesAPI } from "@/apis/endpoints";

export const useRoles = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: getRolesAPI,
	});

	return {
		roles: (data?.data ?? []) as {
			id: number;
			name: string;
			guard_name: string;
			permissions_count: number;
		}[],
		isLoading,
	};
};
