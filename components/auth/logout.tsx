"use client";

import { Button } from "../ui/button";
import { LogOutIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLogout } from "@/hooks/queries/useAuth";

const Logout = () => {
	const t = useTranslations("profile-dropdown");
	const logout = useLogout();

	const handleLogout = async () => {
		try {
			await logout.mutateAsync();
		} catch (error: any) {
			console.log(error);
		}
	};

	return (
		<Button
			onClick={handleLogout}
			type='button'
			disabled={logout.isPending}
			className={`hover:text-red-600 flex items-center gap-3 py-0.5 text-neutral-900 dark:text-white text-base px-0.5! cursor-pointer leading-0 w-full justify-start rtl:flex-row-reverse hover:no-underline h-6.5 ${
				logout.isPending ? "text-red-600" : ""
			}`}
			variant='link'>
			{logout.isPending ? (
				<>
					<Loader2 className='animate-spin w-4.5! h-4.5!' />
					{t("logging_out")}
				</>
			) : (
				<>
					<LogOutIcon width={24} height={24} className='w-4.5! h-4.5!' />
					{t("logout-link")}
				</>
			)}
		</Button>
	);
};

export default Logout;
