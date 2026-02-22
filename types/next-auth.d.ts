import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		accessToken: string;
		refreshToken: string;
		rememberMe: boolean;
		user: {
			id: string;
			email: string;
			name: string;
			avatar?: string;
			roles?: string[];
			permissions?: string[];
		};
	}

	interface User {
		id: string;
		email: string;
		name: string;
		avatar?: string;
		roles?: string[];
		permissions?: string[];
		accessToken?: string; // ✅ Make optional
		refreshToken?: string; // ✅ Make optional
		rememberMe?: boolean; // ✅ Make optional
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id?: string; // ✅ Make optional
		email?: string; // ✅ Make optional
		name?: string; // ✅ Make optional
		avatar?: string;
		roles?: string[];
		permissions?: string[];
		accessToken?: string; // ✅ Make optional
		refreshToken?: string; // ✅ Make optional
		rememberMe?: boolean; // ✅ Make optional
		exp?: number;
	}
}
