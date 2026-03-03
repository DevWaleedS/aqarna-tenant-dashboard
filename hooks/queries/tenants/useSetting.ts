import { getSettingsAPI, updateSettingAPI } from "@/apis/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export interface Setting {
	id: number;
	name: string;
	description: string;
	area: string;
	key: string;
	value: any;
	data_type: "string" | "integer" | "boolean" | "array" | "file";
	data_variable: string[] | null;
}

export interface SettingsResponse {
	data: Setting[];
	status: number;
	message: string;
}

export const useSetting = () => {
	const queryClient = useQueryClient();

	// Get all settings
	const settingsQuery = useQuery({
		queryKey: ["settings"],
		queryFn: getSettingsAPI,
		select: (response: SettingsResponse) => response.data || [],
	});

	// Group settings by area
	const settingsByArea = settingsQuery.data?.reduce(
		(acc, setting) => {
			if (!acc[setting.area]) {
				acc[setting.area] = [];
			}
			acc[setting.area].push(setting);
			return acc;
		},
		{} as Record<string, Setting[]>,
	);

	// Update a specific setting
	const updateMutation = useMutation({
		mutationFn: ({ key, value }: { key: string; value: any }) =>
			updateSettingAPI(key, value),
		onSuccess: (res, variables) => {
			// Invalidate and refetch settings
			queryClient.invalidateQueries({ queryKey: ["settings"] });
			toast.success(res.message || "Setting updated successfully!");
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update setting");
		},
	});

	return {
		settings: settingsQuery.data || [],
		settingsByArea: settingsByArea || {},
		isLoadingSettings: settingsQuery.isLoading,
		isErrorSettings: settingsQuery.isError,
		refetchSettings: settingsQuery.refetch,
		updateSetting: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		updateError: updateMutation.error,
	};
};
