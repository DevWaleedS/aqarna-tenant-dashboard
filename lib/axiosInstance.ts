import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SUPPORTED_LOCALES = ["en", "ar"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const NO_CACHE_HEADERS = {
	"Cache-Control": "no-cache, no-store, must-revalidate",
	Pragma: "no-cache",
	Expires: "0",
} as const;

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

/**
 * Extracts locale from current URL path
 * @returns locale string (en/ar), defaults to 'en'
 */
const getLocaleFromPath = (): Locale => {
	if (typeof window === "undefined") return "en";

	const pathSegments = window.location.pathname.split("/");
	const locale = pathSegments[1];

	// Type guard to check if locale is valid
	if (SUPPORTED_LOCALES.includes(locale as Locale)) {
		return locale as Locale;
	}

	return "en";
};

/**
 * Handles authentication errors for authenticated requests only
 */
const handleAuthError = (error: AxiosError) => {
	const status = error?.response?.status;

	if (status === 401) {
		// Get current locale for redirect
		const locale = getLocaleFromPath();
		signOut({ callbackUrl: `/${locale}/auth/login` });
	}

	return Promise.reject(error);
};

/**
 * Handles errors for public API (no auto sign-out)
 */
const handlePublicError = (error: AxiosError) => {
	// Just reject without signing out
	// Public endpoints shouldn't trigger authentication logic
	return Promise.reject(error);
};

/* -------------------------------------------------------------------------- */
/*                                AXIOS CLIENTS                                */
/* -------------------------------------------------------------------------- */

// 🔓 Public (no auth)
export const AxiosAPI = axios.create({
	baseURL: BASE_URL,
	headers: {
		...NO_CACHE_HEADERS,
		Accept: "application/json",
	},
});

// 🔐 Authenticated
export const AxiosAuth = axios.create({
	baseURL: BASE_URL,
	headers: {
		...NO_CACHE_HEADERS,
		Accept: "application/json",
	},
});

/* -------------------------------------------------------------------------- */
/*                               INTERCEPTORS                                  */
/* -------------------------------------------------------------------------- */

// ✅ Inject language for public requests
AxiosAPI.interceptors.request.use(
	(config) => {
		const locale = getLocaleFromPath();
		config.headers["Accept-Language"] = locale;

		return config;
	},
	(error) => Promise.reject(error),
);

// ✅ Inject token & language for authenticated requests
AxiosAuth.interceptors.request.use(
	async (config) => {
		const session = await getSession();
		const token = session?.accessToken;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		const locale = getLocaleFromPath();
		config.headers["Accept-Language"] = locale;

		return config;
	},
	(error) => Promise.reject(error),
);

/* -------------------------------------------------------------------------- */
/*                          RESPONSE INTERCEPTORS                              */
/* -------------------------------------------------------------------------- */

// ✅ Public API error handling (no auto sign-out)
AxiosAPI.interceptors.response.use((response) => response, handlePublicError);

// ✅ Authenticated API error handling (auto sign-out on 401)
AxiosAuth.interceptors.response.use((response) => response, handleAuthError);
