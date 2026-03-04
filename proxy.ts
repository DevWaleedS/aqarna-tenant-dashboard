// middleware.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure cookie-based auth — no NextAuth dependency.
// Reads `auth_token` and `auth_user` cookies written by useAuth/auth-token.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// ── Cookie keys (must match lib/auth-token.ts) ────────────────────────────────
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// ── Routes ────────────────────────────────────────────────────────────────────
const publicRoutes = [
	"/auth/login",
	"/auth/forgot-password",
	"/auth/create-password",
	"/auth/verify-email",
];

const authOnlyRoutes = ["/auth/login", "/auth/register"];

// ─────────────────────────────────────────────────────────────────────────────

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 1️⃣ Ignore static assets / Next internals
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/favicon.ico") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// 2️⃣ Run next-intl first
	const intlResponse = intlMiddleware(request);

	// 3️⃣ Resolve locale
	const segments = pathname.split("/").filter(Boolean);
	const potentialLocale = segments[0];
	const locale = routing.locales.includes(potentialLocale as any)
		? potentialLocale
		: routing.defaultLocale;

	// 4️⃣ Strip locale prefix
	const pathWithoutLocale = routing.locales.includes(potentialLocale as any)
		? pathname.replace(`/${locale}`, "") || "/"
		: pathname;

	// 5️⃣ Classify route
	const isPublicRoute = publicRoutes.some(
		(r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(r + "/"),
	);
	const isAuthOnlyRoute = authOnlyRoutes.some(
		(r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(r + "/"),
	);
	const isVerifyEmailRoute =
		pathWithoutLocale === "/auth/verify-email" ||
		pathWithoutLocale.startsWith("/auth/verify-email/");

	// 6️⃣ Read auth state from cookies
	const token = request.cookies.get(TOKEN_KEY)?.value;
	const userRaw = request.cookies.get(USER_KEY)?.value;

	let isEmailVerified = false;
	let userEmail = "";

	if (userRaw) {
		try {
			const parsed = JSON.parse(userRaw);
			isEmailVerified = parsed.isEmailVerified === true;
			userEmail = parsed.email ?? "";
		} catch {
			// malformed cookie — treat as unauthenticated
		}
	}

	const isAuthenticated = !!token;

	// 7️⃣ Redirect unauthenticated users away from private routes
	if (!isAuthenticated && !isPublicRoute) {
		return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
	}

	// 8️⃣ Redirect authenticated but UNVERIFIED users to verify-email
	//    (except when already on the verify page)
	if (
		isAuthenticated &&
		!isEmailVerified &&
		!isVerifyEmailRoute &&
		!isAuthOnlyRoute
	) {
		const url = new URL(`/${locale}/auth/verify-email`, request.url);
		url.searchParams.set("email", userEmail);
		return NextResponse.redirect(url);
	}

	// 9️⃣ Redirect verified + authenticated users away from login/register
	if (isAuthenticated && isAuthOnlyRoute) {
		return NextResponse.redirect(new URL(`/${locale}`, request.url));
	}

	// 🔟 Redirect verified users away from verify-email page
	if (isAuthenticated && isEmailVerified && isVerifyEmailRoute) {
		return NextResponse.redirect(new URL(`/${locale}`, request.url));
	}

	return intlResponse ?? NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
