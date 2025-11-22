"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import {
  getDistributionStatusColor,
  translateDistributionStatus,
  translatePriority,
} from "@/lib/translations";
import {
  Heart,
  Truck,
  FileText,
  Award,
  CheckCircle,
  Clock,
  Package,
  RefreshCcw,
  ArrowRight,
  MapPin,
  Calendar,
  Eye,
  TrendingUp,
} from "lucide-react";

type Distribution = {
  id: number;
  trang_thai: string;
  ma_giao_dich?: string | null;
  thoi_gian_xuat?: string | null;
  thoi_gian_giao?: string | null;
  yeu_cau: {
    id: number;
    loai_yeu_cau: string;
    do_uu_tien: string;
    vi_do?: number | null;
    kinh_do?: number | null;
    dia_chi?: string | null;
    nguoi_dung?: {
      ho_va_ten?: string | null;
      so_dien_thoai?: string | null;
    } | null;
  };
  nguon_luc: {
    id: number;
    ten_nguon_luc: string;
    loai: string;
    don_vi: string;
    trung_tam?: {
      ten_trung_tam?: string | null;
      dia_chi?: string | null;
    } | null;
  };
};

export default function VolunteerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success: showSuccess } = useToast();

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

  // Calculate statistics
  const stats = useMemo(() => {
    if (!distributionsData?.distributions) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      };
    }

    const distributions = distributionsData.distributions as Distribution[];
    return {
      total: distributions.length,
      pending: distributions.filter((d) => d.trang_thai === "dang_chuan_bi").length,
      inProgress: distributions.filter((d) => d.trang_thai === "dang_giao").length,
      completed: distributions.filter((d) => d.trang_thai === "hoan_thanh").length,
      cancelled: distributions.filter((d) => d.trang_thai === "huy_bo").length,
    };
  }, [distributionsData]);

  // Get recent distributions (last 5)
  const recentDistributions = useMemo(() => {
    if (!distributionsData?.distributions) return [];
    const distributions = distributionsData.distributions as Distribution[];
    return distributions
      .sort((a, b) => {
        const dateA = a.thoi_gian_xuat ? new Date(a.thoi_gian_xuat).getTime() : 0;
        const dateB = b.thoi_gian_xuat ? new Date(b.thoi_gian_xuat).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [distributionsData]);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật thông tin");
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 md:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {getGreeting()}, {user?.ho_va_ten || "Tình nguyện viên"}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Cảm ơn bạn đã tham gia làm tình nguyện viên cứu trợ
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 self-start sm:self-auto"
          >
            <RefreshCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Tổng cộng
            </span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Phân phối
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Đang chuẩn bị
            </span>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.pending}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chờ giao</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Đang giao
            </span>
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.inProgress}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tiến hành</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Hoàn thành
            </span>
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.completed}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Đã xong</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Hủy bỏ
            </span>
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.cancelled}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Đã hủy</p>
        </div>
      </div>

      {/* Quick Actions & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Hành động nhanh
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/volunteer/tasks")}
                className="w-full flex items-center gap-3 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
              >
                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Xem nhiệm vụ
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Xem tất cả nhiệm vụ được giao
                  </p>
                </div>
              </button>

              <button
                onClick={() => router.push("/volunteer/distributions")}
                className="w-full flex items-center gap-3 p-4 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
              >
                <Truck className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Phân phối
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Quản lý phân phối của bạn
                  </p>
                </div>
              </button>

              <button
                onClick={() => router.push("/volunteer/resources")}
                className="w-full flex items-center gap-3 p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
              >
                <Package className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Nguồn lực
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Xem nguồn lực có sẵn
                  </p>
                </div>
              </button>

              <button
                onClick={() => router.push("/volunteer/map")}
                className="w-full flex items-center gap-3 p-4 border-2 border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left"
              >
                <MapPin className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Bản đồ
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Xem bản đồ điều hướng
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Nhiệm vụ gần đây
              </h2>
              {recentDistributions.length > 0 && (
                <button
                  onClick={() => router.push("/volunteer/tasks")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {recentDistributions.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <Truck className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Bạn chưa có nhiệm vụ nào
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                  Bạn sẽ nhận được thông báo khi có nhiệm vụ mới được giao
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDistributions.map((distribution) => (
                  <div
                    key={distribution.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/volunteer/distributions/${distribution.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {distribution.yeu_cau.loai_yeu_cau}
                          </h3>
                          <Badge
                            color={getDistributionStatusColor(distribution.trang_thai) as any}
                            size="sm"
                          >
                            {translateDistributionStatus(distribution.trang_thai)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Nguồn lực:</span>{" "}
                            {distribution.nguon_luc.ten_nguon_luc}
                          </p>
                          {distribution.yeu_cau.dia_chi && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {distribution.yeu_cau.dia_chi.length > 50
                                ? `${distribution.yeu_cau.dia_chi.substring(0, 50)}...`
                                : distribution.yeu_cau.dia_chi}
                            </p>
                          )}
                          {distribution.thoi_gian_xuat && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              {format(new Date(distribution.thoi_gian_xuat), "dd/MM/yyyy HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <Heart className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Cảm ơn sự đóng góp của bạn!
            </h3>
            <p className="text-sm md:text-base text-blue-800 dark:text-blue-300 mb-3">
              Là tình nguyện viên, bạn có thể xem các phân phối được giao, cập nhật trạng thái giao hàng
              và theo dõi tiến trình hỗ trợ. Mỗi hành động của bạn đều giúp đỡ những người cần sự giúp đỡ!
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li className="flex items-start gap-2">
                <span className="font-bold flex-shrink-0">•</span>
                <span>Nhận nhiệm vụ phân phối và cập nhật trạng thái trong thời gian thực</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold flex-shrink-0">•</span>
                <span>Xem bản đồ để điều hướng đến địa điểm giao hàng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold flex-shrink-0">•</span>
                <span>Theo dõi lịch sử giao hàng và thành tích của bạn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
