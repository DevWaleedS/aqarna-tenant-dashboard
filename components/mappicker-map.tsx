"use client";

/**
 * MapPickerMap.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Inner Leaflet map — always imported via `dynamic(..., { ssr: false })`.
 * Never render this directly in an SSR context.
 */

import { useEffect, useRef } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	useMapEvents,
	useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LatLng } from "./location-picker-input";

// ─── Fix Leaflet default icon paths broken by webpack ────────────────────────
const fixLeafletIcons = () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	delete (L.Icon.Default.prototype as any)._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl:
			"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
		iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
		shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	});
};

// ─── Custom primary-colored marker icon ──────────────────────────────────────
const createPrimaryIcon = () =>
	L.divIcon({
		className: "",
		html: `
      <div style="
        position: relative;
        width: 32px;
        height: 44px;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      ">
        <svg viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg" width="32" height="44">
          <defs>
            <radialGradient id="pg" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stop-color="hsl(var(--primary) / 1)" />
              <stop offset="100%" stop-color="hsl(var(--primary) / 0.8)" />
            </radialGradient>
          </defs>
          <path
            d="M16 0 C7.163 0 0 7.163 0 16 C0 27 16 44 16 44 C16 44 32 27 32 16 C32 7.163 24.837 0 16 0 Z"
            fill="hsl(221.2 83.2% 53.3%)"
          />
          <circle cx="16" cy="16" r="7" fill="white" opacity="0.95" />
          <circle cx="16" cy="16" r="4" fill="hsl(221.2 83.2% 53.3%)" />
        </svg>
      </div>
    `,
		iconSize: [32, 44],
		iconAnchor: [16, 44],
		popupAnchor: [0, -44],
	});

// ─── Sub-component: sync map center when coords change ───────────────────────
const MapCenterSyncer: React.FC<{ center: LatLng }> = ({ center }) => {
	const map = useMap();
	const prevCenter = useRef<LatLng | null>(null);

	useEffect(() => {
		if (
			!prevCenter.current ||
			prevCenter.current.lat !== center.lat ||
			prevCenter.current.lng !== center.lng
		) {
			map.flyTo([center.lat, center.lng], Math.max(map.getZoom(), 13), {
				duration: 0.8,
				easeLinearity: 0.25,
			});
			prevCenter.current = center;
		}
	}, [center, map]);

	return null;
};

// ─── Sub-component: click handler ────────────────────────────────────────────
const ClickHandler: React.FC<{ onMarkerChange: (c: LatLng) => void }> = ({
	onMarkerChange,
}) => {
	useMapEvents({
		click(e) {
			onMarkerChange({ lat: e.latlng.lat, lng: e.latlng.lng });
		},
	});
	return null;
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface MapPickerMapProps {
	center: LatLng;
	marker: LatLng | null;
	onMarkerChange: (coords: LatLng) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
const MapPickerMap: React.FC<MapPickerMapProps> = ({
	center,
	marker,
	onMarkerChange,
}) => {
	useEffect(() => {
		fixLeafletIcons();
	}, []);

	const icon = createPrimaryIcon();

	return (
		<MapContainer
			center={[center.lat, center.lng]}
			zoom={13}
			style={{ width: "100%", height: "100%" }}
			zoomControl={true}
			attributionControl={false}>
			{/* OpenStreetMap tiles */}
			<TileLayer
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			/>

			{/* Sync center when external source (search/gps/manual) changes */}
			<MapCenterSyncer center={center} />

			{/* Click to place marker */}
			<ClickHandler onMarkerChange={onMarkerChange} />

			{/* Draggable marker */}
			{marker && (
				<Marker
					position={[marker.lat, marker.lng]}
					icon={icon}
					draggable
					eventHandlers={{
						dragend(e) {
							const pos = (e.target as L.Marker).getLatLng();
							onMarkerChange({ lat: pos.lat, lng: pos.lng });
						},
					}}
				/>
			)}
		</MapContainer>
	);
};

export default MapPickerMap;
