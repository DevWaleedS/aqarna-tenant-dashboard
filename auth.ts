import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ZodError } from "zod";
import { loginSchema } from "./lib/zod";
import { AxiosAPI } from "./lib/axiosInstance";

// ── Custom error — surfaces real API messages instead of "CredentialsSignin" ──
class AuthError extends CredentialsSignin {
	constructor(message: string) {
		super(message);
		this.message = message;
		this.code = message; // `code` is what ends up in res.error on the client
	}
}

// ── Detect environment ────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === "production";

const cookieDomain = isProd
	? (process.env.COOKIE_DOMAIN ?? ".aqarna-dev.com")
	: undefined;

export const { handlers, signIn, signOut, auth } = NextAuth({
	secret: process.env.NEXTAUTH_SECRET,
	trustHost: true,
	debug: !isProd,

	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { type: "email" },
				password: { type: "password" },
				remember_me: { type: "checkbox" },
				locale: { type: "text" },
			},

			authorize: async (credentials) => {
				if (!credentials) {
					throw new AuthError("No credentials provided");
				}

				try {
					const rememberMe =
						credentials.remember_me === "true" ||
						credentials.remember_me === true;

					const locale = (credentials.locale as string) || "ar";

					const parsed = loginSchema.parse({
						email: credentials.email,
						password: credentials.password,
					});

					// Step 1: login → token
					let loginData: any;
					try {
						const loginRes = await AxiosAPI.post(
							"auth/login",
							{
								email: parsed.email,
								password: parsed.password,
								remember_me: rememberMe,
							},
							{ headers: { "Accept-Language": locale } },
						);
						loginData = loginRes.data;
					} catch (err: any) {
						throw new AuthError(
							err?.response?.data?.message || err?.message || "Login failed",
						);
					}

					if (!loginData?.token) {
						throw new AuthError("No token returned from server");
					}

					// Step 2: fetch user with token
					let userData: any;
					try {
						const userRes = await AxiosAPI.get("auth/me", {
							headers: {
								Authorization: `Bearer ${loginData.token}`,
								"Accept-Language": locale,
							},
						});
						userData = userRes.data?.data;
					} catch (err: any) {
						throw new AuthError(
							err?.response?.data?.message ||
								err?.message ||
								"Failed to fetch user",
						);
					}

					if (!userData?.id) {
						throw new AuthError("User not found");
					}

					// ── Email verification flag (your field) ─────────────────
					const isEmailVerified = userData.verification_required;
					// ────────────────────────────────────────────────────────

					return {
						id: String(userData.id),
						email: userData.email,
						name: userData.name,
						avatar: userData.avatar,
						roles: userData.roles,
						permissions: userData.permissions,
						accessToken: loginData.token,
						refreshToken: loginData.token,
						rememberMe,
						isEmailVerified,
					};
				} catch (error) {
					// Re-throw our typed errors as-is
					if (error instanceof CredentialsSignin) throw error;

					// Zod validation errors
					if (error instanceof ZodError) {
						throw new AuthError(error.errors.map((e) => e.message).join(", "));
					}

					console.error("❌ Auth error:", error);
					throw new AuthError("Something went wrong. Please try again.");
				}
			},
		}),
	],

	pages: {
		signIn: "/auth/login",
		signOut: "/auth/login",
		error: "/auth/login",
		verifyRequest: "/auth/verify-email",
	},

	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
				token.avatar = user.avatar;
				token.roles = user.roles;
				token.permissions = user.permissions;
				token.accessToken = user.accessToken;
				token.refreshToken = user.refreshToken;
				token.rememberMe = user.rememberMe ?? false;
				token.isEmailVerified = user.isEmailVerified ?? false;
			}

			const expiryDays = token.rememberMe ? 30 : 1;
			token.exp = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

			return token;
		},

		async session({ session, token }) {
			session.user.id = token.id || "";
			session.user.email = token.email || "";
			session.user.name = token.name || "";
			session.user.avatar = token.avatar;
			session.user.roles = token.roles;
			session.user.permissions = token.permissions;
			session.accessToken = token.accessToken || "";
			session.refreshToken = token.refreshToken || "";
			session.rememberMe = token.rememberMe || false;
			session.isEmailVerified = (token.isEmailVerified as boolean) ?? false;
			return session;
		},
	},

	cookies: {
		sessionToken: {
			name: isProd
				? "__Secure-next-auth.session-token"
				: "next-auth.session-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProd,
				domain: cookieDomain,
			},
		},
	},
});
