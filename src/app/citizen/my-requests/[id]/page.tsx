"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import MapLocationPicker, { Coordinates } from "@/components/admin/MapLocationPicker";
import {
  getPriorityColor,
  getRequestStatusColor,
  translateApprovalStatus,
  translateMatchingStatus,
  translatePriority,
  translateRequestStatus,
} from "@/lib/translations";
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Package,
  Building2,
  User,
  FileText,
  Calendar,
} from "lucide-react";
import { useMemo } from "react";

type WorkflowRequest = {
  id: number;
  loai_yeu_cau?: string | null;
  mo_ta?: string | null;
  dia_chi?: string | null;
  so_nguoi: number;
  do_uu_tien: string;
  trang_thai: string;
  trang_thai_phe_duyet: string;
  id_nguoi_phe_duyet?: number | null;
  thoi_gian_phe_duyet?: string | null;
  ly_do_tu_choi?: string | null;
  diem_uu_tien?: number | null;
  khoang_cach_gan_nhat?: number | null;
  id_nguon_luc_match?: number | null;
  trang_thai_matching?: string | null;
  vi_do?: number | null;
  kinh_do?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  nguoi_dung?: {
    ho_va_ten?: string | null;
    email?: string | null;
  };
  nguoi_phe_duyet?: {
    ho_va_ten?: string | null;
    vai_tro?: string | null;
  };
  nguon_luc_match?: {
    id?: number;
    ten_nguon_luc?: string | null;
    loai?: string | null;
    so_luong?: number | null;
    don_vi?: string | null;
    trung_tam?: {
      id?: number;
      ten_trung_tam?: string | null;
      dia_chi?: string | null;
      vi_do?: number | null;
      kinh_do?: number | null;
    };
  };
  phan_phois?: Array<{
    id: number;
    nguon_luc?: { ten_nguon_luc?: string | null };
    tinh_nguyen_vien?: { ho_va_ten?: string | null };
    trang_thai: string;
  }>;
};

