import { AxiosAPI, AxiosAuth } from "@/lib/axiosInstance";

// Improved error handling
function handleRequestError(error, resourceName, id) {
	if (error.response && error.response.status === 404) {
		return null;
	}

	if (error.response && error.response.status === 405) {
		return {
			error: true,
			type: "METHOD_NOT_ALLOWED",
			message: error.response?.data?.message,
			supportedMethods:
				error.response?.data?.message
					?.match(/Supported methods: (.+)\./)?.[1]
					?.split(", ") || [],
		};
	}

	throw error;
}

// ==================== Auth ===================================

// ==================== Auth Endpoints =======================
// Paste these into your main /apis/endpoints.js file.
// These replace the NextAuth credential callbacks.

// Login — returns { token, ... }
export const loginAPI = async (payload) => {
	try {
		const { data } = await AxiosAPI.post("/auth/login", payload);
		return data;
	} catch (error) {
		return handleRequestError(error, "loginAPI", null);
	}
};

// Fetch current authenticated user — requires Bearer token
export const getCurrentUserAPI = async () => {
	try {
		const { data } = await AxiosAuth.get("/auth/me");
		return data;
	} catch (error) {
		return handleRequestError(error, "getCurrentUserAPI", null);
	}
};

// Logout — invalidates token on the server
export const logoutAPI = async () => {
	try {
		const { data } = await AxiosAuth.post("/auth/logout");
		return data;
	} catch (error) {
		return handleRequestError(error, "logoutAPI", null);
	}
};
// recover account API
export const recoverAccountAPI = async (email) => {
	try {
		const response = await AxiosAPI.post(`/auth/forgot-password`, email);
		return response.data;
	} catch (error) {
		throw error;
	}
};

// reset password API
export const resetPasswordAPI = async (data) => {
	try {
		const response = await AxiosAPI.post(`/auth/reset-password`, data);
		return response.data;
	} catch (error) {
		return handleRequestError(error, "Rest password api", null);
	}
};

// ==================== Email Verification Endpoints =======================

// Resend verification code to user's email
export const resendVerificationEmailAPI = async (payload) => {
	try {
		const { data } = await AxiosAuth.post(`/email/resend`, payload);
		return data;
	} catch (error) {
		return handleRequestError(error, "resendVerificationEmailAPI", null);
	}
};

// Verify email with the 6-digit code
export const verifyEmailAPI = async (payload) => {
	try {
		const { data } = await AxiosAuth.post(`/email/verify`, payload);
		return data;
	} catch (error) {
		return handleRequestError(error, "verifyEmailAPI", null);
	}
};

// Get dashboard overview
export const getDashboardOverviewAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/dashboard/overview`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getDashboardOverviewAPI", null);
	}
};

// ==================== Settings ===================================
// Get all settings
export const getSettingsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/settings`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getSettingsAPI", null);
	}
};

// Update a specific setting
export const updateSettingAPI = async (settingKey, value) => {
	try {
		// Detect file / FormData values and submit as multipart/form-data
		const isBrowserFile = (v) =>
			(typeof File !== "undefined" && v instanceof File) ||
			(v && v.constructor && v.constructor.name === "File");
		const isBlob = (v) =>
			(typeof Blob !== "undefined" && v instanceof Blob) ||
			(v && v.constructor && v.constructor.name === "Blob");
		const isFormData = (v) =>
			typeof FormData !== "undefined" && v instanceof FormData;

		if (
			isFormData(value) ||
			isBrowserFile(value) ||
			isBlob(value) ||
			(Array.isArray(value) &&
				value.some((item) => isBrowserFile(item) || isBlob(item)))
		) {
			const formData = isFormData(value) ? value : new FormData();

			if (!isFormData(value)) {
				// If an array of files, append each using 'value[]', otherwise append single file
				if (Array.isArray(value)) {
					value.forEach((file) => formData.append("value[]", file));
				} else {
					formData.append("value", value);
				}
			}

			const { data } = await AxiosAuth.post(
				`/settings/${settingKey}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);
			return data;
		}

		const { data } = await AxiosAuth.post(`/settings/${settingKey}`, {
			value,
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "updateSettingAPI", settingKey);
	}
};

// set Languages API
export const setLanguagesAPI = async (locale) => {
	try {
		const { data } = await AxiosAuth.post(`/lang/${locale}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "setLanguagesAPI", null);
	}
};

// Get all notifications
export const getNotificationsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/notifications`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getNotificationsAPI", null);
	}
};

// Mark all notifications as read
export const markAllNotificationsAsReadAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/notifications/mark-all-as-read`);
		return data;
	} catch (error) {
		return handleRequestError(error, "markAllNotificationsAsReadAPI", null);
	}
};

