import { z } from "zod";

const METER_TYPES = ["electricity", "water", "gas", "internet"] as const;
const METER_STATUSES = ["active", "inactive", "broken"] as const;

// Reusable File Schema
// More flexible version with configurable options
const createFileField = (options?: {
	maxSize?: number;
	mimeTypes?: string[];
	required?: boolean;
}) => {
	const maxSize = options?.maxSize ?? 2_000_000;
	const mimeTypes = options?.mimeTypes ?? ["image/png", "image/jpeg"];
	const mimeTypeLabels = mimeTypes
		.map((t) => t.split("/")[1].toUpperCase())
		.join(", ");

	let schema = z
		.instanceof(File, { message: "File is required" })
		.refine((file) => file.size <= maxSize, {
			message: `File size must be less than ${maxSize / 1_000_000}MB`,
		})
		.refine((file) => file.size > 0, {
			message: "File cannot be empty",
		})
		.refine((file) => mimeTypes.includes(file.type), {
			message: `File must be ${mimeTypeLabels} format`,
		});

	return options?.required === false ? schema.optional() : schema;
};

// Password Schema Base
const passwordField = z.string({ required_error: "Password is required" });
// .min(8, { message: "Password must be more than 8 characters" })
// .max(15, { message: "Password must be less than 15 characters" })
// .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
// .regex(/[0-9]/, { message: "Contain at least one number." })
// .regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special character." })
// .trim();

// Email schema base
const emailField = z
	.string()
	.min(1, "Email is required")
	.email("Invalid email!");

// Phone field helper
const phoneField = z.string().min(1, "Phone number is required");

// Login Schema
export const loginSchema = z.object({
	email: emailField,
	password: passwordField,
	remember_me: z.boolean().optional(),
});

// Register Schema
export const registerSchema = loginSchema.extend({
	username: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	acceptTerms: z.literal(true, {
		errorMap: () => ({ message: "You must accept the terms and conditions" }),
	}),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
	email: emailField,
});

// Create Password Schema
export const createPasswordSchema = z
	.object({
		password: passwordField,
		password_confirmation: z.string({
			required_error: "Confirm Password is required",
		}),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Password does not match",
		path: ["password_confirmation"],
	});

export const formSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: emailField,
	phone: phoneField,
	password: passwordField,
});

// add package form schema
export const addPackageFormSchema = z.object({
	name: z.string().min(1, "Package name is required"),
	description: z.string().min(1, "Package description is required"),
	max_properties: z.number().min(1, "Maximum properties is required"),
	max_units: z.number().min(1, "Maximum units is required"),
	monthly_price: z.number().min(0, "Monthly price is required"),
	yearly_price: z.number().min(0, "Yearly price is required"),
	features: z.array(z.string()).optional(),
});

// Confirm Transaction form schema
export const confirmTransactionSchema = z.object({
	tenant_application_id: z.string(),
	package_id: z.string(),
	payment_gateway: z.string(),
	payment_method: z.string(),
	price: z.string(),
	payment_token: z.string(),
	notes: z.string(),
});

export const addNewUserSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		email: emailField,
		password: passwordField,
		confirmed_password: z.string({
			required_error: "Please confirm your password",
		}),
		roles: z.array(z.string()).optional(),
		avatar: createFileField({
			maxSize: 2_000_000,
			required: false,
		}),
	})
	.refine((data) => data.password === data.confirmed_password, {
		message: "Passwords do not match",
		path: ["confirmed_password"],
	});

// Add this new schema for editing users (after addNewUserSchema)
export const editUserSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		email: emailField,
		password: z.string().optional(),
		confirmed_password: z.string().optional(),
		roles: z.array(z.string()).optional(),
		avatar: createFileField({
			maxSize: 2_000_000,
			required: false,
		}),
	})
	.refine(
		(data) => {
			// If password is provided, confirmed_password must also be provided and match
			if (data.password && data.password.length > 0) {
				return data.confirmed_password === data.password;
			}
			return true;
		},
		{
			message: "Passwords do not match",
			path: ["confirmed_password"],
		},
	)
	.refine(
		(data) => {
			// If password is provided, validate it meets requirements
			if (data.password && data.password.length > 0) {
				return (
					data.password.length >= 8 &&
					data.password.length <= 15 &&
					/[a-zA-Z]/.test(data.password) &&
					/[0-9]/.test(data.password) &&
					/[^a-zA-Z0-9]/.test(data.password)
				);
			}
			return true;
		},
		{
			message:
				"Password must be 8-15 characters and contain at least one letter, number, and special character",
			path: ["password"],
		},
	);

export const addNewRoleSchema = z.object({
	name: z.string().min(1, "Name is required"),
	permissions: z.array(z.string()).min(1, "permissions is required"),
});

