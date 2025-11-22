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
  getPriorityColor,
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
  Filter,
  FileText,
  User,
  Building2,
  AlertCircle,
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
    mo_ta?: string | null;
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

type StatusFilter = "all" | "dang_chuan_bi" | "dang_giao" | "hoan_thanh" | "huy_bo";

export default function VolunteerTasksPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success: showSuccess } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Fetch distributions for current volunteer
  const { data: distributionsData, isLoading, refetch } = useQuery({
    queryKey: ["distributions", { id_tinh_nguyen_vien: user?.id, trang_thai: statusFilter !== "all" ? statusFilter : undefined }],
    queryFn: async () => {
      if (!user?.id) return { distributions: [] };
      const params = new URLSearchParams();
      params.append("id_tinh_nguyen_vien", String(user.id));
      if (statusFilter !== "all") {
        params.append("trang_thai", statusFilter);
      }
      const res = await fetch(`/api/distributions?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi tải danh sách phân phối");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Filter and sort distributions
  const filteredDistributions = useMemo(() => {
    if (!distributionsData?.distributions) return [];
    const distributions = distributionsData.distributions as Distribution[];
    
    // Already filtered by API, but we can do additional sorting
    return distributions.sort((a, b) => {
      // Sort by status priority: dang_chuan_bi > dang_giao > hoan_thanh > huy_bo
      const statusOrder: Record<string, number> = {
        dang_chuan_bi: 1,
        dang_giao: 2,
        hoan_thanh: 3,
        huy_bo: 4,
      };
      const orderA = statusOrder[a.trang_thai] || 999;
      const orderB = statusOrder[b.trang_thai] || 999;
      if (orderA !== orderB) return orderA - orderB;
      
      // Then by date
      const dateA = a.thoi_gian_xuat ? new Date(a.thoi_gian_xuat).getTime() : 0;
      const dateB = b.thoi_gian_xuat ? new Date(b.thoi_gian_xuat).getTime() : 0;
      return dateB - dateA;
    });
  }, [distributionsData]);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật danh sách nhiệm vụ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách nhiệm vụ...</p>
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
            Nhiệm vụ của tôi
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Các phân phối được giao và đang thực hiện
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            defaultValue={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "dang_chuan_bi", label: "Đang chuẩn bị" },
              { value: "dang_giao", label: "Đang giao" },
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

      {/* Distributions List */}
      {distributions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-center">
            <Truck className="w-16 h-16 md:w-20 md:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có nhiệm vụ nào
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Bạn sẽ nhận được thông báo khi có nhiệm vụ mới được giao
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {distributions.map((distribution) => (
            <div
              key={distribution.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push(`/volunteer/distributions/${distribution.id}`)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left: Task Info */}
                <div className="flex-1 space-y-4">
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
                      {distribution.yeu_cau.mo_ta && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {distribution.yeu_cau.mo_ta}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Resource Info */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nguồn lực
                      </span>
                    </div>
                    <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {distribution.nguon_luc.ten_nguon_luc}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span>Loại: {distribution.nguon_luc.loai}</span>
                      {distribution.nguon_luc.so_luong && (
                        <span>
                          Số lượng: {distribution.nguon_luc.so_luong} {distribution.nguon_luc.don_vi}
                        </span>
                      )}
                    </div>
                    {distribution.nguon_luc.trung_tam && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 mb-1">
                          <Building2 className="w-3 h-3 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Trung tâm
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {distribution.nguon_luc.trung_tam.ten_trung_tam}
                        </p>
                        {distribution.nguon_luc.trung_tam.dia_chi && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                            {distribution.nguon_luc.trung_tam.dia_chi}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delivery Location */}
                  {distribution.yeu_cau.dia_chi && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Địa điểm giao hàng
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white break-words">
                          {distribution.yeu_cau.dia_chi}
                        </p>
                        {distribution.yeu_cau.nguoi_dung && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Người nhận: {distribution.yeu_cau.nguoi_dung.ho_va_ten}
                            {distribution.yeu_cau.nguoi_dung.so_dien_thoai &&
                              ` - ${distribution.yeu_cau.nguoi_dung.so_dien_thoai}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Status & Actions */}
                <div className="lg:w-48 flex flex-col gap-3 lg:items-end">
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
                          TX: {distribution.ma_giao_dich.substring(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => {
                        router.push(`/volunteer/distributions/${distribution.id}`);
                      }}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
