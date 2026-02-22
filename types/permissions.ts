/**
 * Type definitions for the permission system
 *
 * These types are already defined in sidebar-data.ts, but this file
 * provides them in a central location for broader use
 */

/**
 * Represents a permission string
 * Examples: "users.read", "users.update", "roles.delete"
 */
export type Permission = string;

/**
 * Represents a collection of user permissions
 */
export type Permissions = Permission[];

/**
 * Permission requirement configuration
 * Can be a single permission or array of permissions
 */
export type PermissionRequirement = Permission | Permissions;

/**
 * Navigation item for sidebar/menu
 */
export interface NavItem {
	title: string;
	url: string;
	icon?: any;
	isActive?: boolean;
	label?: string;

	/**
	 * Permission(s) required to see this menu item
	 * - String: User must have this permission
	 * - String[]: User must have all permissions (if requireAllPermissions=true)
	 *            or at least one (if requireAllPermissions=false)
	 */
	requiredPermissions?: PermissionRequirement;

	/**
	 * If true (default): User needs ALL required permissions
	 * If false: User needs AT LEAST ONE required permission
	 */
	requireAllPermissions?: boolean;

	/**
	 * Nested menu items (sub-menu)
	 */
	items?: NavSubItem[];
}

/**
 * Navigation sub-item (nested menu item)
 */
export interface NavSubItem {
	title: string;
	url: string;
	circleColor: string;

	/**
	 * Permission(s) required to see this sub-item
	 */
	requiredPermissions?: PermissionRequirement;

	/**
	 * If true (default): User needs ALL required permissions
	 * If false: User needs AT LEAST ONE required permission
	 */
	requireAllPermissions?: boolean;
}

/**
 * Props for ProtectedPage component
 */
export interface ProtectedPageProps {
	/**
	 * Required permission(s) to access this page
	 */
	requiredPermissions: PermissionRequirement;

	/**
	 * If true (default): User needs ALL required permissions
	 * If false: User needs AT LEAST ONE required permission
	 */
	requireAll?: boolean;

	/**
	 * Content to render if user has permission
	 */
	children: React.ReactNode;

	/**
	 * Content to render if user lacks permission
	 * If not provided, shows default "Access Denied" message
	 */
	fallback?: React.ReactNode;
}

/**
 * Props for Can component
 */
export interface CanProps {
	/**
	 * Required permission(s) to render children
	 */
	do: PermissionRequirement;

	/**
	 * If true (default): User needs ALL required permissions
	 * If false: User needs AT LEAST ONE required permission
	 */
	requireAll?: boolean;

	/**
	 * Content to render if user has permission
	 */
	children: React.ReactNode;

	/**
	 * Content to render if user lacks permission
	 * If not provided, renders nothing
	 */
	fallback?: React.ReactNode;
}

/**
 * Extended Session type with permissions
 * Used with NextAuth.js
 */
export interface SessionWithPermissions {
	user?: {
		id?: string;
		email?: string;
		name?: string;
		image?: string;
		avatar?: string;
		/**
		 * Array of user roles
		 */
		roles?: string[];
		/**
		 * Array of user permissions
		 */
		permissions?: Permission[];
	};
	accessToken?: string;
	refreshToken?: string;
	rememberMe?: boolean;
	expires?: string;
}

/**
 * Common permission sets for quick reference
 */
export const PERMISSION_SETS = {
	// Statistics/Dashboard
	DASHBOARD: "statistics.read",
	SYSTEM_READ: "system.read",

	// User Management
	USERS_CREATE: "users.create",
	USERS_READ: "users.read",
	USERS_UPDATE: "users.update",
	USERS_DELETE: "users.delete",
	USERS_ALL: ["users.create", "users.read", "users.update", "users.delete"],

	// Packages
	PACKAGES_CREATE: "packages.create",
	PACKAGES_READ: "packages.read",
	PACKAGES_UPDATE: "packages.update",
	PACKAGES_DELETE: "packages.delete",
	PACKAGES_ALL: [
		"packages.create",
		"packages.read",
		"packages.update",
		"packages.delete",
	],

	// Transactions
	TRANSACTIONS_CREATE: "transactions.create",
	TRANSACTIONS_READ: "transactions.read",
	TRANSACTIONS_UPDATE: "transactions.update",
	TRANSACTIONS_CONFIRM: "transactions.confirm",
	TRANSACTIONS_ALL: [
		"transactions.create",
		"transactions.read",
		"transactions.update",
		"transactions.confirm",
	],

	// Tenants
	TENANTS_CREATE: "tenants.create",
	TENANTS_READ: "tenants.read",
	TENANTS_UPDATE: "tenants.update",
	TENANTS_DELETE: "tenants.delete",
	TENANTS_ALL: [
		"tenants.create",
		"tenants.read",
		"tenants.update",
		"tenants.delete",
	],

	// Tenant Applications
	TENANT_APPS_READ: "tenant_applications.read",
	TENANT_APPS_UPDATE: "tenant_applications.update",
	TENANT_APPS_DELETE: "tenant_applications.delete",
	TENANT_APPS_APPROVE: "tenant_applications.approve",
	TENANT_APPS_REJECT: "tenant_applications.reject",
	TENANT_APPS_ALL: [
		"tenant_applications.read",
		"tenant_applications.update",
		"tenant_applications.delete",
		"tenant_applications.approve",
		"tenant_applications.reject",
	],

	// Notifications
	NOTIFICATIONS_CREATE: "notifications.create",
	NOTIFICATIONS_READ: "notifications.read",
	NOTIFICATIONS_UPDATE: "notifications.update",
	NOTIFICATIONS_DELETE: "notifications.delete",
	NOTIFICATIONS_ALL: [
		"notifications.create",
		"notifications.read",
		"notifications.update",
		"notifications.delete",
	],

	// Roles
	ROLES_CREATE: "roles.create",
	ROLES_READ: "roles.read",
	ROLES_UPDATE: "roles.update",
	ROLES_DELETE: "roles.delete",
	ROLES_ALL: ["roles.create", "roles.read", "roles.update", "roles.delete"],

	// Permissions
	PERMISSIONS_CREATE: "permissions.create",
	PERMISSIONS_READ: "permissions.read",
	PERMISSIONS_UPDATE: "permissions.update",
	PERMISSIONS_DELETE: "permissions.delete",
	PERMISSIONS_ALL: [
		"permissions.create",
		"permissions.read",
		"permissions.update",
		"permissions.delete",
	],

	// Settings
	SETTINGS_READ: "settings.read",
	SETTINGS_UPDATE: "settings.update",
	SETTINGS_ALL: ["settings.read", "settings.update"],
} as const;

/**
 * Type-safe permission constant
 */
export type PermissionConstant = typeof PERMISSION_SETS;
