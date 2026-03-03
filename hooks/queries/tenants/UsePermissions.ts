import { getPermissionsAPI } from "@/apis/endpoints";
import { useQuery } from "@tanstack/react-query";

export const PERMISSIONS_QUERY_KEY = ["permissions"];

export const usePermissions = () => {
	// Fetch all permissions
	const {
		data: permissionsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: PERMISSIONS_QUERY_KEY,
		queryFn: getPermissionsAPI,
	});

	return {
		permissions: permissionsData?.data || [],
		isLoading,
		error,
		refetch,
	};
};
