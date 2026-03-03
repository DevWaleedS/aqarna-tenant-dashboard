import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { auth } from "./auth";
import { routing } from "@/i18n/routing";

// ── Public routes (no auth required) ─────────────────────────────────────────
const publicRoutes = [
	"/auth/login",
	"/auth/register",
	"/auth/forgot-password",
	"/auth/create-password",
	"/auth/verify-email", // ← email verification is always accessible
	"/payment",
];

// ── Routes authenticated users should not access ──────────────────────────────
const authOnlyRoutes = ["/auth/login", "/auth/register"];

// ─────────────────────────────────────────────────────────────────────────────

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 1️⃣ Ignore internals / static assets
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/favicon.ico") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// 2️⃣ Run next-intl middleware first
	const intlResponse = intlMiddleware(request);

	// 3️⃣ Extract locale
	const pathSegments = pathname.split("/").filter(Boolean);
	const potentialLocale = pathSegments[0];
	const locale = routing.locales.includes(potentialLocale as any)
		? potentialLocale
		: routing.defaultLocale;

	// 4️⃣ Strip locale prefix for route checks
	const pathWithoutLocale = routing.locales.includes(potentialLocale as any)
		? pathname.replace(`/${locale}`, "") || "/"
		: pathname;

	// 5️⃣ Classify route
	const isPublicRoute = publicRoutes.some(
		(route) =>
			pathWithoutLocale === route || pathWithoutLocale.startsWith(route + "/"),
	);

	const isAuthOnlyRoute = authOnlyRoutes.some(
		(route) =>
			pathWithoutLocale === route || pathWithoutLocale.startsWith(route + "/"),
	);

	const isVerifyEmailRoute =
		pathWithoutLocale === "/auth/verify-email" ||
		pathWithoutLocale.startsWith("/auth/verify-email/");

	// 6️⃣ Get session (skip for public routes)
	let session = null;
	if (!isPublicRoute) {
		try {
			session = await auth();
		} catch {
			return NextResponse.redirect(
				new URL(`/${locale}/auth/login`, request.url),
			);
		}
	}

	// 7️⃣ Protect private routes
	if (!session?.user && !isPublicRoute) {
		return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
	}

	// 8️⃣ Redirect logged-in but UNVERIFIED users to verify-email
	//    (except when they're already on the verify-email page)
	if (
		session?.user &&
		session.isEmailVerified === false &&
		!isVerifyEmailRoute &&
		!isAuthOnlyRoute
	) {
		const verifyUrl = new URL(`/${locale}/auth/verify-email`, request.url);
		// Pass email as query param so the page can show it & use it for resend
		verifyUrl.searchParams.set("email", session.user.email ?? "");
		return NextResponse.redirect(verifyUrl);
	}

	// 9️⃣ Redirect already-verified authenticated users away from login/register
	if (session?.user && isAuthOnlyRoute) {
		return NextResponse.redirect(new URL(`/${locale}`, request.url));
	}

	// 🔟 Redirect already-verified users away from verify-email
	if (session?.user && session.isEmailVerified === true && isVerifyEmailRoute) {
		return NextResponse.redirect(new URL(`/${locale}`, request.url));
	}

	return intlResponse ?? NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
