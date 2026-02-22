export interface PackageFormData {
	name: string;
	description: string;
	max_properties: number;
	max_units: number;
	published?: boolean;
	monthly_price: number;
	yearly_price: number;
	features: string[];
}

export interface Package extends PackageFormData {
	id: string;
	created_at: string;
	updated_at: string;
}
