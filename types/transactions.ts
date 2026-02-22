export interface Transaction {
	id: number;
	tenant_application_id: number;
	tenant_application?: {
		id: number;
		applicant_type: string;
		company_name?: string;
		contact_name: string;
		contact_email: string;
		subdomain: string;
		full_domain: string;
		status: number;
		status_label: string;
	};
	package_id: number;
	package?: {
		id: number;
		name: string;
		description: string;
		monthly_price: number;
		yearly_price: number;
		max_properties: number;
		max_units: number;
	};
	payment_gateway: string;
	payment_method: string;
	payment_method_label: string;
	price: number;
	formatted_price: number;
	currency: string;
	status: number;
	status_label: string;
	details?: any;
	notes: string | null;
	paid_at: string | null;
	confirmed_by: number | null;
	confirmer?: {
		id: number;
		name: string;
		email: string;
	};
	confirmed_at: string | null;
	cheque_image: string;
	transfer_receipt: string;
	invoice: string;
	created_at: string;
	updated_at: string;
}
