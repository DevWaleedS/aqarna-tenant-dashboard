"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	MapPin,
	Search,
	Navigation2,
	SlidersHorizontal,
	Loader2,
	X,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LatLng {
	lat: number;
	lng: number;
}

interface SearchResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
}

export interface LocationPickerInputProps {
	latitude: string;
	longitude: string;
	onLocationChange: (lat: string, lng: string) => void;
	className?: string;
}

// ─── Dynamic map import (avoids SSR crash with Leaflet) ──────────────────────

const MapPickerMap = dynamic(() => import("./mappicker-map"), {
	ssr: false,
	loading: () => (
		<div className='flex flex-col items-center justify-center h-full gap-3 bg-neutral-50 dark:bg-slate-900'>
			<Loader2 className='animate-spin h-7 w-7 text-primary' />
			<span className='text-sm text-neutral-400'>Loading map…</span>
		</div>
	),
});

// ─── Mode tabs ────────────────────────────────────────────────────────────────

type Mode = "search" | "gps" | "manual";

const MODES: { key: Mode; Icon: React.ElementType }[] = [
	{ key: "search", Icon: Search },
	{ key: "gps", Icon: Navigation2 },
	{ key: "manual", Icon: SlidersHorizontal },
];

// ─── Component ───────────────────────────────────────────────────────────────

