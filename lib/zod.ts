import { z } from "zod";

const METER_TYPES = ["electricity", "water", "gas", "internet"] as const;
const METER_STATUSES = ["active", "replaced", "broken"] as const;

// ── Shared enum constants about units  ─────────────────────────────────────────────────────
const UNIT_TYPES = ["residential", "commercial", "industrial"] as const;
const UNIT_STATUSES = [
	"vacant",
	"occupied",
	"maintenance",
	"reserved",
] as const;
const FURNISHING_STATUSES = [
	"fully_furnished",
	"semi_furnished",
	"unfurnished",
] as const;
const AC_TYPES = ["split", "central", "window", "none"] as const;
const INTERNET_STATUSES = ["wifi", "fiber", "none"] as const;
const ORIENTATIONS = [
	"north",
	"south",
	"east",
	"west",
	"northeast",
	"northwest",
	"southeast",
	"southwest",
] as const;

// ── Shared enum constants about properties  ─────────────────────────────────────────────────────

const PROPERTY_TYPES = ["residential", "commercial", "industrial"] as const;

const AMENITIES = [
	"swimming_pool",
	"gym",
	"parking",
	"elevator",
	"security",
	"playground",
	"garden",
	"rooftop",
	"concierge",
	"sauna",
	"storage",
	"laundry",
] as const;

export const PROPERTY_AMENITIES = AMENITIES;

// ── Shared enum constants about billing  ─────────────────────────────────────────────────────

const BILLING_CYCLES = ["monthly", "yearly"] as const;

// ==================== Users & Authentication Schemas ====================
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

// ==================== Authentication & User Management Schemas ====================

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

export const verifyEmailSchema = z.object({
	code: z
		.string({ required_error: "Verification code is required" })
		.length(6, "Code must be exactly 6 digits")
		.regex(/^\d{6}$/, "Code must contain only digits"),
});

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
		property_id: z
			.string({ required_error: "Property is required" })
			.min(1, "Property is required"),

		units: z
			.array(z.number(), { required_error: "At least one unit is required" })
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
	avatar: z
		.instanceof(File)
		.refine((f) => f.size <= MAX_AVATAR_SIZE, "Avatar must be under 2 MB")
		.refine(
			(f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
			"Only JPG, PNG or WebP images are accepted",
		)
		.optional(),
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
	unit_id: z.number({ required_error: "Unit is required" }),
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
		.int()
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
	meter_id: z.number({ required_error: "Meter is required" }),

	contract_id: z.number({ required_error: "Contract is required" }),

	reading_date: z
		.string({ required_error: "Reading date is required" })
		.min(1, "Reading date is required"),

	value: z
		.number({ required_error: "Reading value is required" })
		.min(0, "Value cannot be negative"),

	// image: z.string().optional(),
});

// ==================== Units Schemas ====================

// ── Create schema (required fields marked) ────────────────────────────────────
export const createUnitSchema = z.object({
	property_id: z
		.number({ required_error: "Property is required" })
		.int()
		.positive("Property ID must be a positive number"),

	name: z
		.string({ required_error: "Unit name is required" })
		.min(1, "Unit name is required")
		.max(150),

	unit_number: z
		.string({ required_error: "Unit number is required" })
		.min(1, "Unit number is required")
		.max(20),

	floor_number: z
		.number({ required_error: "Floor number is required" })
		.int()
		.min(0, "Floor cannot be negative"),

	type: z.enum(UNIT_TYPES, { required_error: "Unit type is required" }),

	area: z
		.number({ required_error: "Area is required" })
		.min(0, "Area cannot be negative"),

	monthly_rent: z
		.number({ required_error: "Monthly rent is required" })
		.min(0, "Rent cannot be negative"),

	// Optional fields
	description: z.string().max(1000).optional(),
	rooms_count: z.number().int().min(0).optional(),
	bathrooms_count: z.number().int().min(0).optional(),
	kitchens_count: z.number().int().min(0).optional(),
	balconies_count: z.number().int().min(0).optional(),
	view_type: z.string().max(100).optional(),
	furnishing_status: z.enum(FURNISHING_STATUSES).optional(),
	orientation: z.enum(ORIENTATIONS).optional(),
	security_deposit: z.number().min(0).optional(),
	min_lease_term: z.number().int().min(1).optional(),
	ac_type: z.enum(AC_TYPES).optional(),
	internet_status: z.enum(INTERNET_STATUSES).optional(),
});

