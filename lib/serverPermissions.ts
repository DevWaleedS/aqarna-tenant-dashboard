/**
 * Server-side permission checking utilities for middleware and server components
 */

// replaced next-auth Session with generic type
import { hasPermission } from "./permissionUtils";

/**
 * Check if user session has required permission(s)
 * @param session - NextAuth session object
 * @param requiredPermissions - Required permission(s)
 * @param requireAll - If true, user needs ALL permissions. Default: true
 * @returns boolean indicating if user has the required permission(s)
 */
export function sessionHasPermission(
	// session-like object containing user.permissions property
	session: { user?: { permissions?: string[] } } | null,
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
export function getSessionPermissions(
	session: { user?: { permissions?: string[] } } | null,
): string[] {
	return session?.user?.permissions || [];
}

/**
 * Check if session has role (if roles are available)
 */
export function sessionHasRole(
	// session-like object containing user.roles
	session: { user?: { roles?: string[] } } | null,
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