const LocationPickerInput: React.FC<LocationPickerInputProps> = ({
	latitude,
	longitude,
	onLocationChange,
	className,
}) => {
	const t = useTranslations("shared.location-picker");

	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<Mode>("search");

	// Temporary state inside the dialog
	const [tempCoords, setTempCoords] = useState<LatLng | null>(null);

	// Search state
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);
	const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	// Manual state
	const [manualLat, setManualLat] = useState("");
	const [manualLng, setManualLng] = useState("");
	const [manualError, setManualError] = useState<string | null>(null);

	// GPS state
	const [gpsLoading, setGpsLoading] = useState(false);
	const [gpsError, setGpsError] = useState<string | null>(null);

	// Reverse geocode label
	const [locationLabel, setLocationLabel] = useState<string | null>(null);
	const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

	// ── sync initial values into dialog when it opens ──────────────────────────
	useEffect(() => {
		if (open) {
			const lat = parseFloat(latitude);
			const lng = parseFloat(longitude);
			if (!isNaN(lat) && !isNaN(lng)) {
				setTempCoords({ lat, lng });
				setManualLat(String(lat));
				setManualLng(String(lng));
			} else {
				setTempCoords(null);
				setManualLat("");
				setManualLng("");
			}
			setQuery("");
			setSearchResults([]);
			setSearchError(null);
			setManualError(null);
			setGpsError(null);
			setLocationLabel(null);
		}
	}, [open, latitude, longitude]);

	// ── reverse geocode whenever tempCoords changes ─────────────────────────────
	useEffect(() => {
		if (!tempCoords) {
			setLocationLabel(null);
			return;
		}
		let cancelled = false;
		setIsReverseGeocoding(true);
		fetch(
			`https://nominatim.openstreetmap.org/reverse?lat=${tempCoords.lat}&lon=${tempCoords.lng}&format=json`,
			{ headers: { "Accept-Language": "en" } },
		)
			.then((r) => r.json())
			.then((d) => {
				if (!cancelled) setLocationLabel(d.display_name ?? null);
			})
			.catch(() => {
				if (!cancelled) setLocationLabel(null);
			})
			.finally(() => {
				if (!cancelled) setIsReverseGeocoding(false);
			});
		return () => {
			cancelled = true;
		};
	}, [tempCoords]);

	// ── Search (Nominatim) ──────────────────────────────────────────────────────
	const handleSearch = useCallback(
		(q: string) => {
			setQuery(q);
			setSearchError(null);
			if (searchTimeout.current) clearTimeout(searchTimeout.current);
			if (!q.trim()) {
				setSearchResults([]);
				return;
			}
			searchTimeout.current = setTimeout(async () => {
				setIsSearching(true);
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
						{ headers: { "Accept-Language": "en" } },
					);
					const data: SearchResult[] = await res.json();
					setSearchResults(data);
					if (!data.length) setSearchError(t("no-results"));
				} catch {
					setSearchError(t("search-error"));
				} finally {
					setIsSearching(false);
				}
			}, 500);
		},
		[t],
	);

	// ── GPS ────────────────────────────────────────────────────────────────────
	const handleGPS = useCallback(() => {
		if (!navigator.geolocation) {
			setGpsError(t("gps-not-supported"));
			return;
		}
		setGpsLoading(true);
		setGpsError(null);
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setTempCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
				setGpsLoading(false);
			},
			() => {
				setGpsError(t("gps-denied"));
				setGpsLoading(false);
			},
		);
	}, [t]);

	// ── Manual apply ──────────────────────────────────────────────────────────
	const handleManualApply = useCallback(() => {
		const lat = parseFloat(manualLat);
		const lng = parseFloat(manualLng);
		if (
			isNaN(lat) ||
			lat < -90 ||
			lat > 90 ||
			isNaN(lng) ||
			lng < -180 ||
			lng > 180
		) {
			setManualError(t("manual-invalid"));
			return;
		}
		setManualError(null);
		setTempCoords({ lat, lng });
	}, [manualLat, manualLng, t]);

	// ── Confirm ────────────────────────────────────────────────────────────────
	const handleConfirm = useCallback(() => {
		if (!tempCoords) return;
		onLocationChange(String(tempCoords.lat), String(tempCoords.lng));
		setOpen(false);
	}, [tempCoords, onLocationChange]);

	// ── Display value ─────────────────────────────────────────────────────────
	const hasValue =
		latitude &&
		longitude &&
		!isNaN(parseFloat(latitude)) &&
		!isNaN(parseFloat(longitude));

	return (
		<>
			{/* ── Trigger card ──────────────────────────────────────────────────── */}
			<div
				className={cn(
					"group relative flex items-center gap-3 h-12 px-4 rounded-lg border bg-white dark:bg-slate-900",
					"border-neutral-200 dark:border-slate-700 cursor-pointer",
					"hover:border-primary/60 hover:shadow-sm transition-all duration-200",
					className,
				)}
				onClick={() => setOpen(true)}
				role='button'
				tabIndex={0}
				onKeyDown={(e) => e.key === "Enter" && setOpen(true)}>
				<MapPin
					className={cn(
						"h-4 w-4 shrink-0 transition-colors",
						hasValue ? "text-primary" : "text-neutral-400",
					)}
				/>

				<div className='flex-1 min-w-0'>
					{hasValue ? (
						<span className='font-mono text-sm text-neutral-700 dark:text-neutral-200 truncate block'>
							{parseFloat(latitude).toFixed(6)},&nbsp;
							{parseFloat(longitude).toFixed(6)}
						</span>
					) : (
						<span className='text-sm text-neutral-400'>
							{t("trigger-placeholder")}
						</span>
					)}
				</div>

				<span className='text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
					{t("trigger-action")}
				</span>

				{hasValue && (
					<button
						type='button'
						onClick={(e) => {
							e.stopPropagation();
							onLocationChange("", "");
						}}
						className='shrink-0 p-0.5 rounded text-neutral-400 hover:text-red-500 transition-colors'>
						<X className='h-3.5 w-3.5' />
					</button>
				)}
			</div>

			{/* ── Dialog ───────────────────────────────────────────────────────────── */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='md:max-w-5xl max-w-3xl w-full p-0 overflow-hidden gap-0 rounded-2xl border-0 shadow-2xl'>
					{/* Header */}
					<DialogHeader className='px-5 pt-5 pb-0'>
						<DialogTitle className='flex items-center gap-2 text-base font-semibold text-neutral-800 dark:text-neutral-100'>
							<div className='flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10'>
								<MapPin className='h-4 w-4 text-primary' />
							</div>
							{t("dialog-title")}
						</DialogTitle>
					</DialogHeader>

					{/* Mode tabs */}
					<div className='flex items-center gap-1 px-5 pt-4 pb-3'>
						{MODES.map(({ key, Icon }) => (
							<button
								key={key}
								type='button'
								onClick={() => {
									setMode(key);
									setSearchResults([]);
									setManualError(null);
									setGpsError(null);
								}}
								className={cn(
									"inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
									mode === key
										? "bg-primary text-primary-foreground border-primary shadow-sm"
										: "bg-neutral-50 dark:bg-slate-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-slate-600 hover:border-primary/50 hover:text-primary",
								)}>
								<Icon className='h-3 w-3' />
								{t(`mode-${key}`)}
							</button>
						))}
					</div>

					{/* Mode panel */}
					<div className='px-5 pb-3'>
						{/* ── SEARCH ── */}
						{mode === "search" && (
							<div className='space-y-2'>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none' />
									{isSearching && (
										<Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin' />
									)}
									<Input
										className='h-10 pl-9 pr-9 text-sm'
										placeholder={t("search-placeholder")}
										value={query}
										onChange={(e) => handleSearch(e.target.value)}
										autoFocus
									/>
								</div>

								{searchError && (
									<p className='flex items-center gap-1.5 text-xs text-neutral-400'>
										<AlertCircle className='h-3.5 w-3.5' />
										{searchError}
									</p>
								)}

								{searchResults.length > 0 && (
									<div className='border dark:border-slate-700 rounded-lg overflow-hidden divide-y dark:divide-slate-700 shadow-sm'>
										{searchResults.map((r) => (
											<button
												key={r.place_id}
												type='button'
												onClick={() => {
													setTempCoords({
														lat: parseFloat(r.lat),
														lng: parseFloat(r.lon),
													});
													setSearchResults([]);
													setQuery("");
												}}
												className='w-full text-left px-3.5 py-2.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-primary/5 hover:text-primary transition-colors'>
												<span className='line-clamp-2'>{r.display_name}</span>
											</button>
										))}
									</div>
								)}
							</div>
						)}

						{/* ── GPS ── */}
						{mode === "gps" && (
							<div className='flex flex-col items-start gap-2'>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={handleGPS}
									disabled={gpsLoading}
									className='h-10 gap-2 text-sm'>
									{gpsLoading ? (
										<Loader2 className='h-4 w-4 animate-spin' />
									) : (
										<Navigation2 className='h-4 w-4 text-primary' />
									)}
									{gpsLoading ? t("gps-locating") : t("gps-button")}
								</Button>
								{gpsError && (
									<p className='flex items-center gap-1.5 text-xs text-red-500'>
										<AlertCircle className='h-3.5 w-3.5' />
										{gpsError}
									</p>
								)}
							</div>
						)}

						{/* ── MANUAL ── */}
						{mode === "manual" && (
							<div className='flex flex-wrap items-end gap-2'>
								<div className='flex-1 min-w-[120px]'>
									<Label className='text-xs font-medium text-neutral-500 mb-1.5 block'>
										{t("latitude-label")}
									</Label>
									<Input
										className='h-10 font-mono text-sm'
										placeholder='e.g. 30.044420'
										value={manualLat}
										onChange={(e) => {
											setManualLat(e.target.value);
											setManualError(null);
										}}
									/>
								</div>
								<div className='flex-1 min-w-[120px]'>
									<Label className='text-xs font-medium text-neutral-500 mb-1.5 block'>
										{t("longitude-label")}
									</Label>
									<Input
										className='h-10 font-mono text-sm'
										placeholder='e.g. 31.235712'
										value={manualLng}
										onChange={(e) => {
											setManualLng(e.target.value);
											setManualError(null);
										}}
									/>
								</div>
								<Button
									type='button'
									variant='outline'
									size='sm'
									className='h-10 px-4 shrink-0'
									onClick={handleManualApply}>
									{t("manual-apply")}
								</Button>
								{manualError && (
									<p className='w-full flex items-center gap-1.5 text-xs text-red-500'>
										<AlertCircle className='h-3.5 w-3.5' />
										{manualError}
									</p>
								)}
							</div>
						)}
					</div>

					{/* Map */}
					<div
						className='relative mx-5 rounded-xl overflow-hidden border border-neutral-200 dark:border-slate-700'
						style={{ height: 340 }}>
						<MapPickerMap
							center={tempCoords ?? { lat: 30.0444, lng: 31.2357 }} // Cairo fallback
							marker={tempCoords}
							onMarkerChange={(coords) => {
								setTempCoords(coords);
								setManualLat(String(coords.lat));
								setManualLng(String(coords.lng));
							}}
						/>

						{/* Map hint */}
						<div className='absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-[1000]'>
							<div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm'>
								<MapPin className='h-3 w-3 text-white' />
								<span className='text-xs text-white whitespace-nowrap'>
									{t("map-hint")}
								</span>
							</div>
						</div>
					</div>

					{/* Selected coordinates strip */}
					<div className='mx-5 mt-3 mb-1 flex items-start gap-3 min-h-[40px]'>
						{tempCoords ? (
							<>
								<div className='flex items-center gap-2 shrink-0'>
									<CheckCircle2 className='h-4 w-4 text-primary shrink-0 mt-0.5' />
									<div>
										<p className='font-mono text-xs text-neutral-700 dark:text-neutral-200'>
											{tempCoords.lat.toFixed(6)},&nbsp;
											{tempCoords.lng.toFixed(6)}
										</p>
										{isReverseGeocoding ? (
											<p className='text-[11px] text-neutral-400 mt-0.5'>
												{t("locating")}…
											</p>
										) : locationLabel ? (
											<p className='text-[11px] text-neutral-400 mt-0.5 line-clamp-1'>
												{locationLabel}
											</p>
										) : null}
									</div>
								</div>
							</>
						) : (
							<p className='text-xs text-neutral-400 mt-1'>{t("no-pin")}</p>
						)}
					</div>

					{/* Footer actions */}
					<div className='flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100 dark:border-slate-800 mt-2'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							className='h-9 px-5 text-sm text-neutral-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
							onClick={() => setOpen(false)}>
							{t("cancel")}
						</Button>
						<Button
							type='button'
							size='sm'
							className='h-9 px-6 text-sm'
							disabled={!tempCoords}
							onClick={handleConfirm}>
							{t("confirm")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default LocationPickerInput;
