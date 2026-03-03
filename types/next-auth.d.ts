// next-auth.d.ts  (place at the root of your project alongside auth.ts)
// Extends NextAuth's built-in types so TypeScript knows about our custom fields.

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
	interface User {
		avatar?: string;
		roles?: string[];
		permissions?: string[];
		accessToken?: string;
		refreshToken?: string;
		rememberMe?: boolean;
		isEmailVerified?: boolean; // ← new
	}

	interface Session {
		accessToken: string;
		refreshToken: string;
		rememberMe: boolean;
		isEmailVerified: boolean; // ← new
		user: {
			id: string;
			email: string;
			name: string;
			avatar?: string;
			roles?: string[];
			permissions?: string[];
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id?: string;
		avatar?: string;
		roles?: string[];
		permissions?: string[];
		accessToken?: string;
		refreshToken?: string;
		rememberMe?: boolean;
		isEmailVerified?: boolean; // ← new
	}
}
