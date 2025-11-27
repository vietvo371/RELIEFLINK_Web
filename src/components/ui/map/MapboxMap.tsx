'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  className?: string;
}

interface Center {
  id: number;
  ten_trung_tam: string;
  dia_chi: string;
  vi_do: number | null;
  kinh_do: number | null;
  so_lien_he: string | null;
  nguoi_quan_ly: string | null;
}

interface Request {
  id: number;
  loai_yeu_cau: string;
  mo_ta: string | null;
  dia_chi: string | null;
  so_nguoi: number;
  do_uu_tien: string;
  trang_thai: string;
  trang_thai_phe_duyet: string;
  vi_do: number | null;
  kinh_do: number | null;
  created_at: string;
  ho_va_ten_lien_he?: string | null;
  so_dien_thoai_lien_he?: string | null;
  nguoi_dung?: {
    ho_va_ten: string | null;
    email: string | null;
    so_dien_thoai: string | null;
  } | null;
}

interface MapStats {
  totalCenters: number;
  totalRequests: number;
  pendingRequests: number;
  highPriorityRequests: number;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MapStats>({
    totalCenters: 0,
    totalRequests: 0,
    pendingRequests: 0,
    highPriorityRequests: 0,
  });
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Lưu data để có thể update map khi sẵn sàng
  const pendingDataRef = useRef<{ centers: Center[]; requests: Request[] } | null>(null);

