import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { auth } from "./auth";
import { routing } from "@/i18n/routing";

// ------------------------- CONFIG -------------------------

// Routes that anyone can access (even unauthenticated)
const publicRoutes = [
	"/auth/login",
	"/auth/register",
	"/auth/forgot-password",
	"/auth/create-password",
	"/payment",
];

// Routes that authenticated users should NOT access
const authOnlyRoutes = ["/auth/login", "/auth/register"];

// ------------------------- NEXT-INTL MIDDLEWARE -------------------------

const intlMiddleware = createMiddleware(routing);

// ------------------------- MIDDLEWARE -------------------------

export default async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 1️⃣ Ignore internal, static files, and API routes
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

	// 4️⃣ Remove locale prefix for internal checks
	const pathWithoutLocale = routing.locales.includes(potentialLocale as any)
		? pathname.replace(`/${locale}`, "") || "/"
		: pathname;

	// 5️⃣ Check if route is public or auth-only
	const isPublicRoute = publicRoutes.some(
		(route) =>
			pathWithoutLocale === route || pathWithoutLocale.startsWith(route + "/"),
	);

	const isAuthOnlyRoute = authOnlyRoutes.some(
		(route) =>
			pathWithoutLocale === route || pathWithoutLocale.startsWith(route + "/"),
	);

	// 6️⃣ Initialize session only if route is not public
	let session = null;
	if (!isPublicRoute) {
		try {
			session = await auth();
		} catch (error) {
			// Redirect unauthenticated users to login
			return NextResponse.redirect(
				new URL(`/${locale}/auth/login`, request.url),
			);
		}
	}

	// 7️⃣ Protect private routes
	if (!session?.user && !isPublicRoute) {
		return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
	}

	// 8️⃣ Redirect authenticated users away from login/register
	if (session?.user && isAuthOnlyRoute) {
		return NextResponse.redirect(new URL(`/${locale}`, request.url));
	}

	// 9️⃣ Return intl response if it exists
	return intlResponse ?? NextResponse.next();
}

// ------------------------- MATCHER -------------------------

export const config = {
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
