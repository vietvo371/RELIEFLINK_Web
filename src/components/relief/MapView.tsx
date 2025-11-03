"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapViewProps {
  markers?: Array<{
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    type: "request" | "center" | "distribution";
  }>;
}

export default function MapView({ markers = [] }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // If no token, show placeholder
    if (!mapboxToken || mapboxToken === "your_mapbox_token") {
      console.warn("Mapbox token not configured. Using placeholder map.");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.6297, 10.8231], // Ho Chi Minh City
      zoom: 6,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add new markers
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.cursor = "pointer";

      // Different colors for different types
      if (marker.type === "request") {
        el.style.backgroundColor = "#ef4444"; // red
      } else if (marker.type === "center") {
        el.style.backgroundColor = "#3b82f6"; // blue
      } else {
        el.style.backgroundColor = "#22c55e"; // green
      }

      new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${marker.title}</h3>`))
        .addTo(map.current!);
    });
  }, [markers, mapLoaded]);

  // Placeholder if no Mapbox token
  if (
    !process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "your_mapbox_token"
  ) {
    return (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Bản đồ sẽ hiển thị ở đây
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            (Cần cấu hình NEXT_PUBLIC_MAPBOX_TOKEN)
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
}

