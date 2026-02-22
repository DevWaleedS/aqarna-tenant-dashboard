/**
 * Server-side permission checking utilities for middleware and server components
 */

import { Session } from "next-auth";
import { hasPermission } from "./permissionUtils";

/**
 * Check if user session has required permission(s)
 * @param session - NextAuth session object
 * @param requiredPermissions - Required permission(s)
 * @param requireAll - If true, user needs ALL permissions. Default: true
 * @returns boolean indicating if user has the required permission(s)
 */
export function sessionHasPermission(
	session: Session | null,
	requiredPermissions: string | string[],
	requireAll: boolean = true,
): boolean {
	if (!session?.user?.permissions) {
		return false;
	}

	return hasPermission(
		session.user.permissions,
		requiredPermissions,
		requireAll,
	);
}

/**
 * Get all permissions from session
 */
export function getSessionPermissions(session: Session | null): string[] {
	return session?.user?.permissions || [];
}

/**
 * Check if session has role (if roles are available)
 */
export function sessionHasRole(
	session: Session | null,
	requiredRoles: string | string[],
	requireAll: boolean = true,
): boolean {
	if (!session?.user?.roles) {
		return false;
	}

	const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
	const userRoles = session.user.roles;

	if (requireAll) {
		return roles.every((role) => userRoles.includes(role));
	} else {
		return roles.some((role) => userRoles.includes(role));
	}
}
