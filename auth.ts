import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ZodError } from "zod";
import { loginSchema } from "./lib/zod";
import { AxiosAPI } from "./lib/axiosInstance";

// -------------------------
// NextAuth configuration
// -------------------------
export const { handlers, signIn, signOut, auth } = NextAuth({
	secret: process.env.NEXTAUTH_SECRET,
	trustHost: true,

	// Add these debug options temporarily
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
					// Convert remember_me to boolean
					const rememberMe =
						credentials.remember_me === "true" ||
						credentials.remember_me === true;

					// Get locale (default to 'en' if not provided)
					const locale = (credentials.locale as string) || "ar";

					// Validate with Zod
					const parsed = loginSchema.parse({
						email: credentials.email,
						password: credentials.password,
					});

					// Step 1: Login to get token
					const loginRes = await AxiosAPI.post(
						"/auth/login",
						{
							email: parsed.email,
							password: parsed.password,
							remember_me: rememberMe,
						},
						{
							headers: {
								"Accept-Language": locale,
							},
						},
					);

					const loginData = loginRes.data;

					if (!loginData || !loginData.token) return null;

					// Step 2: Get user details using token
					const userRes = await AxiosAPI.get("/auth/me", {
						headers: {
							Authorization: `Bearer ${loginData.token}`,
							"Accept-Language": locale,
						},
					});

					const userData = userRes.data?.data;

					if (!userData || !userData.id) return null;

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

	// -------------------------
	// Custom Pages Configuration
	// -------------------------
	pages: {
		signIn: "/auth/login",
		signOut: "/auth/login",
		error: "/auth/login", // This is where it redirects on error
		verifyRequest: "/auth/verify-request",
		newUser: "/auth/register",
	},

	// -------------------------
	// Session & JWT strategy
	// -------------------------
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days default
	},

	callbacks: {
		// -------------------------
		// JWT callback
		// -------------------------
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
			}

			// Adjust token expiry based on rememberMe
			const expiryDays = token.rememberMe ? 30 : 1;
			token.exp = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

			return token;
		},

		// -------------------------
		// Session callback
		// -------------------------
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
