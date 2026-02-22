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

export const ROLES_QUERY_KEY = ["roles"];

export const useRoles = () => {
	const queryClient = useQueryClient();

	// Fetch all roles
	const {
		data: rolesData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ROLES_QUERY_KEY,
		queryFn: getRolesAPI,
	});

	// Create role mutation
	const createRoleMutation = useMutation({
		mutationFn: (roleData: any) => createRoleAPI(roleData),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
			toast.success(res.message || "Role created successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create role");
		},
	});

	// Update role mutation
	const updateRoleMutation = useMutation({
		mutationFn: ({ roleId, roleData }: { roleId: string; roleData: any }) =>
			updateRoleAPI(roleId, roleData),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
			toast.success(res.message || "Role updated successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update role");
		},
	});

	// Delete role mutation
	const deleteRoleMutation = useMutation({
		mutationFn: (roleId: string) => deleteRoleAPI(roleId),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
			toast.success(res.message || "Role deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete role");
		},
	});

	// Update role permissions mutation
	const updateRolePermissionsMutation = useMutation({
		mutationFn: ({
			roleId,
			permissions,
		}: {
			roleId: string;
			permissions: string[];
		}) => updateRolePermissionsAPI(roleId, { permissions }),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
			toast.success(res.message || "Permissions updated successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to update permissions",
			);
		},
	});

	return {
		roles: rolesData?.data || [],
		isLoading,
		error,
		refetch,
		createRole: createRoleMutation.mutate,
		isCreating: createRoleMutation.isPending,
		updateRole: updateRoleMutation.mutate,
		isUpdating: updateRoleMutation.isPending,
		deleteRole: deleteRoleMutation.mutate,
		isDeleting: deleteRoleMutation.isPending,
		updateRolePermissions: updateRolePermissionsMutation.mutate,
		isUpdatingPermissions: updateRolePermissionsMutation.isPending,
	};
};

// Hook for single role
export const useRole = (roleId: string) => {
	const {
		data: roleData,
		isLoading,
		error,
	} = useQuery({
		queryKey: [...ROLES_QUERY_KEY, roleId],
		queryFn: () => getRoleAPI(roleId),
		enabled: !!roleId,
	});

	return {
		role: roleData?.data,
		isLoading,
		error,
	};
};
