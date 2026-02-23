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

// Get all packages
export const getPackagesAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/packages`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getPackagesAPI", null);
	}
};

// Get single package
export const getPackageAPI = async (packageId) => {
	try {
		const { data } = await AxiosAuth.get(`/packages/${packageId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getPackageAPI", null);
	}
};

// Create package
export const createPackageAPI = async (packageData) => {
	try {
		const { data } = await AxiosAuth.post(`/packages`, packageData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createPackageAPI", null);
	}
};

// Update package
export const updatePackageAPI = async (packageId, packageData) => {
	try {
		const { data } = await AxiosAuth.put(`/packages/${packageId}`, packageData);
		return data;
	} catch (error) {
		return handleRequestError(error, "updatePackageAPI", null);
	}
};

// Delete package
export const deletePackageAPI = async (packageId) => {
	try {
		const { data } = await AxiosAuth.delete(`/packages/${packageId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deletePackageAPI", null);
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
// ==================== Tenant Applications ===================================

// Get all tenant applications
export const getTenantApplicationsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/tenant-applications`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getTenantApplicationsAPI", null);
	}
};

// Get single tenant application
export const getTenantApplicationAPI = async (applicationId) => {
	try {
		const { data } = await AxiosAuth.get(
			`/tenant-applications/${applicationId}`,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "getTenantApplicationAPI", null);
	}
};

// Create tenant application
export const createTenantApplicationAPI = async (applicationData) => {
	try {
		const { data } = await AxiosAuth.post(
			`/tenant-applications`,
			applicationData,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "createTenantApplicationAPI", null);
	}
};

// Approve tenant application
export const approveTenantApplicationAPI = async (applicationId) => {
	try {
		const { data } = await AxiosAuth.post(
			`/tenant-applications/${applicationId}/approve`,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "approveTenantApplicationAPI", null);
	}
};

// Reject tenant application
export const rejectTenantApplicationAPI = async (applicationId) => {
	try {
		const { data } = await AxiosAuth.post(
			`/tenant-applications/${applicationId}/reject`,
		);
		return data;
	} catch (error) {
		return handleRequestError(error, "rejectTenantApplicationAPI", null);
	}
};
// ==================== Tenants ===================================

// Get all tenants
export const getTenantsAPI = async () => {
	try {
		const { data } = await AxiosAuth.get(`/tenants`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getTenantsAPI", null);
	}
};

// Get single tenant
export const getTenantAPI = async (tenantId) => {
	try {
		const { data } = await AxiosAuth.get(`/tenants/${tenantId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getTenantAPI", null);
	}
};

// Create tenant
export const createTenantAPI = async (tenantData) => {
	try {
		const { data } = await AxiosAuth.post(`/tenants`, tenantData);
		return data;
	} catch (error) {
		return handleRequestError(error, "createTenantAPI", null);
	}
};

// Update tenant
export const updateTenantAPI = async (tenantId, tenantData) => {
	try {
		const { data } = await AxiosAuth.put(`/tenants/${tenantId}`, tenantData);
		return data;
	} catch (error) {
		return handleRequestError(error, "updateTenantAPI", null);
	}
};

// Delete tenant
export const deleteTenantAPI = async (tenantId) => {
	try {
		const { data } = await AxiosAuth.delete(`/tenants/${tenantId}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "deleteTenantAPI", null);
	}
};

// ==================== Payment ===================================

// Submit payment
export const submitPaymentAPI = async (token, paymentData) => {
	try {
		const formData = new FormData();

		// Append payment method (required)
		formData.append("payment_method", paymentData.payment_method);

		// Append cheque fields if payment method is cheque
		if (paymentData.payment_method === "cheque") {
			if (paymentData.cheque_number) {
				formData.append("cheque_number", paymentData.cheque_number);
			}
			if (paymentData.cheque_image) {
				formData.append("cheque_image", paymentData.cheque_image);
			}
		}

		// Append bank transfer fields if payment method is bank_transfer
		if (paymentData.payment_method === "bank_transfer") {
			if (paymentData.transfer_reference) {
				formData.append("transfer_reference", paymentData.transfer_reference);
			}
			if (paymentData.transfer_receipt) {
				formData.append("transfer_receipt", paymentData.transfer_receipt);
			}
		}

		const { data } = await AxiosAuth.post(`/payment/${token}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data;
	} catch (error) {
		return handleRequestError(error, "submitPaymentAPI", null);
	}
};

// get the payment information
export const getPaymentAPI = async (token) => {
	try {
		const { data } = await AxiosAuth.get(`/payment/${token}`);
		return data;
	} catch (error) {
		return handleRequestError(error, "getPaymentAPI", null);
	}
};

//  ==================== Start the Tenant endpoints ===================================

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
