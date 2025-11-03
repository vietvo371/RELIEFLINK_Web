"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  translateDistributionStatus,
  translatePriority,
  translateRequestStatus,
} from "@/lib/translations";

type MarkerType = "request" | "center" | "distribution";

interface ReliefMarker {
  id: number | string;
  latitude: number;
  longitude: number;
  title: string;
  type: MarkerType;
  priority?: string | null;
  status?: string | null;
  address?: string | null;
  description?: string | null;
  personCount?: number | null;
  resourceName?: string | null;
}

interface MapViewProps {
  markers?: ReliefMarker[];
}

const DATABASE_TAGS: Record<MarkerType, string> = {
  request: "yeu_cau_cuu_tros",
  center: "trung_tam_cuu_tros",
  distribution: "phan_phois",
};

const TYPE_COLORS: Record<MarkerType, string> = {
  request: "#EF4444",
  center: "#10B981",
  distribution: "#3B82F6",
};

const getTypeLabel = (type: MarkerType): string => {
  if (type === "center") return "Trung tâm cứu trợ";
  if (type === "distribution") return "Phân phối nguồn lực";
  return "Yêu cầu cứu trợ";
};

const PRIORITY_COLORS: Record<string, string> = {
  cao: "#EF4444",
  high: "#EF4444",
  trung_binh: "#F97316",
  medium: "#F97316",
  thap: "#FACC15",
  low: "#FACC15",
};

const getPriorityColor = (priority?: string | null) => {
  if (!priority) return "#EF4444";
  return PRIORITY_COLORS[priority] || "#EF4444";
};

const toFeatureCollection = (
  items: ReliefMarker[],
  type: MarkerType,
): FeatureCollection => ({
  type: "FeatureCollection",
  features: items.map((marker) => ({
    type: "Feature",
    properties: {
      id: marker.id,
      title: marker.title,
      type,
      entity: DATABASE_TAGS[type],
      priority: marker.priority ?? null,
      status: marker.status ?? null,
      address: marker.address ?? null,
      description: marker.description ?? null,
      personCount: marker.personCount ?? null,
      resourceName: marker.resourceName ?? null,
      color: type === "request" ? getPriorityColor(marker.priority) : TYPE_COLORS[type],
    },
    geometry: {
      type: "Point",
      coordinates: [marker.longitude, marker.latitude],
    },
  })),
});

const buildPopupContent = (type: MarkerType, properties: Record<string, any>): string => {
  const lines: string[] = [
    `<h3 class="font-semibold text-sm">${properties.title}</h3>`,
    `<p class="text-[11px] text-gray-500">${properties.entity}</p>`,
  ];

  if (type === "request") {
    if (properties.priority) {
      lines.push(
        `<p class="text-xs text-gray-600">Ưu tiên: ${translatePriority(properties.priority)}</p>`,
      );
    }
    if (properties.personCount) {
      lines.push(
        `<p class="text-xs text-gray-600">Số người ảnh hưởng: ${properties.personCount}</p>`,
      );
    }
    if (properties.status) {
      lines.push(
        `<p class="text-xs text-gray-600">Trạng thái: ${translateRequestStatus(
          properties.status,
        )}</p>`,
      );
    }
  }

  if (type === "center") {
    lines.push(
      `<p class="text-xs text-gray-600">${
        properties.address || "Chưa cập nhật địa chỉ"
      }</p>`,
    );
    if (properties.description) {
      lines.push(`<p class="text-xs text-gray-500">${properties.description}</p>`);
    }
  }

  if (type === "distribution") {
    if (properties.resourceName) {
      lines.push(
        `<p class="text-xs text-gray-600">Nguồn lực: ${properties.resourceName}</p>`,
      );
    }
    if (properties.status) {
      lines.push(
        `<p class="text-xs text-gray-600">Trạng thái: ${translateDistributionStatus(
          properties.status,
        )}</p>`,
      );
    }
  }

  return `<div class="p-2 space-y-1">${lines.join("")}</div>`;
};

