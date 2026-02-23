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

// sign out API
export const LogoutAPI = async () => {
	try {
		const response = await AxiosAuth.post("/auth/logout");
		return response.data;
	} catch (error) {
		return handleRequestError(error, "Logout", null);
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

// Get user current info
export const getCurrentUserAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/auth/me`);

		return data;
	} catch (error) {
		return handleRequestError(error, "getCurrentUserAPI", null);
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

// ==================== Transactions ===================================

// Get all transactions
export const getTransactionsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/transactions`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getTransactionsAPI", null);
	}
};

// Get single transaction
export const getTransactionAPI = async (transactionId) => {
	try {
		const { data } = await AxiosAuth.get(`/transactions/${transactionId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getTransactionAPI", null);
	}
};

// Confirm transaction
export const confirmTransactionAPI = async (transactionId) => {
	try {
		const { data } = await AxiosAuth.post(
			`/transactions/${transactionId}/confirm`,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "confirmTransactionAPI", null);
	}
};

// ==================== Users ===================================

// Get all users
export const getUsersAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/users`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getUsersAPI", null);
	}
};

// Get single user
export const getUserAPI = async (userId) => {
	try {
		const { data } = await AxiosAuth.get(`/users/${userId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getUserAPI", null);
	}
};

// Create user
export const createUserAPI = async (userData) => {
	try {
		const formData = new FormData();

		// Append basic fields
		formData.append("name", userData.name);
		formData.append("email", userData.email);
		formData.append("password", userData.password);
		formData.append("password_confirmation", userData.password_confirmation);

		// Append roles array
		if (userData.roles && userData.roles.length > 0) {
			userData.roles.forEach((role, index) => {
				formData.append(`roles[${index}]`, role);
			});
		}

		// Append avatar if exists
		if (userData.avatar) {
			formData.append("avatar", userData.avatar);
		}

		const { data } = await AxiosAuth.post(`/users`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "createUserAPI", null);
	}
};
// Update user
export const updateUserAPI = async (userId, userData) => {
	try {
		const formData = new FormData();

		// Append _method parameter for Laravel method spoofing
		formData.append("_method", "PUT");

		// Append basic fields
		if (userData.name) formData.append("name", userData.name);
		if (userData.email) formData.append("email", userData.email);

		// Append roles array
		if (userData.roles && userData.roles.length > 0) {
			userData.roles.forEach((role, index) => {
				formData.append(`roles[${index}]`, role);
			});
		}

		// Append avatar if exists
		if (userData.avatar) {
			formData.append("avatar", userData.avatar);
		}

		const { data } = await AxiosAuth.post(`/users/${userId}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "updateUserAPI", null);
	}
};

// Delete user
export const deleteUserAPI = async (userId) => {
	try {
		const { data } = await AxiosAuth.delete(`/users/${userId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deleteUserAPI", null);
	}
};

// Update user password
export const updateUserPasswordAPI = async (passwordData) => {
	try {
		const { data } = await AxiosAuth.post(
			`/user/update-password`,
			passwordData,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateUserPasswordAPI", null);
	}
};

// Update user avatar
export const updateUserAvatarAPI = async (avatarFile) => {
	try {
		const formData = new FormData();
		formData.append("avatar", avatarFile);

		const { data } = await AxiosAuth.post(`/user/update-avatar`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "updateUserAvatarAPI", null);
	}
};

// ==================== Roles ===================================

// Get all roles
export const getRolesAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/roles`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getRolesAPI", null);
	}
};

// Get single role
export const getRoleAPI = async (roleId) => {
	try {
		const { data } = await AxiosAuth.get(`/roles/${roleId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getRoleAPI", null);
	}
};

// Create role
export const createRoleAPI = async (roleData) => {
	try {
		const { data } = await AxiosAuth.post(`/roles`, roleData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createRoleAPI", null);
	}
};

// Update role
export const updateRoleAPI = async (roleId, roleData) => {
	try {
		const { data } = await AxiosAuth.put(`/roles/${roleId}`, roleData);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateRoleAPI", null);
	}
};

// Delete role
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

// Update role permissions
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
		const { data } = await AxiosAuth.post(`/customers`, customerData);
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
