"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  FileText,
  User,
  Building2,
  ArrowRight,
  Save,
} from "lucide-react";
import MapLocationPicker, { Coordinates } from "@/components/admin/MapLocationPicker";

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
    so_nguoi: number;
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

export default function VolunteerDistributionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();
  const queryClient = useQueryClient();

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

  // Update distribution mutation
  const updateDistributionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const body: any = { trang_thai: status };
      if (status === "hoan_thanh") {
        body.thoi_gian_giao = new Date().toISOString();
      }
      const res = await fetch(`/api/distributions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi cập nhật phân phối");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      showSuccess("Cập nhật trạng thái thành công!");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const handleUpdateStatus = async (distributionId: number, newStatus: string) => {
    try {
      await updateDistributionMutation.mutateAsync({ id: distributionId, status: newStatus });
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật danh sách phân phối");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách phân phối...</p>
        </div>
      </div>
    );
  }

  const distributions = (distributionsData?.distributions || []) as Distribution[];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Phân phối
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Quản lý các phân phối được giao cho bạn
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Làm mới</span>
        </Button>
      </div>

      {/* Distributions List */}
      {distributions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-center">
            <Truck className="w-16 h-16 md:w-20 md:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có phân phối nào
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Bạn sẽ nhận được thông báo khi có phân phối mới được giao
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
                        Nguồn lực cần giao
                      </span>
                    </div>
                    <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">
                      {distribution.nguon_luc.ten_nguon_luc}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Loại:</span> {distribution.nguon_luc.loai}
                      </div>
                      {distribution.nguon_luc.so_luong && (
                        <div>
                          <span className="font-medium">Số lượng:</span> {distribution.nguon_luc.so_luong}{" "}
                          {distribution.nguon_luc.don_vi}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Độ ưu tiên:</span>{" "}
                        <Badge color={getPriorityColor(distribution.yeu_cau.do_uu_tien) as any} size="sm">
                          {translatePriority(distribution.yeu_cau.do_uu_tien)}
                        </Badge>
                      </div>
                    </div>
                    {distribution.nguon_luc.trung_tam && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1 mb-1">
                          <Building2 className="w-3 h-3 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Điểm xuất phát
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
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
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 md:p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                          Địa điểm giao hàng
                        </span>
                      </div>
                      <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2 break-words">
                        {distribution.yeu_cau.dia_chi}
                      </p>
                      {distribution.yeu_cau.nguoi_dung && (
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span>
                              <span className="font-medium">Người nhận:</span>{" "}
                              {distribution.yeu_cau.nguoi_dung.ho_va_ten}
                            </span>
                          </div>
                          {distribution.yeu_cau.nguoi_dung.so_dien_thoai && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Điện thoại:</span>{" "}
                              {distribution.yeu_cau.nguoi_dung.so_dien_thoai}
                            </div>
                          )}
                          {distribution.yeu_cau.nguoi_dung.email && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Email:</span> {distribution.yeu_cau.nguoi_dung.email}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Số người ảnh hưởng:</span> {distribution.yeu_cau.so_nguoi}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Map */}
                  {distribution.yeu_cau.vi_do && distribution.yeu_cau.kinh_do && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <MapLocationPicker
                        value={{
                          lat: Number(distribution.yeu_cau.vi_do),
                          lng: Number(distribution.yeu_cau.kinh_do),
                        }}
                        onChange={() => {}}
                        isActive={true}
                        interactive={false}
                      />
                    </div>
                  )}
                </div>

                {/* Right: Status & Actions */}
                <div className="lg:w-64 flex flex-col gap-4">
                  {/* Status Timeline */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Thời gian
                    </h4>
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
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="font-mono text-xs truncate" title={distribution.ma_giao_dich}>
                              {distribution.ma_giao_dich.substring(0, 16)}...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Actions */}
                  {distribution.trang_thai !== "hoan_thanh" && distribution.trang_thai !== "huy_bo" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Cập nhật trạng thái
                      </h4>
                      <div className="space-y-2">
                        {(distribution.trang_thai === "dang_chuan_bi" || distribution.trang_thai === "dang_van_chuyen") && (
                          <Button
                            onClick={() => handleUpdateStatus(distribution.id, "dang_giao")}
                            disabled={updateDistributionMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            startIcon={<Truck className="w-4 h-4" />}
                          >
                            Bắt đầu giao hàng
                          </Button>
                        )}
                        {distribution.trang_thai === "dang_giao" && (
                          <Button
                            onClick={() => handleUpdateStatus(distribution.id, "hoan_thanh")}
                            disabled={updateDistributionMutation.isPending}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            startIcon={<CheckCircle className="w-4 h-4" />}
                          >
                            Hoàn thành giao hàng
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

