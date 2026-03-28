"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/safe-image";
import { useTheme } from "next-themes";

import LogoDark from "@/public/assets/images/logo.png";
import LogoWhite from "@/public/assets/images/logo-light.png";
import LogoIcon from "@/public/assets/images/logo-icon.png";
import { cn } from "@/lib/utils";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useSetting } from "@/hooks/queries/useSetting";

function LogoSidebar() {
	const { theme } = useTheme();
	const isCollapsed = useSidebarCollapsed();

	const [isMounted, setIsMounted] = useState(false);

	const { settingsByArea } = useSetting();

	const logo = settingsByArea["general"]?.[5]["value"];
	const description = settingsByArea["general"]?.[5]["description"];

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Don't render until mounted to avoid hydration mismatch or wrong theme
	if (!isMounted) return null;

	return (
		<Link
			href='/home'
			className={cn(
				"sidebar-logo h-18 py-3.5 flex items-center justify-center border-b border-neutral-100 dark:border-slate-700",
				isCollapsed ? "px-1" : "px-4",
			)}>
			<SafeImage
				// src={isCollapsed ? LogoIcon : theme === "dark" ? LogoWhite : LogoDark}
				src={logo}
				alt={description}
				width={isCollapsed ? 44 : 168}
				height={40}
				priority
			/>
		</Link>
	);
}

export default LogoSidebar;
