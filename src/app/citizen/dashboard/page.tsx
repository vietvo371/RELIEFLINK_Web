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
  getPriorityColor,
  getRequestStatusColor,
  translateApprovalStatus,
  translatePriority,
  translateRequestStatus,
} from "@/lib/translations";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  Plus,
  AlertCircle,
  TrendingUp,
  Package,
  MapPin,
  Calendar,
  Eye,
  RefreshCcw,
  ArrowRight,
  XCircle,
} from "lucide-react";

type WorkflowRequest = {
  id: number;
  loai_yeu_cau?: string | null;
  mo_ta?: string | null;
  dia_chi?: string | null;
  so_nguoi: number;
  do_uu_tien: string;
  trang_thai: string;
  trang_thai_phe_duyet: string;
  trang_thai_matching?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  phan_phois?: Array<{
    id: number;
    trang_thai: string;
  }>;
};

export default function CitizenDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success: showSuccess } = useToast();

  // Fetch all requests for current user
  const { data: requestsData, isLoading, refetch } = useQuery({
    queryKey: ["requests", { id_nguoi_dung: user?.id }],
    queryFn: async () => {
      if (!user?.id) return { requests: [] };
      const params = new URLSearchParams();
      params.append("id_nguoi_dung", String(user.id));
      const res = await fetch(`/api/requests?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi tải danh sách yêu cầu");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!requestsData?.requests) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        inProgress: 0,
        completed: 0,
        rejected: 0,
      };
    }

    const requests = requestsData.requests as WorkflowRequest[];
    return {
      total: requests.length,
      pending: requests.filter((r) => r.trang_thai_phe_duyet === "cho_phe_duyet").length,
      approved: requests.filter((r) => r.trang_thai_phe_duyet === "da_phe_duyet").length,
      inProgress: requests.filter(
        (r) =>
          r.trang_thai_phe_duyet === "da_phe_duyet" &&
          (r.trang_thai_matching === "da_match" || r.phan_phois?.length > 0) &&
          r.trang_thai !== "hoan_thanh"
      ).length,
      completed: requests.filter((r) => r.trang_thai === "hoan_thanh").length,
      rejected: requests.filter((r) => r.trang_thai_phe_duyet === "tu_choi").length,
    };
  }, [requestsData]);

  // Get recent requests (last 5)
  const recentRequests = useMemo(() => {
    if (!requestsData?.requests) return [];
    const requests = requestsData.requests as WorkflowRequest[];
    return requests
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [requestsData]);

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
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-6 md:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {getGreeting()}, {user?.ho_va_ten || "Người dùng"}!
            </h1>
            <p className="text-green-100 text-sm sm:text-base">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn khi cần
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
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
            Yêu cầu của tôi
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Chờ phê duyệt
            </span>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.pending}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Đang chờ</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Đã phê duyệt
            </span>
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.approved}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Đã duyệt</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Đang xử lý
            </span>
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
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
              Từ chối
            </span>
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {stats.rejected}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bị từ chối</p>
        </div>
      </div>

      {/* Quick Actions & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Bạn cần hỗ trợ?
            </h2>
            <Button
              onClick={() => router.push("/citizen/my-requests")}
              className="w-full bg-green-600 hover:bg-green-700 text-white mb-3"
              startIcon={<Plus className="w-5 h-5" />}
            >
              Tạo yêu cầu cứu trợ mới
            </Button>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
              Chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian sớm nhất
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <button
                onClick={() => router.push("/citizen/my-requests")}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Xem tất cả yêu cầu
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => router.push("/citizen/status")}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Xem trạng thái
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                Yêu cầu gần đây
              </h2>
              {recentRequests.length > 0 && (
                <button
                  onClick={() => router.push("/citizen/my-requests")}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {recentRequests.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                  Bạn chưa có yêu cầu cứu trợ nào
                </p>
                <Button
                  onClick={() => router.push("/citizen/my-requests")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  startIcon={<Plus className="w-4 h-4" />}
                >
                  Tạo yêu cầu đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/citizen/my-requests/${request.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {request.loai_yeu_cau || `Yêu cầu #${request.id}`}
                          </h3>
                          <Badge
                            color={
                              request.trang_thai_phe_duyet === "da_phe_duyet"
                                ? ("success" as any)
                                : request.trang_thai_phe_duyet === "tu_choi"
                                ? ("error" as any)
                                : ("warning" as any)
                            }
                            size="sm"
                          >
                            {translateApprovalStatus(request.trang_thai_phe_duyet)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {request.so_nguoi} người
                          </span>
                          <span className="flex items-center gap-1">
                            <Badge
                              color={getPriorityColor(request.do_uu_tien) as any}
                              size="sm"
                            >
                              {translatePriority(request.do_uu_tien)}
                            </Badge>
                          </span>
                          {request.created_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(request.created_at), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                        {request.dia_chi && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {request.dia_chi.length > 50
                              ? `${request.dia_chi.substring(0, 50)}...`
                              : request.dia_chi}
                          </p>
                        )}
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

      {/* How it works */}
      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-semibold text-green-900 dark:text-green-200 mb-3">
              Cách hoạt động
            </h3>
            <ol className="text-sm md:text-base text-green-800 dark:text-green-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold flex-shrink-0">1.</span>
                <span>Tạo yêu cầu cứu trợ với thông tin cụ thể về loại hỗ trợ và số người cần giúp đỡ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold flex-shrink-0">2.</span>
                <span>Hệ thống sẽ tự động xử lý và phân phối nguồn lực phù hợp nhất</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold flex-shrink-0">3.</span>
                <span>Tình nguyện viên sẽ đến địa điểm để hỗ trợ bạn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold flex-shrink-0">4.</span>
                <span>Theo dõi trạng thái yêu cầu thời gian thực trên trang trạng thái</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
