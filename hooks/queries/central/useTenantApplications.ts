import {
	getTenantApplicationsAPI,
	getTenantApplicationAPI,
	createTenantApplicationAPI,
	approveTenantApplicationAPI,
	rejectTenantApplicationAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const TENANT_APPLICATIONS_QUERY_KEY = ["tenant-applications"];

export const useTenantApplications = () => {
	const queryClient = useQueryClient();

	// Fetch all tenant applications
	const {
		data: applicationsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: TENANT_APPLICATIONS_QUERY_KEY,
		queryFn: getTenantApplicationsAPI,
	});

	// Create tenant application mutation
	const createApplicationMutation = useMutation({
		mutationFn: (applicationData: any) =>
			createTenantApplicationAPI(applicationData),
		onSuccess: (res) => {
			queryClient.invalidateQueries({
				queryKey: TENANT_APPLICATIONS_QUERY_KEY,
			});
			toast.success(res.message);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message);
		},
	});

	// Approve tenant application mutation
	const approveApplicationMutation = useMutation({
		mutationFn: (applicationId: string) =>
			approveTenantApplicationAPI(applicationId),
		onSuccess: (res) => {
			queryClient.invalidateQueries({
				queryKey: TENANT_APPLICATIONS_QUERY_KEY,
			});
			toast.success(res.message);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message);
		},
	});

	// Reject tenant application mutation
	const rejectApplicationMutation = useMutation({
		mutationFn: (applicationId: string) =>
			rejectTenantApplicationAPI(applicationId),
		onSuccess: (res) => {
			queryClient.invalidateQueries({
				queryKey: TENANT_APPLICATIONS_QUERY_KEY,
			});
			toast.success(res.message);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message);
		},
	});

	return {
		applications: applicationsData?.data || [],
		meta: applicationsData?.meta,
		links: applicationsData?.links,
		isLoading,
		error,
		refetch,
		createApplication: createApplicationMutation.mutate,
		isCreating: createApplicationMutation.isPending,
		approveApplication: approveApplicationMutation.mutate,
		isApproving: approveApplicationMutation.isPending,
		rejectApplication: rejectApplicationMutation.mutate,
		isRejecting: rejectApplicationMutation.isPending,
	};
};

// Hook for single tenant application
export const useTenantApplication = (applicationId: string) => {
	const {
		data: applicationData,
		isLoading,
		error,
	} = useQuery({
		queryKey: [...TENANT_APPLICATIONS_QUERY_KEY, applicationId],
		queryFn: () => getTenantApplicationAPI(applicationId),
		enabled: !!applicationId,
	});

	return {
		application: applicationData?.data,
		isLoading,
		error,
	};
};
