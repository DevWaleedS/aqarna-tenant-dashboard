"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import UserGridBg1 from "@/public/assets/images/user-grid/user-grid-bg1.png";
import DefaultAvatar from "@/public/assets/images/user-grid/user-grid-img13.png";

interface ViewProfileSidebarProps {
	user: any;
}

const ViewProfileSidebar = ({ user }: ViewProfileSidebarProps) => {
	const t = useTranslations("central.users.add-new-user-page.personal-info");

	return (
		<div className='user-grid-card relative border border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden bg-white dark:bg-[#273142] h-full'>
			{/* Cover */}
			<div className='relative h-31.75'>
				<Image src={UserGridBg1} alt='Cover' fill className='object-cover' />
			</div>

			<div className='relative pb-6 ms-6 mb-6 me-6 -mt-26'>
				{/* Header */}
				<div className='text-center border-b border-slate-200 dark:border-slate-600'>
					<Image
						src={user.avatar || DefaultAvatar}
						alt={user.name}
						width={100}
						height={100}
						className='w-24 h-24 rounded-full mx-auto object-cover border'
					/>

					<h6 className='mt-4 mb-1'>{user.name}</h6>
					<span className='text-neutral-500 dark:text-neutral-300'>
						{user.email}
					</span>
				</div>

				{/* Personal Info */}
				<div className='mt-6'>
					<h6 className='text-xl mb-4'>{t("title")}</h6>
					<ul>
						<li className='flex mb-3'>
							<span className='w-[30%] font-semibold'>{t("full-name")}</span>
							<span className='w-[70%] text-neutral-500'>: {user.name}</span>
						</li>

						<li className='flex mb-3'>
							<span className='w-[30%] font-semibold'>{t("email")}</span>
							<span className='w-[70%] text-neutral-500'>: {user.email}</span>
						</li>

						<li className='flex mb-3'>
							<span className='w-[30%] font-semibold'>{t("role-name")}</span>
							<span className='w-[70%] text-neutral-500'>
								: {user.roles?.map((r: any) => r).join(", ")}
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default ViewProfileSidebar;
