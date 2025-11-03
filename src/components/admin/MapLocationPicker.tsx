"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export interface Coordinates {
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
  isActive: boolean;
  interactive?: boolean;
  height?: number;
  markerColor?: string;
  instructions?: string;
}

const DEFAULT_CENTER: [number, number] = [106.6297, 10.8231];
const FALLBACK_TOKEN =
  "pk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtZ3ZxazFmbDBndnMyanIxMzN0dHV1eGcifQ.lhk4cDYUEIozqnFfkSebaw";

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  value,
  onChange,
  isActive,
  interactive = true,
  height = 260,
  markerColor = "#F97316",
  instructions = "Nhấp vào bản đồ để chọn vị trí",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef<Coordinates | null>(value);
  const [hasToken, setHasToken] = useState(true);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const token =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN || FALLBACK_TOKEN;
    const isValidToken =
      token && token !== "your_mapbox_token" && token.trim() !== "";

    if (!isValidToken) {
      setHasToken(false);
      return;
    }

    setHasToken(true);
    mapboxgl.accessToken = token;

    if (!containerRef.current || mapRef.current) return;

    const initialCoords = valueRef.current;
    const mapInstance = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCoords
        ? [initialCoords.lng, initialCoords.lat]
        : DEFAULT_CENTER,
      zoom: initialCoords ? 10 : 5,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl());

    const handleClick = (event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      if (!interactive) return;
      const coords = { lat: event.lngLat.lat, lng: event.lngLat.lng };
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: markerColor });
      }
      markerRef.current.setLngLat([coords.lng, coords.lat]).addTo(mapInstance);
      onChangeRef.current(coords);
    };

    mapInstance.on("click", handleClick);

    if (initialCoords) {
      markerRef.current = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([initialCoords.lng, initialCoords.lat])
        .addTo(mapInstance);
    }

    mapRef.current = mapInstance;

    setTimeout(() => mapInstance.resize(), 250);

    return () => {
      mapInstance.off("click", handleClick);
      mapInstance.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [interactive, markerColor]);

  useEffect(() => {
    if (!mapRef.current || !hasToken) return;
    mapRef.current.resize();
  }, [isActive, hasToken]);

  useEffect(() => {
    if (!mapRef.current || !hasToken) return;
    const mapInstance = mapRef.current;

    if (value) {
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: markerColor });
      }
      markerRef.current.setLngLat([value.lng, value.lat]).addTo(mapInstance);
      mapInstance.easeTo({
        center: [value.lng, value.lat],
        zoom: Math.max(mapInstance.getZoom(), 10),
        duration: 500,
      });
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [value, hasToken, markerColor]);

  if (!hasToken) {
    return (
      <div className="flex h-[260px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-500 dark:border-white/[0.08] dark:bg-gray-900/40 dark:text-gray-400">
        <p>Không tìm thấy Mapbox token hợp lệ.</p>
        <p>
          Vui lòng cấu hình biến môi trường{" "}
          <code className="font-mono text-gray-700 dark:text-gray-200">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div ref={containerRef} style={{ height }} className="w-full" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-900/80 dark:text-gray-200">
        {interactive ? instructions : "Chế độ xem"}
      </div>
    </div>
  );
};

export default MapLocationPicker;
