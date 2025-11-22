"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import MapLocationPicker, { Coordinates } from "@/components/admin/MapLocationPicker";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Select from "@/components/form/Select";
import {
  MapPin,
  Truck,
  Package,
  RefreshCcw,
  Navigation,
  User,
  Building2,
  Eye,
  Route,
  Calendar,
  Phone,
  Filter,
  AlertCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  getDistributionStatusColor,
  translateDistributionStatus,
  translatePriority,
  getPriorityColor,
} from "@/lib/translations";

type Distribution = {
  id: number;
  trang_thai: string;
  ma_giao_dich?: string | null;
  thoi_gian_xuat?: string | null;
  yeu_cau: {
    id: number;
    loai_yeu_cau: string;
    dia_chi?: string | null;
    do_uu_tien: string;
    vi_do?: number | null;
    kinh_do?: number | null;
    nguoi_dung?: {
      ho_va_ten?: string | null;
      so_dien_thoai?: string | null;
      email?: string | null;
    } | null;
  };
  nguon_luc: {
    id: number;
    ten_nguon_luc: string;
    loai: string;
    don_vi: string;
    so_luong?: number | null;
    trung_tam?: {
      id: number;
      ten_trung_tam?: string | null;
      dia_chi?: string | null;
      vi_do?: number | null;
      kinh_do?: number | null;
    } | null;
  };
};