export const addNewTenantSchema = z
	.object({
		// Application type
		type: z.enum(["business", "individual"], {
			required_error: "Application type is required",
		}),

		// Owner information
		owner: z.object({
			name: z.string().min(1, "Owner name is required"),
			email: emailField,
			phone: phoneField,
			dial_code: z.string().min(1, "Dial code is required"),
		}),

		// Tenant information
		tenant: z.object({
			name: z.string().min(1, "Tenant name is required"),
			subdomain: z
				.string()
				.min(1, "Subdomain is required")
				.regex(
					/^[a-z0-9-]+$/,
					"Subdomain can only contain lowercase letters, numbers, and hyphens",
				),
			cr_no: z.string().optional(),
			tin: z.string().optional(),
			address: z.string().optional(),
			phone: phoneField,
			dial_code: z.string().min(1, "Dial code is required"),
		}),

		// Subscription information
		subscription: z.object({
			package_id: z.string().min(1, "Package is required"),
			cycle: z.enum(["monthly", "yearly"], {
				required_error: "Billing cycle is required",
			}),
			period: z.string().optional(),
		}),

		// Optional message
		message: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const { cycle, period } = data.subscription;

		if (cycle === "monthly" && !period) {
			ctx.addIssue({
				path: ["subscription", "period"],
				message: "Period is required for monthly cycle",
				code: z.ZodIssueCode.custom,
			});
		}
	});

export const addNewTenantApplicationSchema = z
	.object({
		// Application type
		type: z.enum(["business", "individual"], {
			required_error: "Application type is required",
		}),

		// Owner information
		owner: z.object({
			name: z.string().min(1, "Owner name is required"),
			email: emailField,
			phone: phoneField,
			dial_code: z.string().min(1, "Dial code is required"),
		}),

		// Tenant information
		tenant: z.object({
			name: z.string().min(1, "Tenant name is required"),
			subdomain: z
				.string()
				.min(1, "Subdomain is required")
				.regex(
					/^[a-z0-9-]+$/,
					"Subdomain can only contain lowercase letters, numbers, and hyphens",
				),
			cr_no: z.string().optional(),
			tin: z.string().optional(),
			address: z.string().optional(),
			phone: phoneField,
			dial_code: z.string().min(1, "Dial code is required"),
		}),

		// Subscription information
		subscription: z.object({
			package_id: z.string().min(1, "Package is required"),
			cycle: z.enum(["monthly", "yearly"], {
				required_error: "Billing cycle is required",
			}),
			period: z.string().optional(),
		}),

		// Optional message
		message: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		const { cycle, period } = data.subscription;

		if (cycle === "monthly" && !period) {
			ctx.addIssue({
				path: ["subscription", "period"],
				message: "Period is required for monthly cycle",
				code: z.ZodIssueCode.custom,
			});
		}
	});

export const submitPaymentFormSchema = z
	.object({
		// Payment method (required)
		payment_method: z.enum(["cash", "cheque", "bank_transfer"], {
			required_error: "Payment method is required",
		}),

		// Cheque fields (conditional)
		cheque_number: z.string().optional(),
		cheque_image: z
			.instanceof(File)
			.refine((file) => file.size <= 2_000_000, {
				message: "File size must be less than 2MB",
			})
			.optional(),

		// Bank transfer fields (conditional)
		transfer_reference: z.string().optional(),
		transfer_receipt: z
			.instanceof(File)
			.refine((file) => file.size <= 2_000_000, {
				message: "File size must be less than 2MB",
			})
			.optional(),
	})
	.superRefine((data, ctx) => {
		// Validate cheque fields when payment method is cheque
		if (data.payment_method === "cheque") {
			if (!data.cheque_number || data.cheque_number.trim() === "") {
				ctx.addIssue({
					path: ["cheque_number"],
					message: "Cheque number is required for cheque payment",
					code: z.ZodIssueCode.custom,
				});
			}
			if (!data.cheque_image) {
				ctx.addIssue({
					path: ["cheque_image"],
					message: "Cheque image is required for cheque payment",
					code: z.ZodIssueCode.custom,
				});
			}
		}

		// Validate bank transfer fields when payment method is bank_transfer
		if (data.payment_method === "bank_transfer") {
			if (!data.transfer_reference || data.transfer_reference.trim() === "") {
				ctx.addIssue({
					path: ["transfer_reference"],
					message: "Transfer reference is required for bank transfer",
					code: z.ZodIssueCode.custom,
				});
			}
			if (!data.transfer_receipt) {
				ctx.addIssue({
					path: ["transfer_receipt"],
					message: "Transfer receipt is required for bank transfer",
					code: z.ZodIssueCode.custom,
				});
			}
		}
	});

// ==================== start the tenant work =====================================

// ==================== Contract Schema ====================

