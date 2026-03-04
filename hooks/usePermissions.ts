"use client";

import { useCurrentUser } from "@/hooks/queries/useAuth";

/**
 * Hook to check if user has required permission(s)
 * @param requiredPermissions - Single permission string or array of permissions
 * @param requireAll - If true, user must have ALL permissions. If false, user must have AT LEAST ONE
 * @returns boolean indicating if user has the required permission(s)
 */
export function usePermissions(
	requiredPermissions: string | string[],
	requireAll: boolean = true,
): boolean {
	const { userData } = useCurrentUser();

	if (!userData?.permissions) {
		return false;
	}

	const userPermissions = userData.permissions;
	const permissions = Array.isArray(requiredPermissions)
		? requiredPermissions
		: [requiredPermissions];

	if (requireAll) {
		// User must have ALL required permissions
		return permissions.every((permission) =>
			userPermissions.includes(permission),
		);
	} else {
		// User must have AT LEAST ONE required permission
		return permissions.some((permission) =>
			userPermissions.includes(permission),
		);
	}
}

/**
 * Utility function to check permissions (for use outside of React components)
 * Typically used in middleware or server-side code
 */
export function hasPermission(
	userPermissions: string[] | undefined,
	requiredPermissions: string | string[],
	requireAll: boolean = true,
): boolean {
	if (!userPermissions || userPermissions.length === 0) {
		return false;
	}

	const permissions = Array.isArray(requiredPermissions)
		? requiredPermissions
		: [requiredPermissions];

	if (requireAll) {
		return permissions.every((permission) =>
			userPermissions.includes(permission),
		);
	} else {
		return permissions.some((permission) =>
			userPermissions.includes(permission),
		);
	}
}
