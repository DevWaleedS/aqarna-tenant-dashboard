"use client";

import { usePermissions } from "@/hooks/usePermissions";
import React from "react";

interface CanProps {
	do: string | string[]; // Required permission(s)
	requireAll?: boolean; // If true, user needs ALL permissions. Default: true
	children: React.ReactNode;
	fallback?: React.ReactNode; // What to show if user lacks permissions
}

/**
 * Component to conditionally render content based on user permissions
 *
 * Usage:
 * <Can do="users.read">
 *   <DeleteButton />
 * </Can>
 *
 * <Can do={["users.read", "users.update"]} requireAll={true}>
 *   <EditForm />
 * </Can>
 */
export function Can({
	do: permissions,
	requireAll = true,
	children,
	fallback,
}: CanProps) {
	const hasPermission = usePermissions(permissions, requireAll);

	if (!hasPermission) {
		return fallback || null;
	}

	return <>{children}</>;
}
