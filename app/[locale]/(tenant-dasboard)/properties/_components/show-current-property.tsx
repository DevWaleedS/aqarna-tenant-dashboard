"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { DialogClose } from "@/components/ui/dialog";
import { Loader2, MapPin, Phone, Building2 } from "lucide-react";
import { useProperty } from "@/hooks/queries/usePropertiesQuery";

interface ShowCurrentPropertyProps {
	propertyId: number | string;
	onClose?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
	residential:
		"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	commercial:
		"bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
	industrial: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const ShowCurrentProperty = ({
	propertyId,
	onClose,
}: ShowCurrentPropertyProps) => {
	const t = useTranslations("tenant.properties.show-current-property-page");
	const tAmenities = useTranslations("tenant.properties.amenities");
	const { property, isLoading } = useProperty(propertyId);

	if (isLoading) {
		return (
			<div className='flex justify-center items-center py-16'>
				<Loader2 className='animate-spin h-8 w-8' />
			</div>
		);
	}

	if (!property) {
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
				{property.cover && (
					<div className='col-span-12'>
						<img
							src={property.cover}
							alt={property.name}
							className='w-full h-52 object-cover rounded-xl border border-neutral-200 dark:border-slate-600'
						/>
					</div>
				)}

				{/* ════ Property Information ════ */}
				<div className='col-span-12'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("basic-info-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Name */}
				<div className='md:col-span-8 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("name-label")}
					</Label>
					<Input className='h-12 px-4' value={property.name ?? "—"} readOnly />
				</div>

				{/* Type badge */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("type-label")}
					</Label>
					<div className='h-12 px-4 flex items-center'>
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[property.type] ?? "bg-gray-100 text-gray-600"}`}>
							{property.type ?? "—"}
						</span>
					</div>
				</div>

				{/* Building Number */}
				{property.building_number && (
					<div className='md:col-span-4 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("building-number-label")}
						</Label>
						<div className='h-12 px-4 flex items-center gap-2 border border-neutral-200 dark:border-slate-600 rounded-md bg-neutral-50 dark:bg-slate-800 text-sm font-mono'>
							<Building2 className='w-4 h-4 text-neutral-400' />
							{property.building_number}
						</div>
					</div>
				)}

				{/* Floors */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("floors-label")}
					</Label>
					<Input
						className='h-12 px-4 text-center'
						value={property.floors_count ?? "—"}
						readOnly
					/>
				</div>

				{/* Units count */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("units-label")}
					</Label>
					<Input
						className='h-12 px-4 text-center'
						value={property.units_count ?? "—"}
						readOnly
					/>
				</div>

				{/* Area */}
				<div className='md:col-span-4 col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("area-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={property.area ? `${property.area} m²` : "—"}
						readOnly
					/>
				</div>

				{/* Concierge Phone */}
				{property.concierge_phone && (
					<div className='md:col-span-6 col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("concierge-label")}
						</Label>
						<div className='h-12 px-4 flex items-center gap-2 border border-neutral-200 dark:border-slate-600 rounded-md bg-neutral-50 dark:bg-slate-800 text-sm'>
							<Phone className='w-4 h-4 text-neutral-400' />
							{property.concierge_phone}
						</div>
					</div>
				)}

				{/* ════ Address ════ */}
				<div className='col-span-12 mt-2'>
					<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
						{t("address-section")}
					</h6>
					<Separator className='w-auto' />
				</div>

				{/* Address Line 1 */}
				<div className='col-span-12'>
					<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
						{t("address-line-1-label")}
					</Label>
					<Input
						className='h-12 px-4'
						value={property.address_line_1 ?? "—"}
						readOnly
					/>
				</div>

				{/* Address Line 2 */}
				{property.address_line_2 && (
					<div className='col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("address-line-2-label")}
						</Label>
						<Input
							className='h-12 px-4'
							value={property.address_line_2}
							readOnly
						/>
					</div>
				)}

				{/* Coordinates */}
				{(property.latitude || property.longitude) && (
					<div className='col-span-12'>
						<Label className='inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2'>
							{t("coordinates-label")}
						</Label>
						<div className='h-12 px-4 flex items-center gap-2 border border-neutral-200 dark:border-slate-600 rounded-md bg-neutral-50 dark:bg-slate-800 text-sm font-mono'>
							<MapPin className='w-4 h-4 text-neutral-400 shrink-0' />
							{[property.latitude, property.longitude]
								.filter(Boolean)
								.join(", ")}
						</div>
					</div>
				)}

				{/* ════ Amenities ════ */}
				{property.amenities?.length > 0 && (
					<>
						<div className='col-span-12 mt-2'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("amenities-label")}
							</h6>
							<Separator className='w-auto' />
						</div>
						<div className='col-span-12'>
							<div className='flex flex-wrap gap-2'>
								{property.amenities.map((amenity: string) => (
									<span
										key={amenity}
										className='px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary capitalize'>
										{tAmenities(amenity as any)}
									</span>
								))}
							</div>
						</div>
					</>
				)}

				{/* ════ Gallery ════ */}
				{property.gallery?.filter(Boolean).length > 0 && (
					<>
						<div className='col-span-12 mt-2'>
							<h6 className='text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-1'>
								{t("gallery-section")}
							</h6>
							<Separator className='w-auto' />
						</div>
						<div className='col-span-12'>
							<div className='grid grid-cols-3 gap-2'>
								{property.gallery
									.filter(Boolean)
									.map((img: string, i: number) => (
										<a
											key={i}
											href={img}
											target='_blank'
											rel='noopener noreferrer'>
											<img
												src={img}
												alt={`property-gallery-${i}`}
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

export default ShowCurrentProperty;
