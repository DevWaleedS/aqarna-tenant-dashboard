"use client";

import Logout from "@/components/auth/logout";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/queries/tenants/useAuth";

import { cn } from "@/lib/utils";
import userImg from "@/public/assets/images/user.png";
import { Mail, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

const ProfileDropdown = () => {
	const { data: session } = useSession();
	const { userData } = useCurrentUser();

	const t = useTranslations("profile-dropdown");

	// No need for useEffect here anymore! Token is set globally
	const userId = userData?.id;
	const displayName = userData?.name || "User";
	const displayEmail = userData?.email || "";
	const displayAvatar = userData?.avatar || null;
	const displayRoles = userData?.roles || [];
	const primaryRole = displayRoles[0] || "Admin";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='icon'
					className={cn(
						"rounded-full sm:w-10 sm:h-10 w-8 h-8 bg-gray-200/75 hover:bg-slate-200 focus-visible:ring-0 dark:bg-slate-700 dark:hover:bg-slate-600 border-0 cursor-pointer data-[state=open]:bg-gray-300 data-[state=open]:ring-4 data-[state=open]:ring-slate-300 dark:data-[state=open]:ring-slate-500 dark:data-[state=open]:bg-slate-600",
					)}>
					{displayAvatar ? (
						<Image
							src={displayAvatar}
							className='rounded-full object-cover'
							width={40}
							height={40}
							alt={displayName}
						/>
					) : (
						<Image
							src={userImg}
							className='rounded-full'
							width={40}
							height={40}
							alt={displayName}
						/>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className='sm:w-75 min-w-62.5 right-10 rtl:right-auto rtl:-left-10 absolute p-4 rounded-2xl overflow-hidden shadow-lg'
				side='bottom'
				align='end'>
				<div className='py-3 px-4 rounded-lg bg-primary/10 dark:bg-primary flex items-center justify-between'>
					<div className='w-full flex flex-col rtl:items-end'>
						<h6 className='text-lg text-neutral-900 dark:text-white font-semibold mb-0'>
							{displayName}
						</h6>
						<span className='text-sm text-neutral-500 dark:text-neutral-300'>
							{primaryRole}
						</span>
					</div>
				</div>

				<div className='max-h-100 overflow-y-auto scroll-sm pt-4'>
					<ul className='w-full flex flex-col gap-3 rtl:items-end'>
						<li>
							<Link
								href={`/users/${userId}/view-profile`}
								className='text-black dark:text-white hover:text-primary dark:hover:text-primary flex items-center rtl:flex-row-reverse gap-3'>
								<User className='w-5 h-5' /> {t("my-profile-link")}
							</Link>
						</li>

						{displayEmail && (
							<li>
								<div className='text-black dark:text-white flex items-center rtl:flex-row-reverse gap-3'>
									<Mail className='w-5 h-5' />
									<span className='text-sm'>{displayEmail}</span>
								</div>
							</li>
						)}

						<li>
							<Logout />
						</li>
					</ul>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileDropdown;