export const createContractSchema = z
	.object({
		customer_id: z
			.string({ required_error: "Customer is required" })
			.min(1, "Customer is required"),

		start_date: z
			.string({ required_error: "Start date is required" })
			.min(1, "Start date is required"),

		duration: z
			.number({ required_error: "Duration is required" })
			.min(1, "Duration must be at least 1"),

		duration_unit: z.enum(["month", "year"], {
			required_error: "Duration unit is required",
		}),

		grace_period_days: z.number().min(0).default(0).optional(),

		units: z
			.array(z.string(), { required_error: "At least one unit is required" })
			.min(1, "At least one unit is required"),

		security_deposit: z
			.number({ required_error: "Security deposit is required" })
			.min(0, "Security deposit must be 0 or greater"),

		billing_frequency: z.enum(
			["monthly", "quarterly", "semi_annual", "annual", "custom"],
			{ required_error: "Billing frequency is required" },
		),

		custom_billing_months: z.number().min(1).optional(),

		termination_penalty_type: z
			.enum(["fixed_amount", "months_rent"])
			.nullable()
			.optional(),

		termination_penalty_value: z.number().min(0).optional(),

		status: z
			.enum([
				"draft",
				"active",
				"expired",
				"terminated",
				"suspended",
				"pending",
			])
			.default("draft")
			.optional(),

		notes: z.string().nullable().optional(),
	})
	.superRefine((data, ctx) => {
		// custom_billing_months is required when billing_frequency is 'custom'
		if (
			data.billing_frequency === "custom" &&
			(data.custom_billing_months === undefined ||
				data.custom_billing_months === null)
		) {
			ctx.addIssue({
				path: ["custom_billing_months"],
				message:
					"Custom billing months is required for custom billing frequency",
				code: z.ZodIssueCode.custom,
			});
		}

		// termination_penalty_value is required if termination_penalty_type is set
		if (
			data.termination_penalty_type &&
			(data.termination_penalty_value === undefined ||
				data.termination_penalty_value === null)
		) {
			ctx.addIssue({
				path: ["termination_penalty_value"],
				message: "Penalty value is required when penalty type is set",
				code: z.ZodIssueCode.custom,
			});
		}
	});

// ── Sub-schemas ───────────────────────────────────────────────────────────────

export const emergencyContactSchema = z.object({
	name: z.string().min(1, "Emergency contact name is required"),
	phone: z.string().min(1, "Emergency contact phone is required"),
	relation: z.string().min(1, "Relation is required"),
});

export const vehicleSchema = z.object({
	make: z.string().min(1, "Make is required"),
	model: z.string().min(1, "Model is required"),
	model_year: z
		.number({ required_error: "Year is required" })
		.min(1900)
		.max(new Date().getFullYear() + 1),
	color: z.string().min(1, "Color is required"),
	plate_number: z.string().min(1, "Plate number is required"),
});

export const petSchema = z.object({
	type: z.string().min(1, "Pet type is required"),
	name: z.string().min(1, "Pet name is required"),
	breed: z.string().optional(),
});

// ── Base object ───────────────────────────────────────────────────────────────
//
// IMPORTANT: Arrays are declared as plain z.array() with NO .default([]) and
// NO .optional(). This guarantees TypeScript always infers T[], never T[] | undefined.
//
// The [] default is handled in useForm({ defaultValues }) — NOT in the schema.
// This is the only approach that works cleanly across all versions of zod +
// @hookform/resolvers because ZodDefault types the *input* side as T | undefined,
// which causes a Resolver<T> mismatch even though the output type is correct.

const customerBaseObject = z.object({
	type: z.enum(["individual", "business"], {
		required_error: "Customer type is required",
	}),

	name: z.string().min(1, "Full name is required"),

	email: z.string().min(1, "Email is required").email("Invalid email address"),

	dial_code: z.string().min(1, "Dial code is required"),
	phone: z.string().min(1, "Phone number is required"),

	nid_no: z.string().optional(),
	cr_no: z.string().optional(),
	tin: z.string().optional(),

	secondary_dial_code: z.string().optional(),
	secondary_phone: z.string().optional(),

	address: z.string().optional(),
	notes: z.string().optional(),
	lang: z.enum(["ar", "en"]).optional(),

	// Plain arrays — always T[], never T[] | undefined
	// Initialize to [] via useForm defaultValues, not here
	emergency_contact: z.array(emergencyContactSchema),
	vehicles: z.array(vehicleSchema),
	pets: z.array(petSchema),
});

