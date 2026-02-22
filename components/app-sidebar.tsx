"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

import { NavMain } from "@/components/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import LogoSidebar from "./shared/logo-sidebar";
import { data } from "./sidebar-data";
import { filterMenuItemsByPermissions } from "@/lib/permissionUtils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession();

	// Filter menu items based on user permissions
	const filteredItems = React.useMemo(() => {
		if (!session?.user?.permissions) {
			return [];
		}
		return filterMenuItemsByPermissions(data.navMain, session.user.permissions);
	}, [session?.user?.permissions]);

	return (
		<Sidebar collapsible='icon' {...props} className='hidden xl:block'>
			<SidebarHeader>
				<LogoSidebar />
			</SidebarHeader>

			<SidebarContent className='scrollbar-thin scrollbar-invisible hover:scrollbar-visible'>
				<NavMain items={filteredItems} />
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