export default function CitizenRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess } = useToast();

  const requestId = params?.id ? String(params.id) : null;

  const { data: requestData, isLoading, refetch, error } = useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => {
      if (!requestId) throw new Error("Request ID is required");
      const res = await fetch(`/api/requests/${requestId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi tải thông tin yêu cầu");
      }
      const result = await res.json();
      return result.request as WorkflowRequest;
    },
    enabled: !!requestId,
  });

  // Refresh handler
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật thông tin");
  };

  // Get approval status icon
  const getApprovalIcon = () => {
    const status = requestData?.trang_thai_phe_duyet;
    if (status === "da_phe_duyet") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === "tu_choi") return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  // Get matching status icon
  const getMatchingIcon = () => {
    const status = requestData?.trang_thai_matching;
    if (status === "da_match") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === "khong_match") return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không tìm thấy yêu cầu
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            {(error as Error)?.message || "Yêu cầu không tồn tại hoặc bạn không có quyền truy cập"}
          </p>
          <Button onClick={() => router.push("/citizen/my-requests")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const request = requestData;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            onClick={() => router.push("/citizen/my-requests")}
            variant="outline"
            size="sm"
            className="self-start"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Quay lại</span>
            <span className="sm:hidden">Quay lại</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Chi tiết yêu cầu #{request.id}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Theo dõi tình trạng và tiến độ xử lý
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
        >
          <RefreshCcw className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Làm mới</span>
          <span className="sm:hidden">Làm mới</span>
        </Button>
      </div>

      {/* Status Overview Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Approval Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Trạng thái phê duyệt
            </h3>
            {getApprovalIcon()}
          </div>
          <Badge
            color={
              request.trang_thai_phe_duyet === "da_phe_duyet"
                ? ("success" as any)
                : request.trang_thai_phe_duyet === "tu_choi"
                ? ("error" as any)
                : ("warning" as any)
            }
            size="md"
          >
            {translateApprovalStatus(request.trang_thai_phe_duyet)}
          </Badge>
          {request.nguoi_phe_duyet && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
              Người phê duyệt: {request.nguoi_phe_duyet.ho_va_ten}
            </p>
          )}
          {request.thoi_gian_phe_duyet && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {format(new Date(request.thoi_gian_phe_duyet), "dd/MM/yyyy HH:mm")}
            </p>
          )}
        </div>

        {/* Matching Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Trạng thái matching
            </h3>
            {getMatchingIcon()}
          </div>
          {request.trang_thai_matching ? (
            <>
              <Badge
                color={
                  request.trang_thai_matching === "da_match"
                    ? ("success" as any)
                    : request.trang_thai_matching === "khong_match"
                    ? ("error" as any)
                    : ("warning" as any)
                }
                size="md"
              >
                {translateMatchingStatus(request.trang_thai_matching)}
              </Badge>
              {request.khoang_cach_gan_nhat != null && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Khoảng cách: {Number(request.khoang_cach_gan_nhat).toFixed(2)} km
                </p>
              )}
            </>
          ) : (
            <Badge color="warning" size="md">
              Chưa match
            </Badge>
          )}
        </div>

        {/* Request Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-green-500 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Trạng thái yêu cầu
            </h3>
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          <Badge color={getRequestStatusColor(request.trang_thai) as any} size="md">
            {translateRequestStatus(request.trang_thai)}
          </Badge>
          {request.diem_uu_tien && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Điểm ưu tiên: {request.diem_uu_tien}/100
            </p>
          )}
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Request Details */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Thông tin yêu cầu
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Loại yêu cầu
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                  {request.loai_yeu_cau || "-"}
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Số người ảnh hưởng
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {request.so_nguoi}
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Độ ưu tiên
                </label>
                <Badge color={getPriorityColor(request.do_uu_tien) as any} size="md">
                  {translatePriority(request.do_uu_tien)}
                </Badge>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Ngày tạo
                </label>
                <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  {request.created_at
                    ? format(new Date(request.created_at), "dd/MM/yyyy HH:mm")
                    : "-"}
                </p>
              </div>

              {request.dia_chi && (
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Địa chỉ
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white flex items-start gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{request.dia_chi}</span>
                  </p>
                </div>
              )}

              {request.mo_ta && (
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Mô tả chi tiết
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-lg p-3 break-words">
                    {request.mo_ta}
                  </p>
                </div>
              )}

              {request.ly_do_tu_choi && (
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                    Lý do từ chối
                  </label>
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 break-words">
                    {request.ly_do_tu_choi}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Matched Resource */}
          {request.nguon_luc_match && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-green-500">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Nguồn lực được match
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tên nguồn lực
                  </label>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                    {request.nguon_luc_match.ten_nguon_luc || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Loại
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white break-words">
                      {request.nguon_luc_match.loai || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Số lượng
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {request.nguon_luc_match.so_luong || "-"}{" "}
                      {request.nguon_luc_match.don_vi || ""}
                    </p>
                  </div>
                </div>

                {request.nguon_luc_match.trung_tam && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trung tâm phân phối
                      </label>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 break-words">
                      {request.nguon_luc_match.trung_tam.ten_trung_tam || "-"}
                    </p>
                    {request.nguon_luc_match.trung_tam.dia_chi && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{request.nguon_luc_match.trung_tam.dia_chi}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distributions */}
          {request.phan_phois && request.phan_phois.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Phân phối liên quan ({request.phan_phois.length})
              </h2>
              <div className="space-y-3">
                {request.phan_phois.map((phan_phoi) => (
                  <div
                    key={phan_phoi.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 md:p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                        {phan_phoi.nguon_luc?.ten_nguon_luc || "Nguồn lực không xác định"}
                      </p>
                      <Badge
                        color={
                          phan_phoi.trang_thai === "da_phan_phoi"
                            ? ("success" as any)
                            : phan_phoi.trang_thai === "dang_phan_phoi"
                            ? ("warning" as any)
                            : ("info" as any)
                        }
                        size="sm"
                        className="self-start sm:self-auto"
                      >
                        {phan_phoi.trang_thai === "da_phan_phoi"
                          ? "Đã phân phối"
                          : phan_phoi.trang_thai === "dang_phan_phoi"
                          ? "Đang phân phối"
                          : "Chờ phân phối"}
                      </Badge>
                    </div>
                    {phan_phoi.tinh_nguyen_vien?.ho_va_ten && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span>Tình nguyện viên: {phan_phoi.tinh_nguyen_vien.ho_va_ten}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Map & Timeline */}
        <div className="space-y-4 md:space-y-6">
          {/* Map */}
          {request.vi_do && request.kinh_do && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Vị trí
              </h2>
              <div className="rounded-lg overflow-hidden" style={{ minHeight: "200px" }}>
                <MapLocationPicker
                  value={{ lat: Number(request.vi_do), lng: Number(request.kinh_do) }}
                  onChange={() => {}}
                  isActive={true}
                  interactive={false}
                />
              </div>
              <div className="mt-3 md:mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Vĩ độ: {request.vi_do}</p>
                <p>Kinh độ: {request.kinh_do}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch sử
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Yêu cầu được tạo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {request.created_at
                      ? format(new Date(request.created_at), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </p>
                </div>
              </div>

              {request.thoi_gian_phe_duyet && (
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      request.trang_thai_phe_duyet === "da_phe_duyet"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {request.trang_thai_phe_duyet === "da_phe_duyet"
                        ? "Yêu cầu được phê duyệt"
                        : "Yêu cầu bị từ chối"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(request.thoi_gian_phe_duyet), "dd/MM/yyyy HH:mm")}
                    </p>
                    {request.nguoi_phe_duyet && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Bởi: {request.nguoi_phe_duyet.ho_va_ten}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {request.updated_at &&
                request.updated_at !== request.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Yêu cầu được cập nhật
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(request.updated_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
