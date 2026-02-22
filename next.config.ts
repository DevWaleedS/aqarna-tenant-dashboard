import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				pathname: "/**",
			},

			{
				protocol: "https",
				hostname: "aqarna-dev.com",
				pathname: "/**",
			},

			{
				protocol: "http", // MUST be http
				hostname: "aqarna-dev.com",
				port: "9000", // MUST include port
				pathname: "/**",
			},
		],
	},

	async redirects() {
		return [
			{
				source: "/",
				destination: "/home",
				permanent: true,
			},
		];
	},
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
