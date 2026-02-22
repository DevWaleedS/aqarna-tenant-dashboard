/**
 * Utility functions for permission checking
 * Used for both client-side and server-side permission validation
 */

import {
	NavItem,
	NavSubItem,
} from "@/components/(central)/app-sidebar/sidebar-data";

/**
 * Check if user has the required permission(s)
 * @param userPermissions - User's permission array
 * @param requiredPermissions - Required permission(s) - can be a single string or array
 * @param requireAll - If true, user must have ALL permissions. If false, user must have AT LEAST ONE
 * @returns boolean indicating if user has the required permission(s)
 */
export function hasPermission(
	userPermissions: string[] | undefined,
	requiredPermissions: string | string[] | undefined,
	requireAll: boolean = true,
): boolean {
	// If no permissions required, allow access
	if (!requiredPermissions) {
		return true;
	}

	// If user has no permissions and something is required, deny access
	if (!userPermissions || userPermissions.length === 0) {
		return false;
	}

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
 * Filter menu items based on user permissions
 * Recursively filters both main items and sub-items
 * @param items - Array of navigation items
 * @param userPermissions - User's permission array
 * @returns Filtered array of navigation items
 */
export function filterMenuItemsByPermissions(
	items: NavItem[],
	userPermissions: string[],
): NavItem[] {
	return items
		.map((item) => {
			// Check if user has permission to see this item
			const hasAccess = hasPermission(
				userPermissions,
				item.requiredPermissions,
				item.requireAllPermissions !== false, // defaults to true
			);

			if (!hasAccess) {
				return null;
			}

			// If item has subitems, filter them as well
			if (item.items && item.items.length > 0) {
				const filteredSubItems = item.items.filter((subItem) => {
					return hasPermission(
						userPermissions,
						subItem.requiredPermissions,
						subItem.requireAllPermissions !== false, // defaults to true
					);
				});

				// If all subitems were filtered out, hide the parent item too
				if (filteredSubItems.length === 0) {
					return null;
				}

				return {
					...item,
					items: filteredSubItems,
				};
			}

			return item;
		})
		.filter((item): item is NavItem => item !== null);
}

/**
 * Get list of required permissions from a route/page
 * Can be used for middleware or page-level protection
 */
export function getRequiredPermissionsForRoute(
	route: string,
	items: NavItem[],
): string | string[] | undefined {
	// Normalize route
	const normalizedRoute = route.startsWith("/") ? route : `/${route}`;

	// Search through items recursively
	const search = (navItems: NavItem[]): string | string[] | undefined => {
		for (const item of navItems) {
			if (item.url === normalizedRoute) {
				return item.requiredPermissions;
			}

			if (item.items) {
				for (const subItem of item.items) {
					if (subItem.url === normalizedRoute) {
						return subItem.requiredPermissions;
					}
				}
			}
		}
		return undefined;
	};

	return search(items);
}