  // Convert centers to GeoJSON
  const centersToGeoJSON = (centers: Center[]): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: centers
      .filter(c => c.vi_do && c.kinh_do)
      .map(center => ({
        type: 'Feature' as const,
        properties: {
          id: center.id,
          name: center.ten_trung_tam,
          address: center.dia_chi,
          phone: center.so_lien_he || 'Chưa có SĐT',
          manager: center.nguoi_quan_ly || 'Chưa xác định',
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [Number(center.kinh_do), Number(center.vi_do)],
        },
      })),
  });

  // Convert requests to GeoJSON
  const requestsToGeoJSON = (requests: Request[]): GeoJSON.FeatureCollection => ({
    type: 'FeatureCollection',
    features: requests
      .filter(r => r.vi_do && r.kinh_do)
      .map(request => {
        // Xác định tên người yêu cầu
        const requesterName = request.nguoi_dung?.ho_va_ten || request.ho_va_ten_lien_he || 'Người dân';
        
        // Xác định số điện thoại
        const requesterPhone = request.nguoi_dung?.so_dien_thoai || request.so_dien_thoai_lien_he || '';
        
        // Tính thời gian
        const createdAt = new Date(request.created_at);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let timeAgo = '';
        if (diffDays > 0) timeAgo = `${diffDays} ngày trước`;
        else if (diffHours > 0) timeAgo = `${diffHours} giờ trước`;
        else if (diffMins > 0) timeAgo = `${diffMins} phút trước`;
        else timeAgo = 'Vừa xong';

        return {
          type: 'Feature' as const,
          properties: {
            id: request.id,
            name: `Yêu cầu: ${request.loai_yeu_cau}`,
            type: request.loai_yeu_cau,
            priority: request.do_uu_tien,
            status: request.trang_thai,
            approvalStatus: request.trang_thai_phe_duyet,
            address: request.dia_chi || 'Chưa có địa chỉ',
            description: request.mo_ta || '',
            peopleCount: request.so_nguoi,
            requester: requesterName,
            phone: requesterPhone,
            time: timeAgo,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [Number(request.kinh_do), Number(request.vi_do)],
          },
        };
      }),
  });

  // Fetch data from API
  const fetchMapData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      
      // Fetch centers and requests in parallel
      const [centersRes, requestsRes] = await Promise.all([
        fetch('/api/centers'),
        fetch('/api/requests?trang_thai_phe_duyet=da_phe_duyet'),
      ]);

      const centersData = await centersRes.json();
      const requestsData = await requestsRes.json();

      const centers: Center[] = centersData.centers || [];
      const requests: Request[] = requestsData.requests || [];

      // Filter only active requests (not completed)
      const activeRequests = requests.filter(
        r => r.trang_thai !== 'hoan_thanh' && r.trang_thai !== 'huy'
      );

      // Update stats ngay lập tức
      setStats({
        totalCenters: centers.filter(c => c.vi_do && c.kinh_do).length,
        totalRequests: activeRequests.filter(r => r.vi_do && r.kinh_do).length,
        pendingRequests: activeRequests.filter(r => r.trang_thai === 'cho_xu_ly').length,
        highPriorityRequests: activeRequests.filter(
          r => r.do_uu_tien === 'cao' || r.do_uu_tien === 'khan_cap' || r.do_uu_tien === 'rat_cao'
        ).length,
      });

      // Lưu data để có thể retry nếu map chưa sẵn sàng
      pendingDataRef.current = { centers, requests: activeRequests };

      // Function để update map sources
      const updateMapSources = () => {
        if (!map.current) return false;
        
        const centersSource = map.current.getSource('relief-centers') as mapboxgl.GeoJSONSource;
        const requestsSource = map.current.getSource('emergency-requests') as mapboxgl.GeoJSONSource;

        if (centersSource && requestsSource) {
          centersSource.setData(centersToGeoJSON(centers));
          requestsSource.setData(requestsToGeoJSON(activeRequests));
          console.log('✅ Map data updated:', centers.length, 'centers,', activeRequests.length, 'requests');
          return true;
        }
        return false;
      };

      // Thử update ngay nếu map đã sẵn sàng
      if (!updateMapSources()) {
        // Nếu chưa sẵn sàng, thử lại sau 100ms, 300ms, 500ms
        const retryDelays = [100, 300, 500, 1000];
        retryDelays.forEach(delay => {
          setTimeout(() => {
            if (pendingDataRef.current) {
              updateMapSources();
            }
          }, delay);
        });
      }

      return { centers, requests: activeRequests };
    } catch (error) {
      console.error('Error fetching map data:', error);
      return { centers: [], requests: [] };
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    try {
      const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtZ3ZxazFmbDBndnMyanIxMzN0dHV1eGcifQ.lhk4cDYUEIozqnFfkSebaw';
      
      if (!MAPBOX_TOKEN) {
        setError('Thiếu Mapbox Access Token. Vui lòng thêm NEXT_PUBLIC_MAPBOX_TOKEN vào file .env.local');
        return;
      }

      mapboxgl.accessToken = MAPBOX_TOKEN;

      console.log('🗺️ Initializing Mapbox map...');

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [106.6297, 10.8231], // Ho Chi Minh City
        zoom: 6, // Zoom out to see whole Vietnam
        pitch: 30,
        bearing: 0,
        antialias: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }), 'top-right');

      map.current.on('load', async () => {
        setIsLoaded(true);

        if (!map.current) return;

        // Add 3D buildings layer
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        if (labelLayerId) {
          map.current.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.6
              }
            },
            labelLayerId
          );
        }

        // Add empty sources (will be populated with real data)
        map.current.addSource('relief-centers', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        map.current.addSource('emergency-requests', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        // Relief centers - glow effect
        map.current.addLayer({
          id: 'relief-centers-glow',
          type: 'circle',
          source: 'relief-centers',
          paint: {
            'circle-radius': 30,
            'circle-color': '#10B981',
            'circle-opacity': 0.15,
            'circle-blur': 1
          }
        });

        // Relief centers - main marker
        map.current.addLayer({
          id: 'relief-centers',
          type: 'circle',
          source: 'relief-centers',
          paint: {
            'circle-radius': 14,
            'circle-color': '#10B981',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Emergency requests - color based on status + priority
        // Màu khớp với Stats Panel: cam=đang xử lý, vàng=chờ xử lý, đỏ=ưu tiên cao
        map.current.addLayer({
          id: 'emergency-requests-glow',
          type: 'circle',
          source: 'emergency-requests',
          paint: {
            'circle-radius': 25,
            'circle-color': [
              'case',
              // Ưu tiên cao (khan_cap, rat_cao, cao) -> Đỏ
              ['any',
                ['==', ['get', 'priority'], 'khan_cap'],
                ['==', ['get', 'priority'], 'rat_cao'],
                ['==', ['get', 'priority'], 'cao']
              ], '#EF4444',
              // Chờ xử lý -> Vàng
              ['==', ['get', 'status'], 'cho_xu_ly'], '#EAB308',
              // Đang xử lý -> Cam
              '#F97316'
            ],
            'circle-opacity': 0.2,
            'circle-blur': 1
          }
        });

        // Emergency requests - main marker
        map.current.addLayer({
          id: 'emergency-requests',
          type: 'circle',
          source: 'emergency-requests',
          paint: {
            'circle-radius': 10,
            'circle-color': [
              'case',
              // Ưu tiên cao (khan_cap, rat_cao, cao) -> Đỏ
              ['any',
                ['==', ['get', 'priority'], 'khan_cap'],
                ['==', ['get', 'priority'], 'rat_cao'],
                ['==', ['get', 'priority'], 'cao']
              ], '#EF4444',
              // Chờ xử lý -> Vàng
              ['==', ['get', 'status'], 'cho_xu_ly'], '#EAB308',
              // Đang xử lý -> Cam
              '#F97316'
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Popup for relief centers
        map.current.on('click', 'relief-centers', (e) => {
          const coordinates = e.lngLat;
          const properties = e.features?.[0]?.properties;

          if (map.current && properties) {
            // Tạo số điện thoại sạch (loại bỏ ký tự không phải số)
            const cleanPhone = properties.phone?.replace(/[^0-9]/g, '') || '';
            const hasPhone = cleanPhone.length >= 9;
            
            // Tạo link Google Maps directions
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
            
            new mapboxgl.Popup({ 
              closeButton: true, 
              closeOnClick: true,
              maxWidth: '300px',
              className: 'relief-popup'
            })
              .setLngLat(coordinates)
              .setHTML(`
                <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <div style="width: 12px; height: 12px; min-width: 12px; background: #10B981; border-radius: 50%;"></div>
                    <div style="font-weight: 600; color: #10B981; font-size: 14px; line-height: 1.3;">${properties.name}</div>
                  </div>
                  <div style="background: #F0FDF4; border-radius: 6px; padding: 10px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px;">
                      <span style="flex-shrink: 0;">📍</span>
                      <span style="font-size: 12px; color: #166534; line-height: 1.4;">${properties.address}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="flex-shrink: 0;">📞</span>
                      <span style="font-size: 12px; color: #166534;">${properties.phone}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="flex-shrink: 0;">👤</span>
                      <span style="font-size: 12px; color: #166534;">${properties.manager}</span>
                    </div>
                  </div>
                  
                  <!-- Buttons -->
                  <div style="display: flex; gap: 8px;">
                    ${hasPhone ? `
                      <a href="tel:${cleanPhone}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 10px 12px; background: #10B981; color: white; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        📞 Gọi ngay
                      </a>
                    ` : ''}
                    <a href="${mapsUrl}" target="_blank" rel="noopener" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 10px 12px; background: #3B82F6; color: white; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                      🗺️ Chỉ đường
                    </a>
                  </div>
                </div>
              `)
              .addTo(map.current);
          }
        });

        // Popup for emergency requests
        map.current.on('click', 'emergency-requests', (e) => {
          const coordinates = e.lngLat;
          const properties = e.features?.[0]?.properties;

          if (map.current && properties) {
            // Xác định màu theo logic: Ưu tiên cao -> đỏ, Chờ xử lý -> vàng, Đang xử lý -> cam
            const isHighPriority = ['khan_cap', 'rat_cao', 'cao'].includes(properties.priority);
            const isPending = properties.status === 'cho_xu_ly';
            
            let markerColor = '#F97316'; // Cam - đang xử lý (mặc định)
            let markerBg = '#FFF7ED';
            let statusLabel = '🔄 Đang xử lý';
            
            if (isHighPriority) {
              markerColor = '#EF4444'; // Đỏ - ưu tiên cao
              markerBg = '#FEF2F2';
              statusLabel = '🔴 Ưu tiên cao';
            } else if (isPending) {
              markerColor = '#EAB308'; // Vàng - chờ xử lý
              markerBg = '#FEFCE8';
              statusLabel = '⏳ Chờ xử lý';
            }
            
            const priorityLabels: Record<string, string> = {
              khan_cap: '🚨 Khẩn cấp',
              rat_cao: '🔴 Rất cao',
              cao: '🟠 Cao',
              trung_binh: '🟡 Trung bình',
              thap: '🟢 Thấp',
            };
            const priorityText = priorityLabels[properties.priority] || 'Trung bình';
            
            // Tạo link Google Maps directions
            const requestMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
            
            // Xử lý số điện thoại
            const reqCleanPhone = properties.phone?.replace(/[^0-9]/g, '') || '';
            const reqHasPhone = reqCleanPhone.length >= 9;
            
            // Xác định button dựa trên trạng thái
            let primaryBtnText = '🤝 Hỗ trợ ngay';
            let primaryBtnColor = '#10B981';
            
            if (isHighPriority) {
              primaryBtnText = '🚨 Hỗ trợ khẩn cấp';
              primaryBtnColor = '#EF4444';
            } else if (!isPending) {
              // Đang xử lý
              primaryBtnText = '📋 Xem tiến độ';
              primaryBtnColor = '#F97316';
            }
            
            new mapboxgl.Popup({ 
              closeButton: true, 
              closeOnClick: true,
              maxWidth: '320px',
              className: 'request-popup'
            })
              .setLngLat(coordinates)
              .setHTML(`
                <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <div style="width: 12px; height: 12px; min-width: 12px; background: ${markerColor}; border-radius: 50%;"></div>
                    <div style="font-weight: 600; color: ${markerColor}; font-size: 14px; line-height: 1.3;">${properties.type}</div>
                  </div>
                  
                  <div style="background: ${markerBg}; border-radius: 6px; padding: 10px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px;">
                      <span style="flex-shrink: 0;">📍</span>
                      <span style="font-size: 12px; color: #374151; line-height: 1.4;">${properties.address}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="flex-shrink: 0;">👤</span>
                      <span style="font-size: 12px; color: #374151;">${properties.requester}</span>
                    </div>
                    ${reqHasPhone ? `
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="flex-shrink: 0;">📞</span>
                      <span style="font-size: 12px; color: #374151;">${properties.phone}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="flex-shrink: 0;">👥</span>
                      <span style="font-size: 12px; color: #374151;">${properties.peopleCount} người cần hỗ trợ</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="flex-shrink: 0;">🕐</span>
                      <span style="font-size: 11px; color: #6B7280;">${properties.time}</span>
                    </div>
                  </div>
                  
                  <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                    <div style="flex: 1; text-align: center; padding: 6px 8px; background: ${markerBg}; color: ${markerColor}; font-size: 11px; border-radius: 4px; font-weight: 600;">${statusLabel}</div>
                    <div style="flex: 1; text-align: center; padding: 6px 8px; background: #F3F4F6; color: #374151; font-size: 11px; border-radius: 4px; font-weight: 500;">${priorityText}</div>
                  </div>
                  
                  ${properties.description ? `<div style="padding: 8px; background: #F9FAFB; border-radius: 4px; font-size: 11px; color: #6B7280; line-height: 1.4; margin-bottom: 10px;">${properties.description.substring(0, 100)}${properties.description.length > 100 ? '...' : ''}</div>` : ''}
                  
                  <!-- Action Buttons -->
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${reqHasPhone ? `
                    <a href="tel:${reqCleanPhone}" style="flex: 1; min-width: 80px; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 10px 8px; background: #10B981; color: white; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                      📞 Gọi ngay
                    </a>
                    ` : ''}
                    <a href="${requestMapsUrl}" target="_blank" rel="noopener" style="flex: 1; min-width: 80px; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 10px 8px; background: #3B82F6; color: white; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                      🗺️ Chỉ đường
                    </a>
                    <button onclick="window.dispatchEvent(new CustomEvent('support-request', {detail: {id: ${properties.id}}}))" style="flex: 1; min-width: 80px; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 10px 8px; background: ${primaryBtnColor}; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                      ${primaryBtnText}
                    </button>
                  </div>
                </div>
              `)
              .addTo(map.current);
          }
        });

        // Change cursor on hover
        ['relief-centers', 'emergency-requests'].forEach(layer => {
          map.current?.on('mouseenter', layer, () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
          });
          map.current?.on('mouseleave', layer, () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
          });
        });

        // Fetch data ngay lập tức (không đợi)
        fetchMapData();
        
        // Đảm bảo update data khi map hoàn toàn sẵn sàng
        map.current.once('idle', () => {
          console.log('🗺️ Map idle - checking for pending data...');
          if (pendingDataRef.current) {
            const { centers, requests } = pendingDataRef.current;
            const centersSource = map.current?.getSource('relief-centers') as mapboxgl.GeoJSONSource;
            const requestsSource = map.current?.getSource('emergency-requests') as mapboxgl.GeoJSONSource;
            
            if (centersSource && requestsSource) {
              centersSource.setData(centersToGeoJSON(centers));
              requestsSource.setData(requestsToGeoJSON(requests));
              console.log('✅ Map data loaded on idle:', centers.length, 'centers,', requests.length, 'requests');
            }
          }
        });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        if (e.error?.message?.includes('access token')) {
          setError('Access token không hợp lệ. Vui lòng kiểm tra lại NEXT_PUBLIC_MAPBOX_TOKEN');
        }
      });

    } catch (err) {
      console.error('❌ Error initializing map:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [fetchMapData]);

  // Refresh data every 30 seconds
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      fetchMapData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoaded, fetchMapData]);

  if (error) {
    return (
      <div className={`relative ${className} flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900`}>
        <div className="text-center p-8 max-w-md">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Cần cấu hình Mapbox Token
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <div className="bg-gray-800 dark:bg-gray-950 rounded-lg p-4 text-left mb-4">
            <p className="text-xs text-gray-400 mb-2">Thêm vào file <code className="text-green-400">.env.local</code>:</p>
            <code className="text-xs text-green-400 break-all">
              NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
            </code>
          </div>
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Lấy token miễn phí →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Overlay UI */}
      {isLoaded && (
        <>
          {/* Stats Panel */}
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 min-w-[220px] z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${isDataLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                {isDataLoading ? 'Đang tải...' : 'Thống kê trực tiếp'}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-green-500/20"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Trung tâm cứu trợ</span>
                </div>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{stats.totalCenters}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full ring-2 ring-orange-500/20"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Yêu cầu đang xử lý</span>
                </div>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{stats.totalRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full ring-2 ring-yellow-500/20"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Chờ xử lý</span>
                </div>
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-red-500/20"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Ưu tiên cao</span>
                </div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{stats.highPriorityRequests}</span>
              </div>
            </div>
          </div>

          {/* Legend - Khớp với Stats Panel */}
          <div className="absolute bottom-24 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-10">
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">Chú thích</div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-green-500 rounded-full ring-2 ring-green-500/30"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Trung tâm cứu trợ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-orange-500 rounded-full ring-2 ring-orange-500/30"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Yêu cầu đang xử lý</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-yellow-500 rounded-full ring-2 ring-yellow-500/30"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Yêu cầu chờ xử lý</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-red-500 rounded-full ring-2 ring-red-500/30"></div>
                <span className="text-xs text-gray-700 dark:text-gray-300">Ưu tiên cao</span>
              </div>
            </div>
          </div>

          {/* Live Badge */}
          <div className="absolute bottom-6 left-4 flex items-center gap-2 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg z-10">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE - Cập nhật mỗi 30s
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchMapData}
            disabled={isDataLoading}
            className="absolute bottom-6 right-20 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs font-medium px-3 py-2 rounded-full shadow-lg z-10 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </>
      )}
    </div>
  );
};

export default MapboxMap;
