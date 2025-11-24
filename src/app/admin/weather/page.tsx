"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  CloudRain,
  AlertTriangle,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCcw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminModal from "@/components/admin/AdminModal";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

interface WeatherAlert {
  tinh_thanh: string;
  coords: { lat: number; lon: number };
  weather?: any;
  forecast?: any;
  disaster_risk: {
    risk_level: "low" | "medium" | "high" | "critical";
    disaster_types: string[];
    confidence: number;
    risk_score: number;
    details: any;
  };
  timestamp: string;
  error?: string;
}

interface WeatherCheckResponse {
  results: WeatherAlert[];
  alerts_sent: string[];
  timestamp: string;
}

const VIETNAM_PROVINCES = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Quảng Ninh",
  "Thừa Thiên Huế",
  "Nghệ An",
  "Thanh Hóa",
  "Bình Định",
  "Quảng Nam",
  "Quảng Ngãi",
  "Bình Thuận",
  "Khánh Hòa",
  "Phú Yên",
  "Quảng Trị",
  "Quảng Bình",
  "Hà Tĩnh",
  "Lào Cai",
  "Sơn La",
];

const riskLevelColors: Record<string, "error" | "warning" | "success"> = {
  critical: "error",
  high: "warning",
  medium: "warning",
  low: "success",
};

