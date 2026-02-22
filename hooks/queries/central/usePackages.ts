// hooks/usePackages.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getPackagesAPI,
	getPackageAPI,
	createPackageAPI,
	updatePackageAPI,
	deletePackageAPI,
} from "@/apis/endpoints";
import toast from "react-hot-toast";
import { Package, PackageFormData } from "@/types/package";

export const PACKAGES_QUERY_KEY = ["packages"];

export const usePackages = () => {
	const queryClient = useQueryClient();

	// Fetch all packages
	const {
		data: packages,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: PACKAGES_QUERY_KEY,
		queryFn: getPackagesAPI,
	});

	// Create package mutation
	const createPackageMutation = useMutation({
		mutationFn: (packageData: PackageFormData) => createPackageAPI(packageData),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
			toast.success(res.message);
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to create package");
		},
	});

	// Update package mutation
	const updatePackageMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<PackageFormData>;
		}) => updatePackageAPI(id, data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
			toast.success(res.message);
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to update package");
		},
	});

	// Delete package mutation
	const deletePackageMutation = useMutation({
		mutationFn: (packageId: string) => deletePackageAPI(packageId),
		onMutate: async (packageId) => {
			// Optimistic update
			await queryClient.cancelQueries({ queryKey: PACKAGES_QUERY_KEY });

			const previousPackages = queryClient.getQueryData(PACKAGES_QUERY_KEY);

			queryClient.setQueryData(PACKAGES_QUERY_KEY, (old: any) => {
				if (!old?.data) return old;
				return {
					...old,
					data: old.data.filter((pkg: Package) => pkg.id !== packageId),
				};
			});

			return { previousPackages };
		},
		onError: (err, packageId, context) => {
			// Rollback on error
			if (context?.previousPackages) {
				queryClient.setQueryData(PACKAGES_QUERY_KEY, context.previousPackages);
			}
			toast.error(err?.message || "Failed to delete package");
		},
		onSuccess: (res) => {
			toast.success(res.message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: PACKAGES_QUERY_KEY });
		},
	});

	return {
		packages: packages?.data || [],
		isLoading,
		error,
		refetch,
		createPackage: createPackageMutation.mutate,
		updatePackage: updatePackageMutation.mutate,
		deletePackage: deletePackageMutation.mutate,
		isCreating: createPackageMutation.isPending,
		isUpdating: updatePackageMutation.isPending,
		isDeleting: deletePackageMutation.isPending,
	};
};

// Hook for single package
export const usePackage = (packageId: string) => {
	const {
		data: packageData,
		isLoading,
		error,
	} = useQuery({
		queryKey: [...PACKAGES_QUERY_KEY, packageId],
		queryFn: () => getPackageAPI(packageId),
		enabled: !!packageId,
	});

	return {
		package: packageData?.data,
		isLoading,
		error,
	};
};
