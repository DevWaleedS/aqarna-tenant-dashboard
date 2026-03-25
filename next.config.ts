import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			allowedOrigins: [
				"app.localhost:3000",
				"app.aqarna-dev.com",
				"*.aqarna-dev.com",
			],
		},
	},

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
				hostname: "placehold.co",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "aqarna-dev.com",
				pathname: "/**",
			},
			{
				protocol: "http",
				hostname: "aqarna-dev.com",
				port: "9000",
				pathname: "/**",
			},
			{
				protocol: "http",
				hostname: "app.localhost",
				port: "3000",
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