const riskLevelLabels: Record<string, string> = {
  critical: "Rất cao",
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

const disasterTypeIcons: Record<string, React.ComponentType> = {
  "Lũ lụt": Droplets,
  "Bão": Wind,
  "Hạn hán": Thermometer,
  "Sạt lở đất": AlertTriangle,
};

export default function AdminWeatherPage() {
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChecking, setIsChecking] = useState(false);
  const pageSize = 10;

  // Fetch weather alerts (stored in state or fetched from API)
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);

  // Check weather for a single province
  const checkWeatherMutation = useMutation({
    mutationFn: async (tinhThanh: string) => {
      const response = await fetch(`/api/ai/weather-check?tinh_thanh=${encodeURIComponent(tinhThanh)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check weather");
      }
      return response.json() as Promise<WeatherAlert>;
    },
    onSuccess: (data, tinhThanh) => {
      console.log("✅ Weather check success for:", tinhThanh, data);
      // Add or update alert in list
      setWeatherAlerts((prev) => {
        const existing = prev.findIndex((a) => a.tinh_thanh === tinhThanh);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [data, ...prev];
      });
      success(`Đã check thời tiết cho ${tinhThanh}`);
      setIsChecking(false);
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  // Check weather for multiple provinces
  const checkBatchMutation = useMutation({
    mutationFn: async (provinces: string[]) => {
      const response = await fetch(`/api/ai/weather-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provinces }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check weather batch");
      }
      return response.json() as Promise<WeatherCheckResponse>;
    },
    onSuccess: (data) => {
      console.log("✅ Weather check batch success:", data);
      setWeatherAlerts((prev) => {
        // Merge new results with existing
        const newAlerts = data.results.filter((r) => !r.error);
        console.log("📊 New alerts:", newAlerts.length, newAlerts);
        const updated = [...prev];
        newAlerts.forEach((alert) => {
          const existing = updated.findIndex((a) => a.tinh_thanh === alert.tinh_thanh);
          if (existing >= 0) {
            updated[existing] = alert;
          } else {
            updated.push(alert);
          }
        });
        const sorted = updated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        console.log("📋 Total alerts after update:", sorted.length);
        return sorted;
      });
      if (data.alerts_sent && data.alerts_sent.length > 0) {
        success(`Đã gửi ${data.alerts_sent.length} cảnh báo cho các tỉnh: ${data.alerts_sent.join(", ")}`);
      } else {
        success("Đã check thời tiết cho tất cả tỉnh thành");
      }
      setIsChecking(false);
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const handleCheckWeather = async (province?: string) => {
    try {
      if (province) {
        setIsChecking(true);
        await checkWeatherMutation.mutateAsync(province);
      } else {
        // Check all major provinces
        setIsChecking(true);
        await checkBatchMutation.mutateAsync(VIETNAM_PROVINCES.slice(0, 10));
      }
    } catch (error) {
      console.error("❌ Error checking weather:", error);
      setIsChecking(false);
    }
  };

  // Send notification manually
  const sendNotificationMutation = useMutation({
    mutationFn: async (alert: WeatherAlert) => {
      const response = await fetch("/api/ai/weather-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tinh_thanh: alert.tinh_thanh,
          disaster_types: alert.disaster_risk?.disaster_types || [],
          risk_level: alert.disaster_risk?.risk_level || "low",
          details: alert.disaster_risk?.details || {},
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send notification");
      }

      return response.json();
    },
    onSuccess: (data, alert) => {
      const sent = data.notifications_sent || 0;
      const total = data.total_users || 0;
      success(`Đã gửi thông báo cho ${sent}/${total} người dùng (tất cả admin, volunteer, citizen) về cảnh báo tại ${alert.tinh_thanh}`);
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const handleSendNotification = (alert: WeatherAlert) => {
    if (!alert.disaster_risk?.disaster_types || alert.disaster_risk.disaster_types.length === 0) {
      showError("Cảnh báo này không có thiên tai được phát hiện. Không thể gửi thông báo.");
      return;
    }
    sendNotificationMutation.mutate(alert);
  };

  // Mockup data for testing
  const handleCreateMockupData = () => {
    const mockAlerts: WeatherAlert[] = [
      {
        tinh_thanh: "Hà Nội",
        coords: { lat: 21.0285, lon: 105.8542 },
        disaster_risk: {
          risk_level: "critical",
          disaster_types: ["Lũ lụt", "Bão"],
          confidence: 0.85,
          risk_score: 0.9,
          details: {
            current: {
              temp: 28,
              humidity: 95,
              rain: 35,
              wind_speed: 22,
              pressure: 995,
              cloudiness: 90,
              condition: "rain",
            },
            flood: {
              risk: 0.7,
              reason: "Mưa lớn kéo dài > 35mm/h",
            },
            storm: {
              risk: 0.8,
              reason: "Gió mạnh 22 m/s",
            },
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        tinh_thanh: "Hồ Chí Minh",
        coords: { lat: 10.8231, lon: 106.6297 },
        disaster_risk: {
          risk_level: "high",
          disaster_types: ["Hạn hán"],
          confidence: 0.75,
          risk_score: 0.65,
          details: {
            current: {
              temp: 38,
              humidity: 25,
              rain: 0,
              wind_speed: 5,
              pressure: 1010,
              cloudiness: 10,
              condition: "clear",
            },
            drought: {
              risk: 0.65,
              reason: "Nhiệt độ cao 38°C, độ ẩm thấp 25%",
            },
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        tinh_thanh: "Đà Nẵng",
        coords: { lat: 16.0544, lon: 108.2022 },
        disaster_risk: {
          risk_level: "high",
          disaster_types: ["Sạt lở đất"],
          confidence: 0.7,
          risk_score: 0.6,
          details: {
            current: {
              temp: 26,
              humidity: 88,
              rain: 45,
              wind_speed: 8,
              pressure: 1002,
              cloudiness: 85,
              condition: "rain",
            },
            landslide: {
              risk: 0.6,
              reason: "Mưa lớn 45mm/3h kết hợp độ ẩm cao 88%",
            },
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        tinh_thanh: "Quảng Ninh",
        coords: { lat: 21.0064, lon: 107.2925 },
        disaster_risk: {
          risk_level: "medium",
          disaster_types: ["Bão"],
          confidence: 0.6,
          risk_score: 0.5,
          details: {
            current: {
              temp: 24,
              humidity: 85,
              rain: 15,
              wind_speed: 18,
              pressure: 1005,
              cloudiness: 75,
              condition: "clouds",
            },
            storm: {
              risk: 0.5,
              reason: "Gió mạnh 18 m/s, áp suất thấp",
            },
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        tinh_thanh: "Thừa Thiên Huế",
        coords: { lat: 16.4637, lon: 107.5909 },
        disaster_risk: {
          risk_level: "low",
          disaster_types: [],
          confidence: 0.3,
          risk_score: 0.2,
          details: {
            current: {
              temp: 25,
              humidity: 65,
              rain: 5,
              wind_speed: 10,
              pressure: 1015,
              cloudiness: 40,
              condition: "partly_cloudy",
            },
          },
        },
        timestamp: new Date().toISOString(),
      },
    ];

    setWeatherAlerts(mockAlerts);
    success(`Đã tạo ${mockAlerts.length} cảnh báo mockup để test (có ${mockAlerts.filter(a => a.disaster_risk.disaster_types.length > 0).length} cảnh báo có thiên tai)`);
  };

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let filtered = weatherAlerts;

    // Filter by province
    if (selectedProvince !== "all") {
      filtered = filtered.filter((alert) => alert.tinh_thanh === selectedProvince);
    }

    // Filter by risk level
    if (riskLevelFilter !== "all") {
      filtered = filtered.filter((alert) => alert.disaster_risk?.risk_level === riskLevelFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.tinh_thanh.toLowerCase().includes(query) ||
          (alert.disaster_risk?.disaster_types || []).some((type) => type.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [weatherAlerts, selectedProvince, riskLevelFilter, searchQuery]);

  // Paginate
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProvince, riskLevelFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = weatherAlerts.length;
    const critical = weatherAlerts.filter((a) => a.disaster_risk?.risk_level === "critical").length;
    const high = weatherAlerts.filter((a) => a.disaster_risk?.risk_level === "high").length;
    const withDisasters = weatherAlerts.filter((a) => (a.disaster_risk?.disaster_types || []).length > 0).length;

    return { total, critical, high, withDisasters };
  }, [weatherAlerts]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "tinh_thanh",
        label: "Tỉnh thành",
        render: (_: unknown, row: WeatherAlert) => (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{row.tinh_thanh}</span>
          </div>
        ),
      },
      {
        key: "risk_level",
        label: "Mức độ rủi ro",
        render: (_: unknown, row: WeatherAlert) => {
          const risk = row.disaster_risk.risk_level;
          return (
            <Badge color={riskLevelColors[risk] || "info"} variant="solid">
              {riskLevelLabels[risk] || risk}
            </Badge>
          );
        },
      },
      {
        key: "disaster_types",
        label: "Loại thiên tai",
        render: (_: unknown, row: WeatherAlert) => {
          const types = row.disaster_risk?.disaster_types || [];
          if (types.length === 0) {
            return <span className="text-gray-400 text-sm">Không có</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {types.map((type, idx) => {
                const Icon = disasterTypeIcons[type] || AlertTriangle;
                return (
                  <Badge key={`${row.tinh_thanh}-${type}-${idx}`} color="warning" variant="light" size="sm">
                    <Icon />
                    {type}
                  </Badge>
                );
              })}
            </div>
          );
        },
      },
      {
        key: "confidence",
        label: "Độ tin cậy",
        render: (_: unknown, row: WeatherAlert) => {
          const confidence = row.disaster_risk?.confidence ?? 0;
          return (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full ${
                    confidence >= 0.7 ? "bg-green-500" : confidence >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${(confidence || 0) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{((confidence || 0) * 100).toFixed(0)}%</span>
            </div>
          );
        },
      },
      {
        key: "timestamp",
        label: "Thời gian",
        render: (_: unknown, row: WeatherAlert) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {format(new Date(row.timestamp), "dd/MM/yyyy HH:mm")}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (_: unknown, row: WeatherAlert) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedAlert(row)}
              startIcon={<Eye className="h-4 w-4" />}
            >
              Chi tiết
            </Button>
            {(row.disaster_risk?.disaster_types || []).length > 0 && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSendNotification(row)}
                startIcon={<AlertTriangle className="h-4 w-4" />}
                disabled={sendNotificationMutation.isPending}
              >
                Gửi TB
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCheckWeather(row.tinh_thanh)}
              startIcon={<RefreshCcw className="h-4 w-4" />}
              disabled={isChecking}
            >
              Check lại
            </Button>
          </div>
        ),
      },
    ],
    [isChecking, sendNotificationMutation.isPending]
  );

  const provinceOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả tỉnh thành" },
      ...VIETNAM_PROVINCES.map((p) => ({ value: p, label: p })),
    ],
    []
  );

  const riskLevelOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả mức độ" },
      { value: "critical", label: "Rất cao" },
      { value: "high", label: "Cao" },
      { value: "medium", label: "Trung bình" },
      { value: "low", label: "Thấp" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cảnh báo thời tiết"
        description={
          <div className="flex flex-col gap-1">
            <span>Theo dõi và quản lý cảnh báo thiên tai dựa trên dữ liệu thời tiết thực tế</span>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-1">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>
                <strong>Lưu ý:</strong> Thông báo sẽ tự động gửi đến tất cả admin khi phát hiện nguy cơ thiên tai mức độ <strong>cao</strong> hoặc <strong>rất cao</strong>. Bạn cũng có thể gửi thủ công bằng nút "Gửi TB".
              </span>
            </div>
          </div>
        }
        actions={[
          {
            label: "Tạo dữ liệu test",
            variant: "outline",
            onClick: handleCreateMockupData,
            icon: <AlertTriangle className="h-4 w-4" />,
          },
          {
            label: "Check tất cả",
            variant: "primary",
            onClick: () => handleCheckWeather(),
            icon: <RefreshCcw className="h-4 w-4" />,
            disabled: isChecking,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminStatsCard
          title="Tổng cảnh báo"
          value={stats.total}
          icon={CloudRain}
          color="blue"
          description="Số lượng cảnh báo đang theo dõi"
        />
        <AdminStatsCard
          title="Rủi ro rất cao"
          value={stats.critical}
          icon={AlertTriangle}
          color="red"
          description="Cảnh báo mức độ critical"
        />
        <AdminStatsCard
          title="Rủi ro cao"
          value={stats.high}
          icon={Wind}
          color="orange"
          description="Cảnh báo mức độ high"
        />
        <AdminStatsCard
          title="Có thiên tai"
          value={stats.withDisasters}
          icon={Droplets}
          color="yellow"
          description="Cảnh báo có phát hiện thiên tai"
        />
      </div>

      {weatherAlerts.length === 0 ? (
        <AdminEmptyState
          icon={<CloudRain className="h-6 w-6" aria-hidden />}
          title="Chưa có cảnh báo thời tiết"
          description="Nhấn 'Check tất cả' để kiểm tra thời tiết cho các tỉnh thành chính và phát hiện nguy cơ thiên tai."
          action={
            <Button onClick={() => handleCheckWeather()} startIcon={<RefreshCcw className="h-4 w-4" />}>
              Check thời tiết
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <AdminDataTable
            columns={columns}
            data={paginatedAlerts}
            isLoading={isChecking}
            searchable
            searchPlaceholder="Tìm theo tỉnh thành hoặc loại thiên tai..."
            onSearch={setSearchQuery}
            filters={[
              {
                key: "province",
                label: "Lọc theo tỉnh thành",
                options: provinceOptions,
                onChange: setSelectedProvince,
              },
              {
                key: "risk",
                label: "Lọc theo mức độ rủi ro",
                options: riskLevelOptions,
                onChange: setRiskLevelFilter,
              },
            ]}
            toolbarActions={
              <div className="flex items-center gap-2">
                <Select
                  defaultValue={selectedProvince}
                  onChange={(value) => {
                    setSelectedProvince(value);
                    if (value !== "all") {
                      handleCheckWeather(value);
                    }
                  }}
                  options={provinceOptions}
                  className="w-48"
                  placeholder="Chọn tỉnh thành"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCheckWeather()}
                  startIcon={<RefreshCcw className="h-4 w-4" />}
                  disabled={isChecking}
                >
                  {isChecking ? "Đang check..." : "Check lại tất cả"}
                </Button>
              </div>
            }
            emptyMessage="Không tìm thấy cảnh báo"
            emptyDescription="Thử thay đổi bộ lọc hoặc check thời tiết cho tỉnh thành khác."
            emptyIcon={<CloudRain className="h-6 w-6" aria-hidden />}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Trang {currentPage} / {totalPages} ({filteredAlerts.length} kết quả)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  startIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Trước
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  endIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <AdminModal
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title={`Chi tiết cảnh báo - ${selectedAlert?.tinh_thanh}`}
        size="lg"
      >
        {selectedAlert && (
          <div className="space-y-6">
            {/* Risk Level */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mức độ rủi ro</span>
                <Badge color={riskLevelColors[selectedAlert.disaster_risk.risk_level]} variant="solid">
                  {riskLevelLabels[selectedAlert.disaster_risk.risk_level]}
                </Badge>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Risk Score: {(selectedAlert.disaster_risk?.risk_score ?? 0).toFixed(2)} | Confidence:{" "}
                {((selectedAlert.disaster_risk?.confidence ?? 0) * 100).toFixed(0)}%
              </div>
            </div>

            {/* Disaster Types */}
            {selectedAlert.disaster_risk.disaster_types.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại thiên tai phát hiện</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.disaster_risk.disaster_types.map((type, idx) => {
                    const Icon = disasterTypeIcons[type] || AlertTriangle;
                    return (
                      <Badge key={`${selectedAlert.tinh_thanh}-${type}-${idx}`} color="warning" variant="light">
                        <Icon />
                        {type}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weather Details */}
            {selectedAlert.weather && selectedAlert.disaster_risk.details?.current && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Thông tin thời tiết</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Nhiệt độ: <strong>{selectedAlert.disaster_risk.details.current.temp || "N/A"}°C</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Độ ẩm: <strong>{selectedAlert.disaster_risk.details.current.humidity || "N/A"}%</strong>
                    </span>
                  </div>
                  {selectedAlert.disaster_risk.details.current.rain > 0 && (
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Mưa: <strong>{selectedAlert.disaster_risk.details.current.rain}mm/h</strong>
                      </span>
                    </div>
                  )}
                  {selectedAlert.disaster_risk.details.current.wind_speed > 0 && (
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Gió: <strong>{selectedAlert.disaster_risk.details.current.wind_speed} m/s</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Coordinates */}
            {selectedAlert.coords && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tọa độ</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Lat: {selectedAlert.coords.lat}, Lon: {selectedAlert.coords.lon}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Cập nhật lúc: {format(new Date(selectedAlert.timestamp), "dd/MM/yyyy HH:mm:ss")}
            </div>

            {/* Info Note */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Thông báo tự động:</strong> Hệ thống sẽ tự động gửi cảnh báo đến tất cả admin khi phát hiện nguy cơ thiên tai mức độ <strong>cao</strong> hoặc <strong>rất cao</strong> (risk_level ≥ "high"). Bạn có thể gửi thủ công bằng nút bên dưới.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
              {(selectedAlert.disaster_risk?.disaster_types || []).length > 0 ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleSendNotification(selectedAlert);
                  }}
                  startIcon={<AlertTriangle className="h-4 w-4" />}
                  disabled={sendNotificationMutation.isPending}
                >
                  {sendNotificationMutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
                </Button>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Cảnh báo này không có thiên tai được phát hiện. Không thể gửi thông báo.
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  handleCheckWeather(selectedAlert.tinh_thanh);
                  setSelectedAlert(null);
                }}
                startIcon={<RefreshCcw className="h-4 w-4" />}
                disabled={isChecking}
              >
                Check lại
              </Button>
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}

