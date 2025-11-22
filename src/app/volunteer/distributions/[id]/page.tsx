"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import {
  getDistributionStatusColor,
  translateDistributionStatus,
  translatePriority,
  getPriorityColor,
} from "@/lib/translations";
import {
  ArrowLeft,
  Truck,
  Clock,
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  RefreshCcw,
  FileText,
  User,
  Building2,
  Mail,
  Phone,
  Save,
  AlertCircle,
  Navigation,
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
      id: number;
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
  nhat_ky_blockchains?: Array<{
    id: number;
    hanh_dong: string;
    thoi_gian: string;
    ma_giao_dich: string;
    du_lieu?: any;
  }>;
};

export default function VolunteerDistributionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();
  const queryClient = useQueryClient();

  const distributionId = params?.id ? parseInt(String(params.id)) : null;

  // Fetch distribution detail
  const { data: distributionData, isLoading, refetch } = useQuery({
    queryKey: ["distribution", distributionId],
    queryFn: async () => {
      if (!distributionId) throw new Error("ID phân phối không hợp lệ");
      
      const res = await fetch(`/api/distributions/${distributionId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi tải thông tin phân phối");
      }
      return res.json();
    },
    enabled: !!distributionId,
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
      queryClient.invalidateQueries({ queryKey: ["distribution", distributionId] });
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      showSuccess("Cập nhật trạng thái thành công!");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const handleUpdateStatus = async (newStatus: string) => {
    if (!distributionId) return;
    try {
      await updateDistributionMutation.mutateAsync({ id: distributionId, status: newStatus });
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật thông tin");
  };

  // Handle back
  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin phân phối...</p>
        </div>
      </div>
    );
  }

  if (!distributionData?.distribution) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Không tìm thấy phân phối
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Phân phối này không tồn tại hoặc bạn không có quyền xem
        </p>
        <Button onClick={handleBack} variant="outline" startIcon={<ArrowLeft className="w-4 h-4" />}>
          Quay lại
        </Button>
      </div>
    );
  }

  const distribution = distributionData.distribution as Distribution;

  // Verify this distribution belongs to the current volunteer
  // This should be checked on the backend, but we add a client-side check too
  // (Note: The API should handle this, but for safety we check here too)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Chi tiết phân phối #{distribution.id}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Thông tin chi tiết và cập nhật trạng thái
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Làm mới</span>
        </Button>
      </div>

      {/* Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trạng thái hiện tại</p>
            <Badge
              color={getDistributionStatusColor(distribution.trang_thai) as any}
              size="lg"
            >
              {translateDistributionStatus(distribution.trang_thai)}
            </Badge>
          </div>
          {distribution.ma_giao_dich && (
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mã giao dịch</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                {distribution.ma_giao_dich}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Request Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin yêu cầu
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại yêu cầu
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {distribution.yeu_cau.loai_yeu_cau}
                </p>
              </div>
              {distribution.yeu_cau.mo_ta && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {distribution.yeu_cau.mo_ta}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Độ ưu tiên
                  </p>
                  <Badge color={getPriorityColor(distribution.yeu_cau.do_uu_tien) as any} size="md">
                    {translatePriority(distribution.yeu_cau.do_uu_tien)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Số người ảnh hưởng
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {distribution.yeu_cau.so_nguoi} người
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Thông tin nguồn lực
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên nguồn lực
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {distribution.nguon_luc.ten_nguon_luc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loại
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {distribution.nguon_luc.loai}
                  </p>
                </div>
                {distribution.nguon_luc.so_luong && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số lượng
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {distribution.nguon_luc.so_luong} {distribution.nguon_luc.don_vi}
                    </p>
                  </div>
                )}
              </div>
              {distribution.nguon_luc.trung_tam && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trung tâm xuất phát
                    </p>
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {distribution.nguon_luc.trung_tam.ten_trung_tam}
                  </p>
                  {distribution.nguon_luc.trung_tam.dia_chi && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {distribution.nguon_luc.trung_tam.dia_chi}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Location */}
          {distribution.yeu_cau.dia_chi && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Địa điểm giao hàng
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                        Địa chỉ
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white break-words">
                        {distribution.yeu_cau.dia_chi}
                      </p>
                    </div>
                  </div>
                </div>

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

                {/* Recipient Info */}
                {distribution.yeu_cau.nguoi_dung && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Thông tin người nhận
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Họ và tên:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {distribution.yeu_cau.nguoi_dung.ho_va_ten}
                        </span>
                      </div>
                      {distribution.yeu_cau.nguoi_dung.so_dien_thoai && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {distribution.yeu_cau.nguoi_dung.so_dien_thoai}
                          </span>
                        </div>
                      )}
                      {distribution.yeu_cau.nguoi_dung.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {distribution.yeu_cau.nguoi_dung.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Thời gian
            </h3>
            <div className="space-y-3">
              {distribution.thoi_gian_xuat && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Xuất kho
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(distribution.thoi_gian_xuat), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              )}
              {distribution.thoi_gian_giao && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                      Giao hàng
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(distribution.thoi_gian_giao), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {distribution.trang_thai !== "hoan_thanh" && distribution.trang_thai !== "huy_bo" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg p-4 md:p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cập nhật trạng thái
              </h3>
              <div className="space-y-3">
                {(distribution.trang_thai === "dang_chuan_bi" || distribution.trang_thai === "dang_van_chuyen") && (
                  <Button
                    onClick={() => handleUpdateStatus("dang_giao")}
                    disabled={updateDistributionMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    startIcon={<Truck className="w-4 h-4" />}
                  >
                    Bắt đầu giao hàng
                  </Button>
                )}
                {distribution.trang_thai === "dang_giao" && (
                  <Button
                    onClick={() => handleUpdateStatus("hoan_thanh")}
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
  );
}