// ── Update schema (everything optional; adds status) ─────────────────────────
export const updateUnitSchema = z.object({
	property_id: z.number().int().positive().optional(),
	name: z.string().min(1).max(150).optional(),
	unit_number: z.string().min(1).max(20).optional(),
	floor_number: z.number().int().min(0).optional(),
	type: z.enum(UNIT_TYPES).optional(),
	status: z.enum(UNIT_STATUSES).optional(), // only available on update
	area: z.number().min(0).optional(),
	monthly_rent: z.number().min(0).optional(),
	description: z.string().max(1000).optional(),
	rooms_count: z.number().int().min(0).optional(),
	bathrooms_count: z.number().int().min(0).optional(),
	kitchens_count: z.number().int().min(0).optional(),
	balconies_count: z.number().int().min(0).optional(),
	view_type: z.string().max(100).optional(),
	furnishing_status: z.enum(FURNISHING_STATUSES).optional(),
	orientation: z.enum(ORIENTATIONS).optional(),
	security_deposit: z.number().min(0).optional(),
	min_lease_term: z.number().int().min(1).optional(),
	ac_type: z.enum(AC_TYPES).optional(),
	internet_status: z.enum(INTERNET_STATUSES).optional(),
});

// ── Create schema ─────────────────────────────────────────────────────────────
export const createPropertySchema = z.object({
	name: z
		.string({ required_error: "Property name is required" })
		.min(1, "Property name is required")
		.max(150),

	type: z.enum(PROPERTY_TYPES, { required_error: "Property type is required" }),

	address_line_1: z
		.string({ required_error: "Address is required" })
		.min(1, "Address is required")
		.max(255),

	address_line_2: z.string().max(255).optional(),

	building_number: z.string().max(20).optional(),

	latitude: z.string().optional(),
	longitude: z.string().optional(),

	floors_count: z.number().int().min(1).optional(),

	area: z.number().min(0).optional(),

	concierge_phone: z.string().max(30).optional(),

	amenities: z.array(z.enum(AMENITIES)).optional(),
});

// ── Update schema (all fields optional) ──────────────────────────────────────
export const updatePropertySchema = z.object({
	name: z.string().min(1).max(150).optional(),
	type: z.enum(PROPERTY_TYPES).optional(),
	address_line_1: z.string().min(1).max(255).optional(),
	address_line_2: z.string().max(255).optional(),
	building_number: z.string().max(20).optional(),
	latitude: z.string().optional(),
	longitude: z.string().optional(),
	floors_count: z.number().int().min(1).optional(),
	area: z.number().min(0).optional(),
	concierge_phone: z.string().max(30).optional(),
	amenities: z.array(z.enum(AMENITIES)).optional(),
});

// ── Renew schema — requires the package to renew with ─────────────────────────
export const renewSubscriptionSchema = z.object({
	package_id: z
		.number({ required_error: "Please select a package" })
		.int()
		.positive("Package ID must be a positive number"),
});

// ── Upgrade schema ────────────────────────────────────────────────────────────
export const upgradeSubscriptionSchema = z.object({
	package_id: z
		.number({ required_error: "Please select a package" })
		.int()
		.positive("Package ID must be a positive number"),

	billing_cycle: z.enum(BILLING_CYCLES, {
		required_error: "Please select a billing cycle",
	}),
});

