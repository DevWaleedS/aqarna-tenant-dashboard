import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LoadingProvider } from "@/contexts/LoadingContext";
import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "../styles/globals.css";

import { Toaster } from "react-hot-toast";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
});

const cairo = Cairo({
	subsets: ["arabic"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Aqarna - Real Estate Next.js Template | Modern & Responsive",
	description: "Aqarna - Real Estate Next.js Template | Modern & Responsive",
	metadataBase: new URL(
		"https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app",
	),
	openGraph: {
		title: "Aqarna - Real Estate Next.js Template | Modern & Responsive",
		description:
			"A modern, responsive real estate template built with Next.js, Tailwind CSS, and ShadCN UI.",
		url: "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app",
		siteName: "Aqarna - Real Estate Next.js Template | Modern & Responsive",
		images: [
			{
				url: "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Aqarna Real Estate Dashboard Preview",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Aqarna - Real Estate Next.js Template | Modern & Responsive",
		description:
			"A modern, responsive real estate template built with Next.js, Tailwind CSS, and ShadCN UI.",
		images: [
			"https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app/og-image.jpg",
		],
	},
};

type Props = {
	children: React.ReactNode;
	params: { locale: string };
};

export default async function RootLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	const isRTL = locale === "ar";
	const fontClass = isRTL ? cairo.className : inter.className;

	return (
		<html dir={isRTL ? "rtl" : "ltr"} lang={locale}>
			<body className={`${fontClass} antialiased`}>
				<ReactQueryProvider>
					<LoadingProvider>
						<NextIntlClientProvider locale={locale}>
							<Toaster />
							{children}
						</NextIntlClientProvider>
					</LoadingProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
