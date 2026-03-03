import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ZodError } from "zod";
import { loginSchema } from "./lib/zod";
import { AxiosAPI } from "./lib/axiosInstance";

export const { handlers, signIn, signOut, auth } = NextAuth({
	secret: process.env.NEXTAUTH_SECRET,
	trustHost: true,
	debug: process.env.NODE_ENV === "development",

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
				if (!credentials) return null;

				try {
					const rememberMe =
						credentials.remember_me === "true" ||
						credentials.remember_me === true;

					const locale = (credentials.locale as string) || "ar";

					const parsed = loginSchema.parse({
						email: credentials.email,
						password: credentials.password,
					});

					// Step 1: Login to get token
					const loginRes = await AxiosAPI.post(
						"central/auth/login",
						{
							email: parsed.email,
							password: parsed.password,
							remember_me: rememberMe,
						},
						{ headers: { "Accept-Language": locale } },
					);

					const loginData = loginRes.data;
					if (!loginData || !loginData.token) return null;

					// Step 2: Get user details using token
					const userRes = await AxiosAPI.get("/central/auth/me", {
						headers: {
							Authorization: `Bearer ${loginData.token}`,
							"Accept-Language": locale,
						},
					});

					const userData = userRes.data?.data;
					if (!userData || !userData.id) return null;

					// ── Email verification check ──────────────────────────────
					// Adjust the field name below to match your actual API response
					// e.g. userData.is_verified / userData.email_verified_at / userData.verified
					const isEmailVerified =
						userData.is_verified === true ||
						userData.email_verified_at !== null ||
						userData.email_verified_at !== undefined;
					// ─────────────────────────────────────────────────────────

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
						isEmailVerified, // ← new field
					};
				} catch (error) {
					if (error instanceof ZodError) {
						console.error("❌ Zod validation errors:", error.errors);
					}
					console.error("❌ Auth error:", error);
					return null;
				}
			},
		}),
	],

	pages: {
		signIn: "/auth/login",
		signOut: "/auth/login",
		error: "/auth/login",
		verifyRequest: "/auth/verify-request",
		newUser: "/auth/register",
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
				token.isEmailVerified = user.isEmailVerified ?? false; // ← new
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
			session.isEmailVerified = (token.isEmailVerified as boolean) ?? false; // ← new
			return session;
		},
	},

	cookies: {
		sessionToken: {
			name:
				process.env.NODE_ENV === "production"
					? "__Secure-next-auth.session-token"
					: "next-auth.session-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
				domain:
					process.env.NODE_ENV === "production" ? "aqarna-dev.com" : undefined,
			},
		},
	},
});
