// lib/axiosInstance.ts
// ─────────────────────────────────────────────────────────────────────────────
// Two axios instances:
//   AxiosAPI  — public (no auth header) — used for login, register, etc.
//   AxiosAuth — authenticated (Bearer token from cookie) — used for everything else
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { getAuthToken, clearAuth } from "@/lib/auth-token";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ── Public instance ───────────────────────────────────────────────────────────
export const AxiosAPI = axios.create({
	baseURL: BASE_URL,
	headers: { "Content-Type": "application/json" },
});

// ── Authenticated instance ────────────────────────────────────────────────────
export const AxiosAuth = axios.create({
	baseURL: BASE_URL,
	headers: { "Content-Type": "application/json" },
});

// Attach Bearer token from cookie before every request
AxiosAuth.interceptors.request.use((config) => {
	const token = getAuthToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Handle 401 — token expired or invalid
AxiosAuth.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error?.response?.status === 401) {
			// Clear cookies and redirect to login
			clearAuth();
			// Use window.location so the full page reloads and all
			// React Query cache is cleared alongside the cookie
			if (typeof window !== "undefined") {
				window.location.href = "/auth/login";
			}
		}
		return Promise.reject(error);
	},
);
