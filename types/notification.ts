// types/notification.ts

export interface NotificationData {
	icon: string;
	color: string;
	application_id?: number;
	applicant_type?: string;
	applicant_name?: string;
	subdomain?: string;
	contact_email?: string;
	package_id?: number;
	[key: string]: any; // For additional dynamic properties
}

export interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	data: NotificationData;
	read_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface NotificationsResponse {
	data: Notification[];
	unread_count?: number;
}
