'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    // You'll need to add your Mapbox access token to environment variables
    // Get your free token from: https://account.mapbox.com/access-tokens/
    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [105.8342, 21.0278], // Hanoi, Vietnam
      zoom: 10,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      if (!map.current) return;

      // Add relief centers
      map.current.addSource('relief-centers', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Trung tâm cứu trợ 1',
                type: 'relief-center'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.7842, 21.0278]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Trung tâm cứu trợ 2',
                type: 'relief-center'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.8842, 21.1278]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Trung tâm cứu trợ 3',
                type: 'relief-center'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.7342, 20.9278]
              }
            }
          ]
        }
      });

      // Add emergency requests
      map.current.addSource('emergency-requests', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Yêu cầu khẩn cấp 1',
                type: 'emergency-request',
                priority: 'high'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.8142, 21.0478]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Yêu cầu khẩn cấp 2',
                type: 'emergency-request',
                priority: 'high'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.9042, 21.1078]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Yêu cầu khẩn cấp 3',
                type: 'emergency-request',
                priority: 'medium'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.7542, 20.9478]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Yêu cầu khẩn cấp 4',
                type: 'emergency-request',
                priority: 'high'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.8642, 20.9878]
              }
            },
            {
              type: 'Feature',
              properties: {
                name: 'Yêu cầu khẩn cấp 5',
                type: 'emergency-request',
                priority: 'medium'
              },
              geometry: {
                type: 'Point',
                coordinates: [105.7942, 21.0678]
              }
            }
          ]
        }
      });

      // Add relief centers layer
      map.current.addLayer({
        id: 'relief-centers',
        type: 'circle',
        source: 'relief-centers',
        paint: {
          'circle-radius': 12,
          'circle-color': '#10B981',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });

      // Add emergency requests layer
      map.current.addLayer({
        id: 'emergency-requests',
        type: 'circle',
        source: 'emergency-requests',
        paint: {
          'circle-radius': 8,
          'circle-color': '#EF4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      // Add pulsing animation for relief centers
      map.current.addLayer({
        id: 'relief-centers-pulse',
        type: 'circle',
        source: 'relief-centers',
        paint: {
          'circle-radius': {
            'base': 12,
            'stops': [[0, 12], [20, 20]]
          },
          'circle-color': '#10B981',
          'circle-opacity': 0.3
        }
      });

      // Add pulsing animation for emergency requests
      map.current.addLayer({
        id: 'emergency-requests-pulse',
        type: 'circle',
        source: 'emergency-requests',
        paint: {
          'circle-radius': {
            'base': 8,
            'stops': [[0, 8], [20, 16]]
          },
          'circle-color': '#EF4444',
          'circle-opacity': 0.3
        }
      });

      // Add popup on click
      map.current.on('click', 'relief-centers', (e) => {
        const coordinates = e.lngLat;
        const properties = e.features?.[0]?.properties;
        
        if (map.current) {
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-green-600">${properties?.name}</h3>
                <p class="text-sm text-gray-600">Trung tâm cứu trợ</p>
              </div>
            `)
            .addTo(map.current);
        }
      });

      map.current.on('click', 'emergency-requests', (e) => {
        const coordinates = e.lngLat;
        const properties = e.features?.[0]?.properties;
        
        if (map.current) {
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-red-600">${properties?.name}</h3>
                <p class="text-sm text-gray-600">Yêu cầu khẩn cấp - ${properties?.priority === 'high' ? 'Ưu tiên cao' : 'Ưu tiên trung bình'}</p>
              </div>
            `)
            .addTo(map.current);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'relief-centers', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseenter', 'emergency-requests', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'relief-centers', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      map.current.on('mouseleave', 'emergency-requests', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Overlay UI */}
      {isLoaded && (
        <>
          {/* Status Panel */}
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">3 Trung tâm cứu trợ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">5 Yêu cầu khẩn cấp</span>
            </div>
          </div>

          {/* Live Stats */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Đang xử lý</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">12/15</div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Chú thích</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Trung tâm cứu trợ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Yêu cầu khẩn cấp</span>
              </div>
            </div>
          </div>

          {/* Live Update Badge */}
          <div className="absolute bottom-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
            LIVE
          </div>
        </>
      )}
    </div>
  );
};

export default MapboxMap;
