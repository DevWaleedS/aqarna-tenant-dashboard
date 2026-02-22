"use client";
import { useTranslations } from "next-intl";

import ViewProfileSidebar from "./components/view-profile-sidebar";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";

import EditProfileContent from "./components/edit-profile-content";
import { usePathname, useParams } from "next/navigation";
import { useUser } from "@/hooks/queries/central/useUsersQuery";

const index = () => {
	const t = useTranslations("central.users.add-new-user-page");
	const pathname = usePathname();
	const params = useParams();
	const userId = params?.userId as string;
	const isEditProfile =
		pathname.split("/").filter(Boolean).pop() === "edit-profile";
	const { user, isLoading } = useUser(userId);

	if (isLoading) {
		return (
			<div className='h-full flex items-center justify-center'>
				{t("loading-profile")}
			</div>
		);
	}

	if (!user) return null;

	return (
		<>
			<DashboardBreadcrumb
				title={t(isEditProfile ? "edit-profile" : "profile-info")}
				text={t(isEditProfile ? "edit-profile" : "profile-info")}
			/>

			<div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
				<div className='col-span-12 lg:col-span-4'>
					<ViewProfileSidebar user={user} />
				</div>

				<div className='col-span-12 lg:col-span-8'>
					<Card className='card'>
						<CardContent className='px-0'>
							<EditProfileContent userId={userId} isEditMode={isEditProfile} />
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
};
export default index;
