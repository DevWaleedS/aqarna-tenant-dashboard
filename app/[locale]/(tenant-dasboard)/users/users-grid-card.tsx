"use client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
	ChevronRight,
	EllipsisVertical,
	SquarePen,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import ConfirmationDialog from "../../../components/dailogs/confirmation-dialog";

// Fallback images
import UserGridBg1 from "@/public/assets/images/user-grid/user-grid-bg1.png";
import { useUsers } from "@/hooks/queries/central/useUsersQuery";

interface UsersGridCardProps {
	users: any[];
}

const UsersGridCard = ({ users }: UsersGridCardProps) => {
	const t = useTranslations("central.users.user-card");
	const conformMessages = useTranslations("confirmation-dialog");
	const { deleteUser, isDeleting } = useUsers();

	const handleDelete = (userId: string) => {
		deleteUser(userId);
	};

	return (
		<>
			{users.map((userItem, index) => {
				// Use API avatar or fallback to default
				const avatarUrl = userItem.avatar;
				const bgImageUrl = UserGridBg1; // You can add bg_image to API response if needed

				return (
					<div className='user-grid-card' key={userItem.id || index}>
						<div className='relative border border-neutral-200 dark:border-neutral-600 rounded-2xl overflow-hidden'>
							<div className='relative h-31.75'>
								<Image
									src={bgImageUrl}
									alt='Background'
									fill
									className='w-full object-fit-cover'
								/>
							</div>

							<div className='dropdown absolute top-0 end-0 me-4 mt-4'>
								<DropdownMenu>
									<DropdownMenuTrigger className='bg-linear-to-r from-white/50 w-8 h-8 rounded-lg border border-light-white flex justify-center items-center text-white'>
										<EllipsisVertical className='h-5' />
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem className='w-full h-full bg-primary/15! dark:bg-primary-600/25! text-primary! dark:text-primary-400! border-primary-100! hover:bg-primary/25! hover:dark:bg-primary-600/30! border! hover:border-primary-200! mb-1'>
											<Link
												className='w-full flex! items-center! gap-2'
												href={`/users/${userItem.id}/edit-profile`}>
												<SquarePen className='w-5 h-5 shrink-0 text-primary! dark:text-primary-400!' />
												{t("edit-button-text")}
											</Link>
										</DropdownMenuItem>

										<ConfirmationDialog
											type='danger'
											title={conformMessages("title")}
											icon={<Trash2 className='w-5 h-5' />}
											trigger={
												<DropdownMenuItem
													className='flex items-center cursor-pointer bg-red-100! dark:bg-red-600/25! 
													text-red-600! dark:text-red-400! 
													border-red-100! hover:bg-red-200! hover:dark:bg-red-600/30!'>
													<Trash2 className='w-5 h-5 shrink-0 text-red-600! dark:text-red-400!' />
													{t("delete-button-text")}
												</DropdownMenuItem>
											}
											onConfirm={() => handleDelete(userItem.id)}>
											{conformMessages("message")}
										</ConfirmationDialog>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<div className='pe-6 pb-4 ps-6 text-center mt--50 relative z-1'>
								{typeof avatarUrl === "string" ? (
									<img
										src={avatarUrl}
										alt={userItem.name}
										className='border br-white border-width-2-px w-25 h-25 ms-auto me-auto -mt-12.5 rounded-full object-fit-cover'
									/>
								) : (
									<Image
										src={avatarUrl}
										alt={userItem.name}
										width={100}
										height={100}
										className='border br-white border-width-2-px w-25 h-25 ms-auto me-auto -mt-12.5 rounded-full object-fit-cover'
									/>
								)}
								<h6 className='text-lg mb-0 mt-1.5'>{userItem.name}</h6>
								<span className='text-neutral-500 dark:text-neutral-300 mb-4'>
									{userItem.email}
								</span>

								<div className='center-border relative bg-linear-to-r from-red-500/10 to-red-50/25 rounded-lg p-3 flex items-center gap-4 before:absolute before:w-px before:h-full before:z-1 before:bg-neutral-200 dark:before:bg-neutral-500 before:start-1/2'>
									<div className='text-center w-1/2'>
										<h6 className='text-base mb-0'>{t("role-name")}</h6>
										<span className='text-neutral-500 dark:text-neutral-300 text-sm mb-0'>
											{userItem.roles?.[0] || "N/A"}
										</span>
									</div>
									<div className='text-center w-1/2'>
										<h6 className='text-base mb-0'>Department</h6>
										<span className='text-neutral-500 dark:text-neutral-300 text-sm mb-0'>
											{userItem.department || userItem.designation || "N/A"}
										</span>
									</div>
								</div>
								<Link
									href={`/users/${userItem.id}/view-profile`}
									className={cn(
										`bg-blue-50 hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white dark:bg-primary/25 text-primary dark:text-blue-400 text-sm px-3 py-3 rounded-lg flex items-center justify-center mt-4 font-medium gap-2 w-full h-12`,
									)}>
									{t("view-profile-button-text")}
									<ChevronRight className='w-5 h-5 rtl:rotate-180' />
								</Link>
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
};

export default UsersGridCard;
