import {
	Boxes,
	House,
	Settings,
	ShieldCheck,

	// new icons below
	Combine,
	Newspaper,
	Users,
	Bell,
	BookUser,
	HandCoins,
	Construction,
	Gauge,
	MapPinHouse,
} from "lucide-react";

export interface NavItem {
	title: string;
	url: string;
	icon?: any;
	isActive?: boolean;
	label?: string;
	requiredPermissions?: string | string[]; // Single permission or array of permissions
	requireAllPermissions?: boolean; // If true, user needs ALL permissions. If false, user needs AT LEAST ONE
	items?: NavSubItem[];
}

export interface NavSubItem {
	title: string;
	url: string;
	circleColor: string;
	requiredPermissions?: string | string[];
	requireAllPermissions?: boolean;
}

export const data = {
	navMain: [
		{
			title: "home",
			url: "home",
			icon: House,
			requiredPermissions: "statistics.read", // Home/Dashboard requires statistics read
		},

		{
			title: "contracts",
			url: "contracts",
			icon: BookUser,
			// requiredPermissions: ["contracts.read"], // Requires packages read permission
		},

		{
			title: "customers",
			url: "customers",
			icon: HandCoins,
			// requiredPermissions: ["customers.read"], // Requires packages read permission
		},

		{
			title: "maintenance-tickets",
			url: "maintenance-tickets",
			icon: Construction,
			// requiredPermissions: ["maintenance-tickets.read"], // Requires packages read permission
		},

		{
			title: "meter-management",
			url: "#",
			icon: Gauge,
			isActive: true,
			// requiredPermissions: ["meter.read", "meter_readings.read"], // Parent group requires at least one
			requireAllPermissions: false,
			items: [
				{
					title: "meters",
					url: "meters",
					circleColor: "bg-primary",
					// requiredPermissions: "meters.read",
				},
				{
					title: "meter-readings",
					url: "meter-readings",
					circleColor: "bg-primary",
					// requiredPermissions: "meter_readings.read",
				},
			],
		},

		{
			title: "properties",
			url: "properties",
			icon: MapPinHouse,
			// requiredPermissions: ["customers.read"], // Requires packages read permission
		},

		{
			title: "units",
			url: "units",
			icon: Boxes,
			// requiredPermissions: ["units.read"], // Requires packages read permission
		},

		{
			title: "customers",
			url: "customers",
			icon: HandCoins,
			// requiredPermissions: ["customers.read"], // Requires packages read permission
		},

		// --------------------------------------------------------

		{
			title: "subscription",
			url: "subscription",
			icon: Combine,
			// requiredPermissions: ["subscription.read"], // Requires packages read permission
		},

		{
			title: "transactions",
			url: "transactions",
			icon: Newspaper,
			requiredPermissions: "transactions.read", // Requires transactions read permission
		},

		{
			title: "users",
			url: "users",
			icon: Users,
			requiredPermissions: "users.read", // Requires users read permission
		},

		{
			title: "roles-permissions",
			url: "roles-and-permissions",
			icon: ShieldCheck,
			requiredPermissions: ["roles.read", "permissions.read"], // Requires both roles and permissions read
			requireAllPermissions: true,
		},

		{
			title: "notification",
			url: "notifications",
			icon: Bell,
			requiredPermissions: "notifications.read", // Requires notifications read permission
		},
		{
			title: "setting",
			url: "setting",
			icon: Settings,
			requiredPermissions: "settings.read", // Parent group requires settings read
		},
	],
};
