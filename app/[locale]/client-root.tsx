"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/layout/header";
import ThemeCustomizer from "@/components/theme-customizer/theme-customizer";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export function ClientRoot({
	defaultOpen,
	children,
}: {
	defaultOpen: boolean;
	children: ReactNode;
}) {
	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='system'
			enableSystem
			disableTransitionOnChange>
			<SidebarProvider defaultOpen={defaultOpen}>
				<AppSidebar />
				<main className='dashboard-body-wrapper grow flex flex-col'>
					<SidebarInset>
						<Header />
					</SidebarInset>
					<div className='dashboard-body bg-neutral-100 dark:bg-[#1e2734] md:p-6 p-4 flex-1 overflow-auto'>
						{children}
					</div>
				</main>
				<ThemeCustomizer />
				<Toaster position='top-center' reverseOrder={false} />
			</SidebarProvider>
		</ThemeProvider>
	);
}
