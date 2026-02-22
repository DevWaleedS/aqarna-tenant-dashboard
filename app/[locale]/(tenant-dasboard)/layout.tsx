import { cookies } from "next/headers";
import { ClientRoot } from "@/app/[locale]/client-root";
import AuthTokenProvider from "@/providers/AuthTokenProvider";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	try {
		const cookieStore = await cookies();
		const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

		return (
			<AuthTokenProvider>
				<ClientRoot defaultOpen={defaultOpen}>{children}</ClientRoot>
			</AuthTokenProvider>
		);
	} catch (error) {
		return (
			<div className='p-8 text-center'>
				<h2 className='text-xl font-semibold mb-2'>Something went wrong!</h2>
				<p className='text-muted-foreground'>
					We couldn't load the layout. Please try again later.
				</p>
			</div>
		);
	}
}
