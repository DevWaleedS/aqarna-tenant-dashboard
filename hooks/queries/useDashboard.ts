import { getDashboardOverviewAPI } from "@/apis/endpoints";
import { useQuery } from "@tanstack/react-query";

export interface CardData {
	total: number;
	growth: number;
	trend: "up" | "down" | "neutral";
}

export interface DashboardCards {
	users: CardData;
	packages: CardData;
	tenants: CardData;
	subscriptions: CardData;
	transactions: CardData;
}

export interface DashboardCharts {
	sales_chart: number[];
	user_overview: number[];
}

export interface DashboardOverview {
	cards: DashboardCards;
	charts: DashboardCharts;
}

export interface DashboardResponse {
	data: DashboardOverview;
	status: number;
	message: string;
}

export const useDashboard = () => {
	// Get dashboard overview
	const dashboardQuery = useQuery({
		queryKey: ["dashboard-overview"],
		queryFn: getDashboardOverviewAPI,
		refetchOnWindowFocus: true,
	});

	return {
		overview: dashboardQuery.data,
		cards: dashboardQuery.data?.cards,
		charts: dashboardQuery.data?.charts,
		isLoading: dashboardQuery.isLoading,
		isError: dashboardQuery.isError,
		error: dashboardQuery.error,
		refetch: dashboardQuery.refetch,
	};
};
