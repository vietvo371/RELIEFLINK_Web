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
  getPriorityColor,
  getRequestStatusColor,
  translateApprovalStatus,
  translateMatchingStatus,
  translatePriority,
  translateRequestStatus,
} from "@/lib/translations";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  RefreshCcw,
  Package,
  FileCheck,
  Truck,
  Users,
  MapPin,
  Calendar,
  Eye,
  TrendingUp,
  Filter,
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
  nguon_luc_match?: {
    id?: number;
    ten_nguon_luc?: string | null;
    trung_tam?: {
      ten_trung_tam?: string | null;
    };
  };
  phan_phois?: Array<{
    id: number;
    nguon_luc?: { ten_nguon_luc?: string | null };
    tinh_nguyen_vien?: { ho_va_ten?: string | null };
    trang_thai: string;
  }>;
};

type StatusFilter = "all" | "pending" | "approved" | "in_progress" | "completed" | "rejected";

export default function CitizenStatusPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success: showSuccess } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

  // Filter requests based on status filter
  const filteredRequests = useMemo(() => {
    if (!requestsData?.requests) return [];
    const requests = requestsData.requests as WorkflowRequest[];

    switch (statusFilter) {
      case "pending":
        return requests.filter((r) => r.trang_thai_phe_duyet === "cho_phe_duyet");
      case "approved":
        return requests.filter((r) => r.trang_thai_phe_duyet === "da_phe_duyet");
      case "in_progress":
        return requests.filter(
          (r) =>
            r.trang_thai_phe_duyet === "da_phe_duyet" &&
            (r.trang_thai_matching === "da_match" || r.phan_phois?.length > 0) &&
            r.trang_thai !== "hoan_thanh"
        );
      case "completed":
        return requests.filter((r) => r.trang_thai === "hoan_thanh");
      case "rejected":
        return requests.filter((r) => r.trang_thai_phe_duyet === "tu_choi");
      default:
        return requests;
    }
  }, [requestsData, statusFilter]);

  // Statistics
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

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật trạng thái");
  };

  // Get workflow steps for a request
  const getWorkflowSteps = (request: WorkflowRequest) => {
    const steps = [
      {
        id: 1,
        name: "Đã gửi yêu cầu",
        status: "completed",
        date: request.created_at,
        icon: <FileCheck className="w-5 h-5" />,
      },
      {
        id: 2,
        name: "Phê duyệt",
        status:
          request.trang_thai_phe_duyet === "da_phe_duyet"
            ? "completed"
            : request.trang_thai_phe_duyet === "tu_choi"
            ? "rejected"
            : "pending",
        date: request.thoi_gian_phe_duyet,
        icon: <CheckCircle className="w-5 h-5" />,
        reason: request.ly_do_tu_choi,
      },
      {
        id: 3,
        name: "Matching nguồn lực",
        status:
          request.trang_thai_matching === "da_match"
            ? "completed"
            : request.trang_thai_matching === "khong_match"
            ? "rejected"
            : request.trang_thai_phe_duyet === "da_phe_duyet"
            ? "pending"
            : "waiting",
        date: request.trang_thai_matching === "da_match" ? request.updated_at : null,
        icon: <Package className="w-5 h-5" />,
      },
      {
        id: 4,
        name: "Phân phối",
        status:
          request.phan_phois && request.phan_phois.length > 0
            ? request.phan_phois.some((p) => p.trang_thai === "da_phan_phoi")
              ? "completed"
              : "in_progress"
            : request.trang_thai_matching === "da_match"
            ? "pending"
            : "waiting",
        date:
          request.phan_phois?.find((p) => p.trang_thai === "da_phan_phoi")?.trang_thai ===
          "da_phan_phoi"
            ? request.updated_at
            : null,
        icon: <Truck className="w-5 h-5" />,
      },
      {
        id: 5,
        name: "Hoàn thành",
        status: request.trang_thai === "hoan_thanh" ? "completed" : "waiting",
        date: request.trang_thai === "hoan_thanh" ? request.updated_at : null,
        icon: <CheckCircle className="w-5 h-5" />,
      },
    ];
    return steps;
  };

  // Get step color
  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "rejected":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "in_progress":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      default:
        return "text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải trạng thái...</p>
        </div>
      </div>
    );
  }

  const requests = filteredRequests as WorkflowRequest[];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Trạng thái cứu trợ
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi tiến độ xử lý yêu cầu của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            defaultValue={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "pending", label: "Chờ phê duyệt" },
              { value: "approved", label: "Đã phê duyệt" },
              { value: "in_progress", label: "Đang xử lý" },
              { value: "completed", label: "Hoàn thành" },
              { value: "rejected", label: "Từ chối" },
            ]}
            className="w-full sm:w-auto"
          />
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Tổng cộng
              </span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Chờ phê duyệt
              </span>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Đã phê duyệt
              </span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Đang xử lý
              </span>
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Hoàn thành
              </span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Từ chối
              </span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-center">
            <Eye className="w-16 h-16 md:w-20 md:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {stats.total === 0 ? "Chưa có yêu cầu nào" : "Không tìm thấy yêu cầu nào"}
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
              {stats.total === 0
                ? "Hãy tạo yêu cầu cứu trợ nếu bạn cần hỗ trợ"
                : "Thử thay đổi bộ lọc để xem các yêu cầu khác"}
            </p>
            {stats.total === 0 && (
              <Button
                onClick={() => router.push("/citizen/my-requests")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Tạo yêu cầu đầu tiên
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {requests.map((request) => {
            const steps = getWorkflowSteps(request);
            const currentStep = steps.findIndex(
              (s) => s.status === "pending" || s.status === "in_progress"
            );

            return (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700"
              >
                {/* Request Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        Yêu cầu #{request.id}
                      </h3>
                      <Badge
                        color={getPriorityColor(request.do_uu_tien) as any}
                        size="sm"
                      >
                        {translatePriority(request.do_uu_tien)}
                      </Badge>
                    </div>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-1">
                      {request.loai_yeu_cau || "Yêu cầu cứu trợ"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {request.so_nguoi} người
                      </span>
                      {request.dia_chi && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {request.dia_chi.length > 30
                            ? `${request.dia_chi.substring(0, 30)}...`
                            : request.dia_chi}
                        </span>
                      )}
                      {request.created_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(request.created_at), "dd/MM/yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
                    <Button
                      onClick={() => router.push(`/citizen/my-requests/${request.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Chi tiết</span>
                      <span className="sm:hidden">Xem</span>
                    </Button>
                  </div>
                </div>

                {/* Workflow Timeline */}
                <div className="relative">
                  <div className="space-y-4">
                    {steps.map((step, index) => {
                      const isActive = index === currentStep;
                      const isCompleted = step.status === "completed";
                      const isRejected = step.status === "rejected";
                      const isWaiting = step.status === "waiting";

                      return (
                        <div key={step.id} className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${getStepColor(
                              step.status
                            )}`}
                          >
                            {step.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={`text-sm md:text-base font-medium ${
                                  isWaiting
                                    ? "text-gray-400"
                                    : isRejected
                                    ? "text-red-600 dark:text-red-400"
                                    : isCompleted
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {step.name}
                              </p>
                              {isCompleted && (
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              )}
                              {isRejected && (
                                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              )}
                              {(step.status === "pending" || step.status === "in_progress") && (
                                <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 animate-pulse" />
                              )}
                            </div>
                            {step.date && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {format(new Date(step.date), "dd/MM/yyyy HH:mm")}
                              </p>
                            )}
                            {step.reason && (
                              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-2 mt-1">
                                Lý do: {step.reason}
                              </p>
                            )}
                            {step.id === 3 && request.nguon_luc_match && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Đã match: {request.nguon_luc_match.ten_nguon_luc}
                                {request.nguon_luc_match.trung_tam?.ten_trung_tam &&
                                  ` - ${request.nguon_luc_match.trung_tam.ten_trung_tam}`}
                              </p>
                            )}
                            {step.id === 4 &&
                              request.phan_phois &&
                              request.phan_phois.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {request.phan_phois.map((pp) => (
                                    <p
                                      key={pp.id}
                                      className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"
                                    >
                                      <Package className="w-3 h-3" />
                                      {pp.nguon_luc?.ten_nguon_luc} -{" "}
                                      {pp.trang_thai === "da_phan_phoi"
                                        ? "Đã phân phối"
                                        : pp.trang_thai === "dang_phan_phoi"
                                        ? "Đang phân phối"
                                        : "Chờ phân phối"}
                                      {pp.tinh_nguyen_vien?.ho_va_ten &&
                                        ` (${pp.tinh_nguyen_vien.ho_va_ten})`}
                                    </p>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