// ── Create user schema ────────────────────────────────────────────────────────
export const createUserSchema = z
	.object({
		name: z
			.string({ required_error: "Name is required" })
			.min(2, "Name must be at least 2 characters")
			.max(100),

		email: z
			.string({ required_error: "Email is required" })
			.email("Please enter a valid email address"),

		password: z
			.string({ required_error: "Password is required" })
			.min(8, "Password must be at least 8 characters"),

		confirmed_password: z.string({
			required_error: "Please confirm your password",
		}),

		roles: z.array(z.string()).optional(),

		avatar: z
			.instanceof(File)
			.refine((f) => f.size <= MAX_AVATAR_SIZE, "Avatar must be under 2 MB")
			.refine(
				(f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
				"Only JPG, PNG or WebP images are accepted",
			)
			.optional(),
	})
	.refine((data) => data.password === data.confirmed_password, {
		message: "Passwords do not match",
		path: ["confirmed_password"],
	});

// ── Update user schema ────────────────────────────────────────────────────────
export const updateUserSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	email: z.string().email("Please enter a valid email address").optional(),
	roles: z.array(z.string()).optional(),
	avatar: z
		.instanceof(File)
		.refine((f) => f.size <= MAX_AVATAR_SIZE, "Avatar must be under 2 MB")
		.refine(
			(f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
			"Only JPG, PNG or WebP images are accepted",
		)
		.optional(),
});

// ── Update password schema ────────────────────────────────────────────────────
export const updatePasswordSchema = z
	.object({
		current_password: z
			.string({ required_error: "Current password is required" })
			.min(1, "Current password is required"),

		password: z
			.string({ required_error: "New password is required" })
			.min(8, "Password must be at least 8 characters"),

		confirmed_password: z.string({
			required_error: "Please confirm your new password",
		}),
	})
	.refine((data) => data.password === data.confirmed_password, {
		message: "Passwords do not match",
		path: ["confirmed_password"],
	});

// ── Update avatar schema ──────────────────────────────────────────────────────
export const updateAvatarSchema = z.object({
	avatar: z
		.instanceof(File, { message: "Please select an image" })
		.refine((f) => f.size <= MAX_AVATAR_SIZE, "Avatar must be under 2 MB")
		.refine(
			(f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
			"Only JPG, PNG or WebP images are accepted",
		),
});

const nameField = z
	.string({ required_error: "Role name is required" })
	.min(2, "Role name must be at least 2 characters")
	.max(50, "Role name must be under 50 characters")
	.regex(
		/^[a-z0-9_]+$/,
		"Only lowercase letters, numbers and underscores allowed",
	);

// ── Create role schema ────────────────────────────────────────────────────────
export const createRoleSchema = z.object({
	name: nameField,
	permissions: z.array(z.string()),
});

// ── Update role schema ────────────────────────────────────────────────────────
// name is required here too — the form always sends both fields.
// If you truly want name-optional at the API level, handle that in onSubmit,
// not in the Zod schema (avoids the Resolver generic mismatch).
export const updateRoleSchema = z.object({
	name: nameField,
	permissions: z.array(z.string()),
});

// ── Update permissions only ───────────────────────────────────────────────────
export const updateRolePermissionsSchema = z.object({
	permissions: z
		.array(z.string())
		.min(1, "Please select at least one permission"),
});

// ── Confirm transaction schema ────────────────────────────────────────────────
export const confirmTransactionSchema = z.object({
	notes: z
		.string({ required_error: "Notes are required" })
		.min(3, "Notes must be at least 3 characters")
		.max(500, "Notes must be under 500 characters"),
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
export type createUnitType = z.infer<typeof createUnitSchema>;
export type updateUnitType = z.infer<typeof updateUnitSchema>;
export type createPropertyType = z.infer<typeof createPropertySchema>;
export type updatePropertyType = z.infer<typeof updatePropertySchema>;
export type renewSubscriptionType = z.infer<typeof renewSubscriptionSchema>;
export type upgradeSubscriptionType = z.infer<typeof upgradeSubscriptionSchema>;

export type createUserType = z.infer<typeof createUserSchema>;
export type updateUserType = z.infer<typeof updateUserSchema>;
export type createPasswordType = z.infer<typeof createPasswordSchema>;
export type updatePasswordType = z.infer<typeof updatePasswordSchema>;
export type updateAvatarType = z.infer<typeof updateAvatarSchema>;

export type createRoleType = z.infer<typeof createRoleSchema>;
export type updateRoleType = z.infer<typeof updateRoleSchema>;
export type updateRolePermissionsType = z.infer<
	typeof updateRolePermissionsSchema
>;
export type confirmTransactionType = z.infer<typeof confirmTransactionSchema>;
export type verifyEmailType = z.infer<typeof verifyEmailSchema>;