// Mark single notification as read
export const markNotificationAsReadAPI = async (notificationId) => {
	try {
		const { data } = await AxiosAuth.post(
			`/notifications/${notificationId}/mark-as-read`,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "markNotificationAsReadAPI", null);
	}
};

// Delete notification
export const deleteNotificationAPI = async (notificationId) => {
	try {
		const { data } = await AxiosAuth.delete(`/notifications/${notificationId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deleteNotificationAPI", null);
	}
};

// ==================== Roles Endpoints =======================

// 1.1 — Get all roles
export const getRolesAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/roles`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getRolesAPI", null);
	}
};

// 1.2 — Create new role  { name, permissions[] }
export const createRoleAPI = async (roleData) => {
	try {
		const { data } = await AxiosAuth.post(`/roles`, roleData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createRoleAPI", null);
	}
};

// 1.3 — Get single role details
export const getRoleAPI = async (roleId) => {
	try {
		const { data } = await AxiosAuth.get(`/roles/${roleId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getRoleAPI", null);
	}
};

// 1.4 — Update role  { name, permissions[] }
export const updateRoleAPI = async (roleId, roleData) => {
	try {
		const { data } = await AxiosAuth.put(`/roles/${roleId}`, roleData);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateRoleAPI", null);
	}
};

// 1.5 — Delete role
export const deleteRoleAPI = async (roleId) => {
	try {
		const { data } = await AxiosAuth.delete(`/roles/${roleId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deleteRoleAPI", null);
	}
};

// ==================== Permissions ===================================

// Get all permissions
export const getPermissionsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/permissions`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getPermissionsAPI", null);
	}
};

//  Update role permissions only
export const updateRolePermissionsAPI = async (roleId, permissionsData) => {
	try {
		const { data } = await AxiosAuth.put(
			`/roles/${roleId}/permissions`,
			permissionsData,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateRolePermissionsAPI", null);
	}
};

//  ==================== Contracts ===================================

// Get all contracts
export const getContractsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/contracts`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getContractsAPI", null);
	}
};

// Get single contract
export const getContractAPI = async (contractId) => {
	try {
		const { data } = await AxiosAuth.get(`/contracts/${contractId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getContractAPI", null);
	}
};

// Create contract
export const createContractAPI = async (contractData) => {
	try {
		const { data } = await AxiosAuth.post(`/contracts`, contractData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createContractAPI", null);
	}
};

// Update contract
export const updateContractAPI = async (contractId, contractData) => {
	try {
		const { data } = await AxiosAuth.put(
			`/contracts/${contractId}`,
			contractData,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateContractAPI", null);
	}
};

// Terminate contract
export const terminateContractAPI = async (contractId, terminationData) => {
	try {
		const { data } = await AxiosAuth.post(
			`/contracts/${contractId}/terminate`,
			terminationData ?? {},
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "terminateContractAPI", null);
	}
};

// ==================== Customers ===================================

// Get all customers
export const getCustomersAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/customers`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getCustomersAPI", null);
	}
};

// Get customers lookup list (id + name only — for dropdowns)
export const getCustomersLookupAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/customers/lookup`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getCustomersLookupAPI", null);
	}
};

// Get single customer
export const getCustomerAPI = async (customerId) => {
	try {
		const { data } = await AxiosAuth.get(`/customers/${customerId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getCustomerAPI", null);
	}
};

// Create customer
export const createCustomerAPI = async (customerData) => {
	try {
		const { data } = await AxiosAuth.post(`/customers`, customerData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "createCustomerAPI", null);
	}
};

// Update customer
export const updateCustomerAPI = async (customerId, customerData) => {
	try {
		const { data } = await AxiosAuth.put(
			`/customers/${customerId}`,
			customerData,
			{
				headers: { "Content-Type": "multipart/form-data" },
			},
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateCustomerAPI", null);
	}
};

// Delete customer
export const deleteCustomerAPI = async (customerId) => {
	try {
		const { data } = await AxiosAuth.delete(`/customers/${customerId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deleteCustomerAPI", null);
	}
};

// Blacklist customer
export const blacklistCustomerAPI = async (customerId) => {
	try {
		const { data } = await AxiosAuth.post(`/customers/${customerId}/blacklist`);
		return data;
	} catch (error) {
		return handleRequestError(error, "blacklistCustomerAPI", null);
	}
};

// Activate customer
export const activateCustomerAPI = async (customerId) => {
	try {
		const { data } = await AxiosAuth.post(`/customers/${customerId}/active`);
		return data;
	} catch (error) {
		return handleRequestError(error, "activateCustomerAPI", null);
	}
};

// ==================== Maintenance Tickets ===================================

// Get all maintenance tickets
export const getMaintenanceTicketsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/maintenance-tickets`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getMaintenanceTicketsAPI", null);
	}
};

// Get single maintenance ticket
export const getMaintenanceTicketAPI = async (ticketId) => {
	try {
		const { data } = await AxiosAuth.get(`/maintenance-tickets/${ticketId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getMaintenanceTicketAPI", null);
	}
};

// Update maintenance ticket (status, priority, admin_notes, scheduled_at)
export const updateMaintenanceTicketAPI = async (ticketId, ticketData) => {
	try {
		const { data } = await AxiosAuth.put(
			`/maintenance-tickets/${ticketId}`,
			ticketData,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateMaintenanceTicketAPI", null);
	}
};

// ==================== Meters ===================================

// Get all meters
export const getMetersAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/meters`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getMetersAPI", null);
	}
};

// Get single meter
export const getMeterAPI = async (meterId) => {
	try {
		const { data } = await AxiosAuth.get(`/meters/${meterId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getMeterAPI", null);
	}
};

// Create meter
export const createMeterAPI = async (meterData) => {
	try {
		const { data } = await AxiosAuth.post(`/meters`, meterData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createMeterAPI", null);
	}
};

// Update meter
export const updateMeterAPI = async (meterId, meterData) => {
	try {
		const { data } = await AxiosAuth.put(`/meters/${meterId}`, meterData);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateMeterAPI", null);
	}
};

// Delete meter
export const deleteMeterAPI = async (meterId) => {
	try {
		const { data } = await AxiosAuth.delete(`/meters/${meterId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deleteMeterAPI", null);
	}
};

// ==================== Meter Readings ===================================

// Get all meter readings
export const getMeterReadingsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/meter-readings`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getMeterReadingsAPI", null);
	}
};

// Get single meter reading
export const getMeterReadingAPI = async (id) => {
	try {
		const { data } = await AxiosAuth.get(`/meter-readings/${id}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getMeterReadingAPI", null);
	}
};

// Create meter reading
export const createMeterReadingAPI = async (readingData) => {
	try {
		const { data } = await AxiosAuth.post(`/meter-readings`, readingData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createMeterReadingAPI", null);
	}
};

// Generate invoice for a meter reading
export const createMeterReadingInvoiceAPI = async (id) => {
	try {
		const { data } = await AxiosAuth.post(`/meter-readings/${id}/invoice`);
		return data;
	} catch (error) {
		return handleRequestError(error, "createMeterReadingInvoiceAPI", null);
	}
};

// ==================== Units Endpoints =======================

// 1.1 — Get all units (customer-facing list)
export const getUnitsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/units`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getUnitsAPI", null);
	}
};

// 1.2 — Create a new unit
export const createUnitAPI = async (unitData) => {
	try {
		const { data } = await AxiosAuth.post(`/units`, unitData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createUnitAPI", null);
	}
};

// 1.3 — Get single unit details
export const getUnitAPI = async (unitId) => {
	try {
		const { data } = await AxiosAuth.get(`/units/${unitId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getUnitAPI", null);
	}
};

// 1.4 — Update a unit
export const updateUnitAPI = async (unitId, unitData) => {
	try {
		const { data } = await AxiosAuth.put(`/units/${unitId}`, unitData);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateUnitAPI", null);
	}
};

// 1.5 — Delete a unit
export const deleteUnitAPI = async (unitId) => {
	try {
		const { data } = await AxiosAuth.delete(`/units/${unitId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deleteUnitAPI", null);
	}
};

// 1.6 — Lookup (lightweight list for Select dropdowns)
export const getUnitsLookupAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/units/lookup`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getUnitsLookupAPI", null);
	}
};

// ==================== Properties Endpoints ==================

// 1 — Get all properties
export const getPropertiesAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/properties`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getPropertiesAPI", null);
	}
};

// 2 — Get single property details
export const getPropertyAPI = async (propertyId) => {
	try {
		const { data } = await AxiosAuth.get(`/properties/${propertyId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getPropertyAPI", null);
	}
};

// 3 — Create a new property
export const createPropertyAPI = async (propertyData) => {
	try {
		const { data } = await AxiosAuth.post(`/properties`, propertyData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createPropertyAPI", null);
	}
};

// 4 — Update a property
export const updatePropertyAPI = async (propertyId, propertyData) => {
	try {
		const { data } = await AxiosAuth.put(
			`/properties/${propertyId}`,
			propertyData,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "updatePropertyAPI", null);
	}
};

// 5 — Delete a property
export const deletePropertyAPI = async (propertyId) => {
	try {
		const { data } = await AxiosAuth.delete(`/properties/${propertyId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deletePropertyAPI", null);
	}
};

// 6 — Lookup (lightweight id + name list for Select dropdowns)
export const getPropertiesLookupAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/properties/lookup`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getPropertiesLookupAPI", null);
	}
};

// ==================== Subscriptions Endpoints ===============
// 1.1 — Get subscription info (current subscription + package details)
export const getSubscriptionInfoAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/subscriptions/info`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getSubscriptionInfoAPI", null);
	}
};

// 1.2 — Renew current subscription — requires { package_id }
export const renewSubscriptionAPI = async (renewData) => {
	try {
		const { data } = await AxiosAuth.post(`/subscriptions/renew`, renewData);
		return data;
	} catch (error) {
		return handleRequestError(error, "renewSubscriptionAPI", null);
	}
};

// 1.3 — Upgrade to a different package / billing cycle
export const upgradeSubscriptionAPI = async (upgradeData) => {
	try {
		const { data } = await AxiosAuth.post(
			`/subscriptions/upgrade`,
			upgradeData,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "upgradeSubscriptionAPI", null);
	}
};

// 1.4 — Packages lookup (lightweight id + name list for Select dropdowns)
export const getPackagesLookupAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/packages/lookup`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getPackagesLookupAPI", null);
	}
};
// ==================== Users Endpoints =======================
// Paste these into your main /apis/endpoints.js file

// 1.1 — Get all users
export const getUsersAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/users`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getUsersAPI", null);
	}
};

// 1.2 — Get single user details
export const getUserAPI = async (userId) => {
	try {
		const { data } = await AxiosAuth.get(`/users/${userId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getUserAPI", null);
	}
};

// 1.3 — Create new user (multipart/form-data — supports avatar upload)
export const createUserAPI = async (userData) => {
	try {
		const { data } = await AxiosAuth.post(`/users`, userData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "createUserAPI", null);
	}
};

// 1.4 — Update user (multipart/form-data)
export const updateUserAPI = async (userId, userData) => {
	try {
		const { data } = await AxiosAuth.put(`/users/${userId}`, userData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "updateUserAPI", null);
	}
};

// 1.5 — Delete user
export const deleteUserAPI = async (userId) => {
	try {
		const { data } = await AxiosAuth.delete(`/users/${userId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deleteUserAPI", null);
	}
};

// 1.6 — Update password
export const updateUserPasswordAPI = async (passwordData) => {
	try {
		const { data } = await AxiosAuth.post(
			`/users/update-password`,
			passwordData,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateUserPasswordAPI", null);
	}
};

// 1.7 — Update avatar
export const updateUserAvatarAPI = async (avatarData) => {
	try {
		const { data } = await AxiosAuth.post(`/users/update-avatar`, avatarData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "updateUserAvatarAPI", null);
	}
};

// ==================== Transactions Endpoints =======================

// 1.1 — Get all transactions (supports pagination via params)
export const getTransactionsAPI = async (params = {}) => {
	try {
		const { data } = await AxiosAuth.get(`/transactions`, { params });
		return data;
	} catch (error) {
		return handleRequestError(error, "getTransactionsAPI", null);
	}
};

// 1.2 — Get single transaction details
export const getTransactionAPI = async (transactionId) => {
	try {
		const { data } = await AxiosAuth.get(`/transactions/${transactionId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getTransactionAPI", null);
	}
};

// 1.3 — Confirm a transaction payment  { notes }
export const confirmTransactionAPI = async (transactionId, payload) => {
	try {
		const { data } = await AxiosAuth.post(
			`/transactions/${transactionId}/confirm`,
			payload,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "confirmTransactionAPI", null);
	}
};
