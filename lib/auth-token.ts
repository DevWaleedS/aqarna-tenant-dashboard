// lib/auth-token.ts
// ─────────────────────────────────────────────────────────────────────────────
// Centralised cookie helpers for auth_token and auth_user.
// Both cookies are NOT httpOnly so:
//   - axios can read auth_token client-side to attach as Bearer
//   - middleware reads them from request.cookies server-side
// ─────────────────────────────────────────────────────────────────────────────

import Cookies from "js-cookie";

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

const isProd = process.env.NODE_ENV === "production";

// Base cookie options — domain intentionally omitted in dev so
// app.localhost:3000 works without a hosts-file entry.
const baseOptions = (rememberMe: boolean): Cookies.CookieAttributes => ({
	expires: rememberMe ? 30 : undefined, // 30 days | session cookie
	path: "/",
	secure: isProd,
	sameSite: "Lax",
});

// ── Token ─────────────────────────────────────────────────────────────────────

export const setAuthToken = (token: string, rememberMe = false) =>
	Cookies.set(TOKEN_KEY, token, baseOptions(rememberMe));

export const getAuthToken = (): string | undefined => Cookies.get(TOKEN_KEY);

export const removeAuthToken = () => Cookies.remove(TOKEN_KEY, { path: "/" });

// ── User (minimal — for middleware, not a source of truth) ────────────────────

export interface StoredUser {
	id: number | string;
	name: string;
	email: string;
	avatar?: string;
	isEmailVerified: boolean;
}

export const setAuthUser = (user: StoredUser, rememberMe = false) =>
	Cookies.set(USER_KEY, JSON.stringify(user), baseOptions(rememberMe));

export const getAuthUser = (): StoredUser | null => {
	try {
		const raw = Cookies.get(USER_KEY);
		return raw ? (JSON.parse(raw) as StoredUser) : null;
	} catch {
		return null;
	}
};

export const removeAuthUser = () => Cookies.remove(USER_KEY, { path: "/" });

// ── Clear all ─────────────────────────────────────────────────────────────────

export const clearAuth = () => {
	removeAuthToken();
	removeAuthUser();
};
