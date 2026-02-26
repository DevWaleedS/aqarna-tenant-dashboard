import {
	createRoleAPI,
	deleteRoleAPI,
	getRoleAPI,
	getRolesAPI,
	updateRoleAPI,
	updateRolePermissionsAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── Role shape returned by the API ────────────────────────────────────────────
export interface Role {
	id: number;
	name: string;
	guard_name: string;
	permissions_count: number;
	permissions?: string[];
	created_at: string;
	updated_at: string;
}

// ── All roles + CRUD mutations ────────────────────────────────────────────────
export const useRoles = () => {
	const queryClient = useQueryClient();

	const {
		data: rolesData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["roles"],
		queryFn: getRolesAPI,
	});

	// Create
	const createMutation = useMutation({
		mutationFn: (payload: { name: string; permissions: string[] }) =>
			createRoleAPI(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success(res?.message || "Role created successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create role");
		},
	});

	// Update
	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number | string;
			data: { name?: string; permissions: string[] };
		}) => updateRoleAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			queryClient.invalidateQueries({ queryKey: ["role"] });
			toast.success(res?.message || "Role updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update role");
		},
	});

	// Delete
	const deleteMutation = useMutation({
		mutationFn: deleteRoleAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success(res?.message || "Role deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete role");
		},
	});

	return {
		roles: (rolesData?.data ?? []) as Role[],
		meta: rolesData?.meta,
		isLoading,
		error,
		refetch,
		createRole: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateRole: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		deleteRole: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	};
};

// ── Single role ───────────────────────────────────────────────────────────────
export const useRole = (id?: number | string) => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["role", id],
		queryFn: () => getRoleAPI(id!),
		enabled: !!id,
	});

	return {
		role: data?.data as Role | undefined,
		isLoading,
		error,
	};
};

// ── Update permissions only ───────────────────────────────────────────────────
export const useUpdateRolePermissions = () => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: ({
			id,
			permissions,
		}: {
			id: number | string;
			permissions: string[];
		}) => updateRolePermissionsAPI(id, { permissions }),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			queryClient.invalidateQueries({ queryKey: ["role"] });
			toast.success(res?.message || "Permissions updated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to update permissions",
			);
		},
	});

	return {
		updatePermissions: mutation.mutateAsync,
		isUpdating: mutation.isPending,
	};
};