type StatusFilter = "all" | "dang_chuan_bi" | "dang_van_chuyen" | "dang_giao" | "hoan_thanh";

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function VolunteerMapPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success: showSuccess } = useToast();
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<"all" | "route">("all");

  // Fetch distributions for current volunteer
  const { data: distributionsData, isLoading, refetch } = useQuery({
    queryKey: ["distributions", { id_tinh_nguyen_vien: user?.id }],
    queryFn: async () => {
      if (!user?.id) return { distributions: [] };
      const params = new URLSearchParams();
      params.append("id_tinh_nguyen_vien", String(user.id));
      const res = await fetch(`/api/distributions?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi tải danh sách phân phối");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Filter and process distributions
  const processedDistributions = useMemo(() => {
    if (!distributionsData?.distributions) return [];
    
    let distributions = distributionsData.distributions as Distribution[];
    
    // Filter by status
    if (statusFilter !== "all") {
      distributions = distributions.filter((d) => d.trang_thai === statusFilter);
    }

    // Filter distributions with both pickup and delivery locations
    return distributions
      .filter(
        (d) =>
          d.yeu_cau.vi_do &&
          d.yeu_cau.kinh_do &&
          d.nguon_luc.trung_tam?.vi_do &&
          d.nguon_luc.trung_tam?.kinh_do
      )
      .map((d) => {
        const deliveryLat = Number(d.yeu_cau.vi_do);
        const deliveryLng = Number(d.yeu_cau.kinh_do);
        const pickupLat = Number(d.nguon_luc.trung_tam?.vi_do);
        const pickupLng = Number(d.nguon_luc.trung_tam?.kinh_do);
        
        // Calculate distance
        const distance = calculateDistance(pickupLat, pickupLng, deliveryLat, deliveryLng);
        
        return {
          ...d,
          distance,
          pickupLocation: { lat: pickupLat, lng: pickupLng },
          deliveryLocation: { lat: deliveryLat, lng: deliveryLng },
        };
      })
      .sort((a, b) => {
        // Sort by status priority first
        const statusOrder: Record<string, number> = {
          dang_chuan_bi: 1,
          dang_van_chuyen: 2,
          dang_giao: 3,
          hoan_thanh: 4,
        };
        const orderA = statusOrder[a.trang_thai] || 999;
        const orderB = statusOrder[b.trang_thai] || 999;
        if (orderA !== orderB) return orderA - orderB;
        
        // Then by distance
        return a.distance - b.distance;
      });
  }, [distributionsData, statusFilter]);

  // Calculate center point for map
  const mapCenter = useMemo(() => {
    if (selectedDistribution) {
      return selectedDistribution.deliveryLocation;
    }
    
    if (processedDistributions.length === 0) {
      return { lat: 14.0583, lng: 108.2772 }; // Vietnam center
    }

    // Calculate center of all locations
    let totalLat = 0;
    let totalLng = 0;
    let count = 0;

    processedDistributions.forEach((d) => {
      totalLat += d.pickupLocation.lat + d.deliveryLocation.lat;
      totalLng += d.pickupLocation.lng + d.deliveryLocation.lng;
      count += 2;
    });

    return {
      lat: totalLat / count,
      lng: totalLng / count,
    };
  }, [processedDistributions, selectedDistribution]);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật bản đồ");
  };

  // Handle distribution click
  const handleDistributionClick = (distribution: any) => {
    setSelectedDistribution(distribution);
    setViewMode("route");
  };

  // Handle view all
  const handleViewAll = () => {
    setSelectedDistribution(null);
    setViewMode("all");
  };

  // Statistics
  const stats = useMemo(() => {
    const distributions = processedDistributions;
    return {
      total: distributions.length,
      pending: distributions.filter((d) => d.trang_thai === "dang_chuan_bi" || d.trang_thai === "dang_van_chuyen").length,
      inProgress: distributions.filter((d) => d.trang_thai === "dang_giao").length,
      totalDistance: distributions.reduce((sum, d) => sum + d.distance, 0),
    };
  }, [processedDistributions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  const distributions = processedDistributions;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Bản đồ điều hướng
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Xem tuyến đường và vị trí giao hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            defaultValue={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as StatusFilter);
              setSelectedDistribution(null);
              setViewMode("all");
            }}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "dang_chuan_bi", label: "Đang chuẩn bị" },
              { value: "dang_van_chuyen", label: "Đang vận chuyển" },
              { value: "dang_giao", label: "Đang giao" },
              { value: "hoan_thanh", label: "Hoàn thành" },
            ]}
            className="w-full sm:w-auto"
          />
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Tổng số
              </span>
              <MapPin className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Điểm giao hàng</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Chờ giao
              </span>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Đang chờ</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Đang giao
              </span>
              <Truck className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tiến hành</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Tổng quãng đường
              </span>
              <Route className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalDistance.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">km</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Distribution List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Danh sách ({distributions.length})
              </h2>
              {selectedDistribution && (
                <Button
                  onClick={handleViewAll}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  startIcon={<Eye className="w-3 h-3" />}
                >
                  Tất cả
                </Button>
              )}
            </div>
            {distributions.length === 0 ? (
              <div className="text-center py-6">
                <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chưa có địa điểm giao hàng
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {distributions.map((distribution) => (
                  <div
                    key={distribution.id}
                    onClick={() => handleDistributionClick(distribution)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDistribution?.id === distribution.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {distribution.yeu_cau.loai_yeu_cau}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          #{distribution.id}
                        </p>
                      </div>
                      <Badge
                        color={getDistributionStatusColor(distribution.trang_thai) as any}
                        size="sm"
                      >
                        {translateDistributionStatus(distribution.trang_thai)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span className="truncate">{distribution.nguon_luc.ten_nguon_luc}</span>
                      </div>
                      {distribution.yeu_cau.dia_chi && (
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{distribution.yeu_cau.dia_chi}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Route className="w-3 h-3" />
                          <span className="font-medium">{distribution.distance.toFixed(1)} km</span>
                        </div>
                        {distribution.nguon_luc.trung_tam && (
                          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Building2 className="w-3 h-3" />
                            <span className="text-xs truncate max-w-[80px]">
                              {distribution.nguon_luc.trung_tam.ten_trung_tam}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDistribution ? "Tuyến đường chi tiết" : "Bản đồ tổng quan"}
              </h2>
              {selectedDistribution && (
                <Button
                  onClick={() => router.push(`/volunteer/distributions/${selectedDistribution.id}`)}
                  variant="outline"
                  size="sm"
                  startIcon={<Eye className="w-4 h-4" />}
                >
                  Xem chi tiết
                </Button>
              )}
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" >
              {selectedDistribution ? (
                // Show route view for selected distribution
                <MapLocationPicker
                  value={selectedDistribution.deliveryLocation}
                  onChange={() => {}}
                  isActive={true}
                  interactive={false}
                />
              ) : (
                // Show overview map
                <MapLocationPicker
                  value={mapCenter}
                  onChange={() => {}}
                  isActive={true}
                  interactive={true}
                />
              )}
            </div>
            
            {/* Selected Distribution Details */}
            {selectedDistribution && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pickup Location */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                      Điểm xuất phát
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDistribution.nguon_luc.trung_tam?.ten_trung_tam}
                    </p>
                    {selectedDistribution.nguon_luc.trung_tam?.dia_chi && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedDistribution.nguon_luc.trung_tam.dia_chi}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {selectedDistribution.nguon_luc.ten_nguon_luc}
                        {selectedDistribution.nguon_luc.so_luong &&
                          ` - ${selectedDistribution.nguon_luc.so_luong} ${selectedDistribution.nguon_luc.don_vi}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-200">
                      Điểm đến
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDistribution.yeu_cau.loai_yeu_cau}
                    </p>
                    {selectedDistribution.yeu_cau.dia_chi && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedDistribution.yeu_cau.dia_chi}
                      </p>
                    )}
                    {selectedDistribution.yeu_cau.nguoi_dung && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {selectedDistribution.yeu_cau.nguoi_dung.ho_va_ten}
                          </span>
                        </div>
                        {selectedDistribution.yeu_cau.nguoi_dung.so_dien_thoai && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {selectedDistribution.yeu_cau.nguoi_dung.so_dien_thoai}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Route Info */}
                <div className="md:col-span-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Route className="w-5 h-5 text-purple-600" />
                      <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                        Thông tin tuyến đường
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                        {selectedDistribution.distance.toFixed(1)} km
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Khoảng cách ước tính
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Độ ưu tiên:</span>
                      <Badge
                        color={getPriorityColor(selectedDistribution.yeu_cau.do_uu_tien) as any}
                        size="sm"
                        className="ml-2"
                      >
                        {translatePriority(selectedDistribution.yeu_cau.do_uu_tien)}
                      </Badge>
                    </div>
                    {selectedDistribution.thoi_gian_xuat && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Xuất kho:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {format(new Date(selectedDistribution.thoi_gian_xuat), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