// ── Create customer schema ─────────────────────────────────────────────────────────────
export const createCustomerSchema = customerBaseObject.superRefine(
	(data, ctx) => {
		if (data.type === "individual" && !data.nid_no?.trim()) {
			ctx.addIssue({
				path: ["nid_no"],
				message: "National ID is required for individual customers",
				code: z.ZodIssueCode.custom,
			});
		}
		if (data.type === "business") {
			if (!data.cr_no?.trim()) {
				ctx.addIssue({
					path: ["cr_no"],
					message: "CR number is required for business customers",
					code: z.ZodIssueCode.custom,
				});
			}
			if (!data.tin?.trim()) {
				ctx.addIssue({
					path: ["tin"],
					message: "TIN is required for business customers",
					code: z.ZodIssueCode.custom,
				});
			}
		}
	},
);

// ── Update schema — .partial() on base object, NOT on ZodEffects ──────────────
export const updateCustomerSchema = customerBaseObject.partial().extend({
	// Arrays stay as T[] even when partial — partial() would make them T[] | undefined
	// so we re-declare them as optional arrays explicitly
	emergency_contact: z.array(emergencyContactSchema).optional(),
	vehicles: z.array(vehicleSchema).optional(),
	pets: z.array(petSchema).optional(),
});

// ── Update schema (only fields the API accepts via PUT) ───────────────────────
// The ticket is created by the customer via the mobile app.
// Admins can only update: status, priority, admin_notes, scheduled_at.

export const updateMaintenanceTicketSchema = z.object({
	status: z
		.enum(["open", "in_progress", "resolved", "closed", "cancelled"], {
			required_error: "Status is required",
		})
		.optional(),

	priority: z
		.enum(["low", "medium", "high", "urgent"], {
			required_error: "Priority is required",
		})
		.optional(),

	admin_notes: z.string().optional(),

	scheduled_at: z.string().optional(), // ISO date string
});

// ── Create schema ─────────────────────────────────────────────────────────────
export const createMeterSchema = z.object({
	unit_id: z
		.number({ required_error: "Unit is required" })
		.int()
		.positive("Unit ID must be a positive number"),

	type: z.enum(METER_TYPES, {
		required_error: "Meter type is required",
	}),

	serial_number: z
		.string()
		.min(1, "Serial number is required")
		.max(100, "Serial number is too long"),

	name: z
		.string()
		.min(1, "Meter name is required")
		.max(150, "Name is too long"),

	unit_price: z
		.number({ required_error: "Unit price is required" })
		.min(0, "Unit price cannot be negative"),
});

// ── Update schema (all fields optional) ──────────────────────────────────────
export const updateMeterSchema = z.object({
	unit_id: z
		.number()
		.int()
		.positive("Unit ID must be a positive number")
		.optional(),
	type: z.enum(METER_TYPES).optional(),
	serial_number: z.string().min(1).max(100).optional(),
	name: z.string().min(1).max(150).optional(),
	unit_price: z.number().min(0).optional(),
	status: z.enum(METER_STATUSES).optional(),
});

// No update schema — readings are immutable once created.
// The only post-creation action is generating an invoice.

export const createMeterReadingSchema = z.object({
	meter_id: z
		.number({ required_error: "Meter is required" })
		.int()
		.positive("Meter ID must be a positive number"),

	contract_id: z
		.number({ required_error: "Contract is required" })
		.int()
		.positive("Contract ID must be a positive number"),

	reading_date: z
		.string({ required_error: "Reading date is required" })
		.min(1, "Reading date is required"),

	value: z
		.number({ required_error: "Reading value is required" })
		.min(0, "Value cannot be negative"),

	image: z.string().optional(),
});

// ==================== start the tenant work =====================================

export type createContractType = z.infer<typeof createContractSchema>;
export type createMeterReadingType = z.infer<typeof createMeterReadingSchema>;
export type createCustomerType = z.infer<typeof createCustomerSchema>;
export type updateCustomerType = z.infer<typeof updateCustomerSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
export type Pet = z.infer<typeof petSchema>;
export type updateMaintenanceTicketType = z.infer<
	typeof updateMaintenanceTicketSchema
>;

export type createMeterType = z.infer<typeof createMeterSchema>;
export type updateMeterType = z.infer<typeof updateMeterSchema>;

// ========================== old work =================================

export type FormSchemaType = z.infer<typeof formSchema>;
export type AddPackageFormSchemaType = z.infer<typeof addPackageFormSchema>;
export type confirmTransactionType = z.infer<typeof confirmTransactionSchema>;
export type addNewUserType = z.infer<typeof addNewUserSchema>;
export type editUserType = z.infer<typeof editUserSchema>;
export type addNewRoleType = z.infer<typeof addNewRoleSchema>;
export type addNewTenantType = z.infer<typeof addNewTenantSchema>;
export type addNewTenantApplicationType = z.infer<
	typeof addNewTenantApplicationSchema
>;
export type createPasswordType = z.infer<typeof createPasswordSchema>;
export type submitPaymentFormType = z.infer<typeof submitPaymentFormSchema>;