export default function MapView({ markers = [] }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const sanitizedMarkers = useMemo(
    () =>
      markers
        .filter(
          (marker) =>
            Number.isFinite(marker.latitude) &&
            Number.isFinite(marker.longitude) &&
            marker.latitude !== null &&
            marker.longitude !== null,
        )
        .map((marker) => ({
          ...marker,
          latitude: Number(marker.latitude),
          longitude: Number(marker.longitude),
        })),
    [markers],
  );

  const groupedMarkers = useMemo(
    () => ({
      request: sanitizedMarkers.filter((marker) => marker.type === "request"),
      center: sanitizedMarkers.filter((marker) => marker.type === "center"),
      distribution: sanitizedMarkers.filter((marker) => marker.type === "distribution"),
    }),
    [sanitizedMarkers],
  );

  const geoJsonData = useMemo(
    () => ({
      requests: toFeatureCollection(groupedMarkers.request, "request"),
      centers: toFeatureCollection(groupedMarkers.center, "center"),
      distributions: toFeatureCollection(groupedMarkers.distribution, "distribution"),
    }),
    [groupedMarkers],
  );

  const totals = useMemo(
    () => ({
      request: groupedMarkers.request.length,
      center: groupedMarkers.center.length,
      distribution: groupedMarkers.distribution.length,
    }),
    [groupedMarkers],
  );

  const urgentRequests = useMemo(
    () =>
      groupedMarkers.request.filter(
        (marker) => marker.priority === "cao" || marker.priority === "high",
      ).length,
    [groupedMarkers],
  );

  const activeDistributions = useMemo(
    () =>
      groupedMarkers.distribution.filter(
        (marker) =>
          marker.status &&
          marker.status !== "hoan_thanh" &&
          marker.status !== "completed",
      ).length,
    [groupedMarkers],
  );

  const prioritySummary = useMemo(() => {
    const levels = ["thap", "trung_binh", "cao"] as const;
    return levels.map((level) => ({
      level,
      label: translatePriority(level),
      color: getPriorityColor(level),
      count: groupedMarkers.request.filter((marker) => marker.priority === level).length,
    }));
  }, [groupedMarkers]);

  useEffect(() => {
    const mapboxToken =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      "pk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtZ3ZxazFmbDBndnMyanIxMzN0dHV1eGcifQ.lhk4cDYUEIozqnFfkSebaw";

    const isValidToken =
      mapboxToken && mapboxToken !== "your_mapbox_token" && mapboxToken.trim() !== "";

    if (!isValidToken) {
      console.warn("Mapbox token not configured. Using placeholder map.");
      setHasToken(false);
      return;
    }

    setHasToken(true);
    mapboxgl.accessToken = mapboxToken;
  }, []);

  useEffect(() => {
    if (!hasToken || map.current || !mapContainer.current) return;

    const defaultCenter: [number, number] = [106.6297, 10.8231];
    const defaultZoom = 6;

    let center = defaultCenter;
    let zoom = defaultZoom;

    if (sanitizedMarkers.length > 0) {
      if (sanitizedMarkers.length === 1) {
        center = [sanitizedMarkers[0].longitude, sanitizedMarkers[0].latitude];
        zoom = 10;
      } else {
        const avgLat =
          sanitizedMarkers.reduce((sum, marker) => sum + marker.latitude, 0) /
          sanitizedMarkers.length;
        const avgLng =
          sanitizedMarkers.reduce((sum, marker) => sum + marker.longitude, 0) /
          sanitizedMarkers.length;
        center = [avgLng, avgLat];
        zoom = 7;
      }
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
      pitch: 35,
      bearing: -15,
      antialias: true,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [hasToken, sanitizedMarkers]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !hasToken) return;

    const mapInstance = map.current;

    const ensureSource = (sourceId: string, data: FeatureCollection) => {
      const source = mapInstance.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
      if (source) {
        source.setData(data);
      } else {
        mapInstance.addSource(sourceId, { type: "geojson", data });
      }
    };

    ensureSource("requests", geoJsonData.requests);
    ensureSource("centers", geoJsonData.centers);
    ensureSource("distributions", geoJsonData.distributions);

    if (!mapInstance.getLayer("requests-pulse")) {
      mapInstance.addLayer({
        id: "requests-pulse",
        type: "circle",
        source: "requests",
        paint: {
          "circle-radius": 18,
          "circle-color": ["get", "color"],
          "circle-opacity": 0.25,
          "circle-blur": 0.8,
        },
      });
    }

    if (!mapInstance.getLayer("requests-circle")) {
      mapInstance.addLayer({
        id: "requests-circle",
        type: "circle",
        source: "requests",
        paint: {
          "circle-radius": 9,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9,
        },
      });

      mapInstance.on("click", "requests-circle", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const coordinates = [...((feature.geometry as any).coordinates || [])];
        const { lng } = event.lngLat;

        while (Math.abs(lng - coordinates[0]) > 180) {
          coordinates[0] += lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup({ maxWidth: "260px" })
          .setLngLat(coordinates as [number, number])
          .setHTML(buildPopupContent("request", feature.properties as Record<string, any>))
          .addTo(mapInstance);
      });

      mapInstance.on("mouseenter", "requests-circle", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });

      mapInstance.on("mouseleave", "requests-circle", () => {
        mapInstance.getCanvas().style.cursor = "";
      });
    }

    if (!mapInstance.getLayer("centers-pulse")) {
      mapInstance.addLayer({
        id: "centers-pulse",
        type: "circle",
        source: "centers",
        paint: {
          "circle-radius": 20,
          "circle-color": TYPE_COLORS.center,
          "circle-opacity": 0.18,
          "circle-blur": 0.8,
        },
      });
    }

    if (!mapInstance.getLayer("centers-circle")) {
      mapInstance.addLayer({
        id: "centers-circle",
        type: "circle",
        source: "centers",
        paint: {
          "circle-radius": 11,
          "circle-color": TYPE_COLORS.center,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.85,
        },
      });

      mapInstance.on("click", "centers-circle", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const coordinates = [...((feature.geometry as any).coordinates || [])];
        const { lng } = event.lngLat;

        while (Math.abs(lng - coordinates[0]) > 180) {
          coordinates[0] += lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup({ maxWidth: "260px" })
          .setLngLat(coordinates as [number, number])
          .setHTML(buildPopupContent("center", feature.properties as Record<string, any>))
          .addTo(mapInstance);
      });

      mapInstance.on("mouseenter", "centers-circle", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });

      mapInstance.on("mouseleave", "centers-circle", () => {
        mapInstance.getCanvas().style.cursor = "";
      });
    }

    if (!mapInstance.getLayer("distributions-pulse")) {
      mapInstance.addLayer({
        id: "distributions-pulse",
        type: "circle",
        source: "distributions",
        paint: {
          "circle-radius": 16,
          "circle-color": TYPE_COLORS.distribution,
          "circle-opacity": 0.2,
          "circle-blur": 0.7,
        },
      });
    }

    if (!mapInstance.getLayer("distributions-circle")) {
      mapInstance.addLayer({
        id: "distributions-circle",
        type: "circle",
        source: "distributions",
        paint: {
          "circle-radius": 8,
          "circle-color": TYPE_COLORS.distribution,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9,
        },
      });

      mapInstance.on("click", "distributions-circle", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const coordinates = [...((feature.geometry as any).coordinates || [])];
        const { lng } = event.lngLat;

        while (Math.abs(lng - coordinates[0]) > 180) {
          coordinates[0] += lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup({ maxWidth: "260px" })
          .setLngLat(coordinates as [number, number])
          .setHTML(
            buildPopupContent("distribution", feature.properties as Record<string, any>),
          )
          .addTo(mapInstance);
      });

      mapInstance.on("mouseenter", "distributions-circle", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });

      mapInstance.on("mouseleave", "distributions-circle", () => {
        mapInstance.getCanvas().style.cursor = "";
      });
    }
  }, [geoJsonData, mapLoaded, hasToken]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !hasToken) return;
    if (sanitizedMarkers.length === 0) return;

    const mapInstance = map.current;
    const bounds = new mapboxgl.LngLatBounds();

    sanitizedMarkers.forEach((marker) => {
      bounds.extend([marker.longitude, marker.latitude]);
    });

    if (sanitizedMarkers.length === 1) {
      const marker = sanitizedMarkers[0];
      mapInstance.easeTo({
        center: [marker.longitude, marker.latitude],
        zoom: 11,
        duration: 1000,
      });
    } else if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, {
        padding: 60,
        maxZoom: 12,
        duration: 1200,
      });
    }
  }, [sanitizedMarkers, mapLoaded, hasToken]);

  if (!hasToken) {
    return (
      <div className="relative flex h-full w-full items-center justify-center rounded-lg bg-gray-200 p-6 dark:bg-gray-700">
        <div className="text-center">
          <p className="mb-2 text-gray-600 dark:text-gray-300">Bản đồ sẽ hiển thị ở đây</p>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            (Cần cấu hình NEXT_PUBLIC_MAPBOX_TOKEN)
          </p>
          {sanitizedMarkers.length > 0 && (
            <div className="mt-4 rounded-lg bg-white/60 p-4 text-left shadow-sm backdrop-blur dark:bg-gray-800/60">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Tổng hợp dữ liệu
              </p>
              {(["request", "center", "distribution"] as MarkerType[]).map((type) => (
                <div
                  key={type}
                  className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300"
                >
                  <span>{DATABASE_TAGS[type]}</span>
                  <span>{totals[type]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />

      {mapLoaded && (
        <>
          <div className="absolute left-4 top-4 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-gray-900/80">
            {/* <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
              Trạng thái hiện tại
            </div>
            <div className="mt-2 space-y-1">
              {(["request", "center", "distribution"] as MarkerType[]).map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[type] }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {getTypeLabel(type)}: {totals[type]}
                  </span>
                </div>
              ))}
            </div> */}
            {/* {urgentRequests > 0 && (
              <div className="mt-2 rounded bg-red-100 px-2 py-1 text-[11px] font-medium text-red-600 dark:bg-red-900/20 dark:text-red-300">
                Ưu tiên cao: {urgentRequests}
              </div>
            )} */}
            {activeDistributions > 0 && (
              <div className="mt-1 text-[11px] text-blue-600 dark:text-blue-300">
                Phân phối đang hoạt động: {activeDistributions}
              </div>
            )}
            <div className="mt-3 text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-300">
              Phân bố ưu tiên
            </div>
            <div className="mt-1 space-y-1">
              {prioritySummary.map((item) => (
                <div key={item.level} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {item.label}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="absolute right-4 top-4 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-gray-900/80">
            <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
              Tag cơ sở dữ liệu
            </div>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
              {(["request", "center", "distribution"] as MarkerType[]).map((type) => (
                <div key={type} className="flex items-center justify-between gap-4">
                  <span>{DATABASE_TAGS[type]}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {totals[type]}
                  </span>
                </div>
              ))}
            </div>
          </div> */}

          <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur dark:bg-gray-900/80">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              Chú thích ưu tiên
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {prioritySummary.map((item) => (
                <div key={item.level} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 right-4 rounded-full bg-green-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-lg">
            Live
          </div>
        </>
      )}
    </div>
  );
}
