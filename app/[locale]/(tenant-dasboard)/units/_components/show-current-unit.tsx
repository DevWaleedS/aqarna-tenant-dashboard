"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2, Star, Wifi, Wind } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useUnit } from "@/hooks/queries/useUnits";

interface ShowCurrentUnitProps {
	unitId: number | string;
	onClose?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
	vacant:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	occupied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	maintenance:
		"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	reserved:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const ShowCurrentUnit = ({ unitId, onClose }: ShowCurrentUnitProps) => {
	const t = useTranslations("tenant.units.show-current-unit-page");
	const { unit, isLoading } = useUnit(unitId);

	const formatCurrency = (amount?: number) => {
		if (amount === undefined || amount === null) return "—";
		return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(
			amount,
		);
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!unit) {
		return (
			<div className='text-center py-12'>
				<p className='text-neutral-500 dark:text-neutral-400'>
					{t("not-found")}
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className='grid grid-cols-12 gap-5 pb-6'>
				{/* Cover Image */}
				{unit.cover && (
					<div className='col-span-12'>
						<img
							src={unit.cover}
							alt={unit.name}
							className='w-full h-52 object-cover rounded-xl border border-neutral-200 dark:border-slate-600'
						/>
					</div>
				)}

				{/* ════ Unit Information ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("unit-info-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='md:col-span-8 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("name-label")}
					</Label>
					<Input className='h-12 px-4' value={unit.name ?? "—"} readOnly />
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("unit-number-label")}
					</Label>
					<Input
						className='h-12 px-4 font-mono'
						value={unit.unit_number ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("type-label")}
					</Label>
					<Input
						className='h-12 px-4 capitalize'
						value={unit.type ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("floor-number-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={unit.floor_number ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("status-label")}
					</Label>
					<div className='h-12 px-4 flex items-center'>
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[unit.status] ?? "bg-gray-100 text-gray-600"}`}>
							{unit.status}
						</span>
					</div>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("area-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={unit.area ? `${unit.area} m²` : "—"}
						readOnly
					/>
				</div>

				{unit.orientation && (
					<div className='md:col-span-4 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("orientation-label")}
						</Label>
						<Input
							className='h-12 px-4 capitalize'
							value={unit.orientation}
							readOnly
						/>
					</div>
				)}

				{unit.view_type && (
					<div className='md:col-span-4 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("view-type-label")}
						</Label>
						<Input className='h-12 px-4' value={unit.view_type} readOnly />
					</div>
				)}

				{unit.rating && (
					<div className='md:col-span-4 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("rating-label")}
						</Label>
						<div className='h-12 px-4 flex items-center gap-2 text-yellow-500'>
							<Star className='w-4 h-4 fill-yellow-400' />
							<span className='font-semibold'>{unit.rating}</span>
						</div>
					</div>
				)}

				{/* ════ Rooms & Amenities ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("rooms-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='md:col-span-3 col-span-6'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("rooms-count-label")}
					</Label>
					<Input
						className='h-12 px-4 text-center'
						value={unit.rooms_count ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-3 col-span-6'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("bathrooms-count-label")}
					</Label>
					<Input
						className='h-12 px-4 text-center'
						value={unit.bathrooms_count ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-3 col-span-6'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("kitchens-count-label")}
					</Label>
					<Input
						className='h-12 px-4 text-center'
						value={unit.kitchens_count ?? "—"}
						readOnly
					/>
				</div>

				<div className='md:col-span-3 col-span-6'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("balconies-count-label")}
					</Label>
					<Input
						className='h-12 px-4 text-center'
						value={unit.balconies_count ?? "—"}
						readOnly
					/>
				</div>

				{unit.furnishing_status && (
					<div className='md:col-span-4 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("furnishing-label")}
						</Label>
						<Input
							className='h-12 px-4 capitalize'
							value={unit.furnishing_status.replace(/_/g, " ")}
							readOnly
						/>
					</div>
				)}

				{unit.ac_type && (
					<div className='md:col-span-4 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("ac-type-label")}
						</Label>
						<div className='h-12 px-4 flex items-center gap-2 border border-neutral-200 dark:border-slate-600 rounded-md bg-neutral-50 dark:bg-slate-800 text-sm capitalize'>
							<Wind className='w-4 h-4 text-neutral-400' />
							{unit.ac_type}
						</div>
					</div>
				)}

				{unit.internet_status && (
					<div className='md:col-span-4 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("internet-label")}
						</Label>
						<div className='h-12 px-4 flex items-center gap-2 border border-neutral-200 dark:border-slate-600 rounded-md bg-neutral-50 dark:bg-slate-800 text-sm capitalize'>
							<Wifi className='w-4 h-4 text-neutral-400' />
							{unit.internet_status}
						</div>
					</div>
				)}

				{/* ════ Financial ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("financial-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("monthly-rent-label")}
					</Label>
					<Input
						className='h-12 px-4 font-semibold'
						value={formatCurrency(unit.monthly_rent)}
						readOnly
					/>
				</div>

				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("security-deposit-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={formatCurrency(unit.security_deposit)}
						readOnly
					/>
				</div>

				{unit.min_lease_term && (
					<div className='md:col-span-4 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("min-lease-label")}
						</Label>
						<Input
							className='h-12 px-4'
							value={`${unit.min_lease_term} ${t("months")}`}
							readOnly
						/>
					</div>
				)}

				{/* Description */}
				{unit.description && (
					<>
						<div className='col-span-12 mt-2'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("description-section")}
							</h6>
							<Separator className='w-auto' />
						</div>
						<div className='col-span-12'>
							<Textarea
								value={unit.description}
								readOnly
								disabled
								className='h-24 px-4 py-3 resize-none'
							/>
						</div>
					</>
				)}

				{/* ════ Property Info ════ */}
				{unit.property && (
					<>
						<div className='col-span-12 mt-2'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("property-section")}
							</h6>
							<Separator className='w-auto' />
						</div>

						{unit.property.cover && (
							<div className='col-span-12'>
								<img
									src={unit.property.cover}
									alt={unit.property.name}
									className='w-full h-36 object-cover rounded-xl border border-neutral-200 dark:border-slate-600'
								/>
							</div>
						)}

						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("property-name-label")}
							</Label>
							<Input
								className='h-12 px-4'
								value={unit.property.name ?? "—"}
								readOnly
							/>
						</div>

						<div className='md:col-span-6 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("property-type-label")}
							</Label>
							<Input
								className='h-12 px-4 capitalize'
								value={unit.property.type ?? "—"}
								readOnly
							/>
						</div>

						<div className='col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("property-address-label")}
							</Label>
							<Input
								className='h-12 px-4'
								value={
									[unit.property.address_line_1, unit.property.address_line_2]
										.filter(Boolean)
										.join(", ") || "—"
								}
								readOnly
							/>
						</div>

						<div className='md:col-span-4 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("property-floors-label")}
							</Label>
							<Input
								className='h-12 px-4 text-center'
								value={unit.property.floors_count ?? "—"}
								readOnly
							/>
						</div>

						<div className='md:col-span-4 col-span-12'>
							<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
								{t("property-units-label")}
							</Label>
							<Input
								className='h-12 px-4 text-center'
								value={unit.property.units_count ?? "—"}
								readOnly
							/>
						</div>

						{unit.property.concierge_phone && (
							<div className='md:col-span-4 col-span-12'>
								<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
									{t("property-concierge-label")}
								</Label>
								<Input
									className='h-12 px-4'
									value={unit.property.concierge_phone}
									readOnly
								/>
							</div>
						)}

						{unit.property.amenities?.length > 0 && (
							<div className='col-span-12'>
								<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
									{t("property-amenities-label")}
								</Label>
								<div className='flex flex-wrap gap-2'>
									{unit.property.amenities.map((amenity: string) => (
										<span
											key={amenity}
											className='px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary capitalize'>
											{amenity.replace(/_/g, " ")}
										</span>
									))}
								</div>
							</div>
						)}
					</>
				)}

				{/* Gallery */}
				{unit.gallery?.filter(Boolean).length > 0 && (
					<>
						<div className='col-span-12 mt-2'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("gallery-section")}
							</h6>
							<Separator className='w-auto' />
						</div>
						<div className='col-span-12'>
							<div className='grid grid-cols-3 gap-2'>
								{unit.gallery.filter(Boolean).map((img: string, i: number) => (
									<a
										key={i}
										href={img}
										target='_blank'
										rel='noopener noreferrer'>
										<img
											src={img}
											alt={`unit-gallery-${i}`}
											className='w-full h-28 object-cover rounded-lg border border-neutral-200 dark:border-slate-600 hover:opacity-80 transition-opacity'
										/>
									</a>
								))}
							</div>
						</div>
					</>
				)}
			</div>

			<Separator className='w-auto my-4' />

			<div className='flex items-center justify-center'>
				<DialogClose asChild>
					<Button className='h-12 text-base px-14 py-3 rounded-lg'>
						{t("close-button-text")}
					</Button>
				</DialogClose>
			</div>
		</div>
	);
};

export default ShowCurrentUnit;
