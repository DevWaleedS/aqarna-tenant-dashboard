import {
	getPackagesLookupAPI,
	getSubscriptionInfoAPI,
	renewSubscriptionAPI,
	upgradeSubscriptionAPI,
} from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ── Subscription info + mutations ─────────────────────────────────────────────
export const useSubscription = () => {
	const queryClient = useQueryClient();

	const {
		data: subscriptionData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["subscription-info"],
		queryFn: getSubscriptionInfoAPI,
	});

	// Renew — requires { package_id } in the body
	const renewMutation = useMutation({
		mutationFn: (data: { package_id: number }) => renewSubscriptionAPI(data),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["subscription-info"] });
			toast.success(res?.message || "Subscription renewal initiated");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to renew subscription",
			);
		},
	});

	// Upgrade
	const upgradeMutation = useMutation({
		mutationFn: upgradeSubscriptionAPI,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["subscription-info"] });
			toast.success(res?.message || "Subscription upgraded successfully");
		},
		onError: (error: any) => {
			toast.error(
				error?.response?.data?.message || "Failed to upgrade subscription",
			);
		},
	});

	return {
		subscription: subscriptionData?.data?.subscription ?? null,
		pkg: subscriptionData?.data?.package ?? null,
		isLoading,
		error,
		refetch,
		renewSubscription: renewMutation.mutateAsync,
		isRenewing: renewMutation.isPending,
		renewData: renewMutation.data?.data ?? null,
		upgradeSubscription: upgradeMutation.mutateAsync,
		isUpgrading: upgradeMutation.isPending,
	};
};

// ── Packages lookup — lightweight list for Select dropdowns ──────────────────
export const usePackagesLookup = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["packages-lookup"],
		queryFn: getPackagesLookupAPI,
	});

	return {
		packagesLookup: (data?.data ?? []) as { id: number; name: string }[],
		isLoading,
	};
};
