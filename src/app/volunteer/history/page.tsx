"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import {
  getDistributionStatusColor,
  translateDistributionStatus,
  translatePriority,
} from "@/lib/translations";
import {
  Truck,
  Clock,
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  Eye,
  RefreshCcw,
  History,
  User,
  Building2,
  FileText,
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
    dia_chi?: string | null;
    nguoi_dung?: {
      ho_va_ten?: string | null;
    } | null;
  };
  nguon_luc: {
    id: number;
    ten_nguon_luc: string;
    loai: string;
    don_vi: string;
    trung_tam?: {
      ten_trung_tam?: string | null;
    } | null;
  };
  nhat_ky_blockchains?: Array<{
    id: number;
    hanh_dong: string;
    thoi_gian: string;
    ma_giao_dich: string;
  }>;
};

type StatusFilter = "all" | "hoan_thanh" | "huy_bo";

export default function VolunteerHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success: showSuccess } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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
        throw new Error(data.error || "Lỗi khi tải lịch sử");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Filter distributions (only completed and cancelled)
  const filteredDistributions = useMemo(() => {
    if (!distributionsData?.distributions) return [];
    const distributions = distributionsData.distributions as Distribution[];
    
    let filtered = distributions.filter(
      (d) => d.trang_thai === "hoan_thanh" || d.trang_thai === "huy_bo"
    );

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.trang_thai === statusFilter);
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = a.thoi_gian_giao || a.thoi_gian_xuat || "";
      const dateB = b.thoi_gian_giao || b.thoi_gian_xuat || "";
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [distributionsData, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    if (!distributionsData?.distributions) {
      return {
        total: 0,
        completed: 0,
        cancelled: 0,
      };
    }

    const distributions = distributionsData.distributions as Distribution[];
    const completed = distributions.filter((d) => d.trang_thai === "hoan_thanh");
    const cancelled = distributions.filter((d) => d.trang_thai === "huy_bo");

    return {
      total: completed.length + cancelled.length,
      completed: completed.length,
      cancelled: cancelled.length,
    };
  }, [distributionsData]);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật lịch sử");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  const distributions = filteredDistributions as Distribution[];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Lịch sử giao hàng
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Xem lịch sử các phân phối đã hoàn thành
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            defaultValue={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "hoan_thanh", label: "Hoàn thành" },
              { value: "huy_bo", label: "Hủy bỏ" },
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Tổng số
              </span>
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Giao hàng</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Hoàn thành
              </span>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.completed}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Đã giao</p>
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
      )}

      {/* History List */}
      {distributions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-center">
            <History className="w-16 h-16 md:w-20 md:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có lịch sử giao hàng
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Lịch sử giao hàng sẽ hiển thị khi bạn hoàn thành phân phối
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {distributions.map((distribution) => (
            <div
              key={distribution.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4 md:gap-6">
                {/* Left: Distribution Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                          {distribution.yeu_cau.loai_yeu_cau}
                        </h3>
                        <Badge
                          color={getDistributionStatusColor(distribution.trang_thai) as any}
                          size="md"
                        >
                          {translateDistributionStatus(distribution.trang_thai)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nguồn lực
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {distribution.nguon_luc.ten_nguon_luc}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {distribution.nguon_luc.so_luong} {distribution.nguon_luc.don_vi}
                      </p>
                    </div>

                    {distribution.yeu_cau.dia_chi && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            Địa điểm
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {distribution.yeu_cau.dia_chi}
                        </p>
                        {distribution.yeu_cau.nguoi_dung?.ho_va_ten && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {distribution.yeu_cau.nguoi_dung.ho_va_ten}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    {distribution.thoi_gian_xuat && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Xuất kho: {format(new Date(distribution.thoi_gian_xuat), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                    )}
                    {distribution.thoi_gian_giao && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Giao hàng: {format(new Date(distribution.thoi_gian_giao), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                    )}
                    {distribution.ma_giao_dich && (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="font-mono text-xs truncate" title={distribution.ma_giao_dich}>
                          TX: {distribution.ma_giao_dich.substring(0, 16)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="lg:w-48 flex flex-col gap-3 lg:items-end">
                  <Button
                    onClick={() => router.push(`/volunteer/distributions/${distribution.id}`)}
                    variant="outline"
                    size="sm"
                    className="w-full lg:w-auto"
                    startIcon={<Eye className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">Xem chi tiết</span>
                    <span className="sm:hidden">Chi tiết</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

