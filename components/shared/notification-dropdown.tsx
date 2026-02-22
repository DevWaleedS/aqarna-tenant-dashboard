import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useNotifications } from "@/hooks/queries/central/useNotification";
import Image from "next/image";

const NotificationDropdown = () => {
	const t = useTranslations("notifications");
	const locale = useLocale();

	const {
		notifications,
		unreadCount,
		isLoading,
		markAllAsRead,
		markAsRead,
		deleteNotification,
		isMarkingAllAsRead,
	} = useNotifications();

	const getRelativeTime = (date: string) => {
		return formatDistanceToNow(new Date(date), {
			addSuffix: true,
			locale: locale === "ar" ? ar : enUS,
		});
	};

	const handleNotificationClick = (
		notificationId: string,
		hasRead: boolean
	) => {
		if (!hasRead) {
			markAsRead(notificationId);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size='icon'
					className={cn(
						"rounded-[50%] text-neutral-900 sm:w-10 sm:h-10 w-8 h-8 bg-gray-200/75 hover:bg-slate-200 focus-visible:ring-0 dark:bg-slate-700 dark:hover:bg-slate-600 border-0 cursor-pointer data-[state=open]:bg-gray-300 dark:data-[state=open]:bg-slate-600 relative"
					)}>
					<Bell className='h-5 w-5' />
					{unreadCount > 0 && (
						<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold'>
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='sm:w-100 max-h-[unset] me-6 p-0 rounded-2xl overflow-hidden shadow-lg block'>
				<div>
					<div className='rtl:flex-row-reverse py-3 px-4 rounded-lg bg-primary/10 dark:bg-primary/25 m-4 flex items-center justify-between gap-2'>
						<h6 className='text-lg text-neutral-900 dark:text-white font-semibold mb-0'>
							{t("title")}
						</h6>
						<div className='flex items-center gap-2'>
							{unreadCount > 0 && (
								<span className='sm:w-10 sm:h-10 w-8 h-8 bg-white dark:bg-slate-800 text-primary dark:text-primary font-bold flex justify-center items-center rounded-full'>
									{unreadCount > 9
										? "9+"
										: unreadCount.toString().padStart(2, "0")}
								</span>
							)}
							{unreadCount > 0 && (
								<Button
									size='icon'
									variant='ghost'
									onClick={() => markAllAsRead()}
									disabled={isMarkingAllAsRead}
									className='h-8 w-8'
									title='Mark all as read'>
									{isMarkingAllAsRead ? (
										<Loader2 className='h-4 w-4 animate-spin' />
									) : (
										<CheckCheck className='h-4 w-4' />
									)}
								</Button>
							)}
						</div>
					</div>

					<div className='scroll-sm border-t-0!'>
						{isLoading ? (
							<div className='flex justify-center items-center py-8'>
								<Loader2 className='h-6 w-6 animate-spin text-primary' />
							</div>
						) : notifications.length === 0 ? (
							<div className='text-center py-8 px-4'>
								<Bell className='h-12 w-12 mx-auto text-gray-400 mb-2' />
								<p className='text-gray-500 dark:text-gray-400'>
									{t("no-notifications-yet")}
								</p>
							</div>
						) : (
							<div className='max-h-100 overflow-y-auto scrollbar-thin scrollbar-invisible hover:scrollbar-visible'>
								{notifications.map((notification: any) => (
									<div
										key={notification.id}
										className={cn(
											"flex rtl:flex-row-reverse px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 justify-between gap-2 group relative",
											!notification.read_at && "bg-primary/5 dark:bg-primary/10"
										)}>
										<button
											onClick={() =>
												handleNotificationClick(
													notification.id,
													!!notification.read_at
												)
											}
											className='flex rtl:flex-row-reverse items-start gap-3 flex-1 text-left rtl:text-right'>
											<div
												className='shrink-0 relative w-11 h-11 flex justify-center items-center rounded-full'
												style={{
													backgroundColor: notification.data.color + "33",
												}}>
												<div style={{ color: notification.data.color }}>
													<Image
														src={notification.data.icon}
														alt='notification icon'
														width={20}
														height={20}
													/>
												</div>
											</div>
											<div className='flex-1 min-w-0'>
												<div className='flex items-center rtl:justify-end gap-2 mb-1'>
													<h6 className='text-sm font-semibold rtl:text-end'>
														{notification.title}
													</h6>
													{!notification.read_at && (
														<span className='w-2 h-2 bg-primary rounded-full shrink-0' />
													)}
												</div>
												<p className='mb-0 text-sm line-clamp-2 rtl:text-end text-gray-600 dark:text-gray-300'>
													{notification.message}
												</p>
												<span className='text-xs text-neutral-500 dark:text-neutral-400 mt-1 block'>
													{getRelativeTime(notification.created_at)}
												</span>
											</div>
										</button>
										<Button
											size='icon'
											variant='ghost'
											onClick={() => deleteNotification(notification.id)}
											className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity  bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border-red-100 p-2 rounded-full'
											title='Delete notification'>
											<Trash2 className='h-5 w-5 text-red-500' />
										</Button>
									</div>
								))}
							</div>
						)}

						{notifications.length > 0 && (
							<div className='text-center py-3 px-4 border-t dark:border-gray-700'>
								<Link
									href='/notifications'
									className='text-primary dark:text-primary font-semibold hover:underline text-center'>
									{t("view-all-button")}
								</Link>
							</div>
						)}
					</div>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NotificationDropdown;
