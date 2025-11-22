"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/context/ToastContext";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import {
  Bell,
  RefreshCcw,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Truck,
  Package,
  Trash2,
  CheckCheck,
} from "lucide-react";

type Notification = {
  id: number;
  tieu_de: string;
  noi_dung: string;
  loai: string;
  da_doc: boolean;
  created_at: string;
  nguoi_gui?: {
    ho_va_ten?: string | null;
    vai_tro?: string | null;
  } | null;
  yeu_cau?: {
    id: number;
    loai_yeu_cau?: string | null;
  } | null;
};

type FilterType = "all" | "unread" | "read";

export default function VolunteerNotificationsPage() {
  const { user } = useAuthStore();
  const { success: showSuccess, error: showError } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ["notifications", { unread: filter === "unread" }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", "50");
      if (filter === "unread") {
        params.append("unread", "true");
      }
      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi tải thông báo");
      }
      return res.json();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi đánh dấu đã đọc");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showSuccess("Đã đánh dấu đã đọc");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", {
        method: "PUT",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi đánh dấu tất cả đã đọc");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showSuccess("Đã đánh dấu tất cả đã đọc");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  // Handle refresh
  const handleRefresh = () => {
    refetch();
    showSuccess("Đã cập nhật thông báo");
  };

  // Get notification icon
  const getNotificationIcon = (loai: string) => {
    switch (loai) {
      case "khan_cap":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "phan_phoi":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "nguon_luc":
        return <Package className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  // Filter notifications
  const filteredNotifications = (notificationsData?.notifications || []).filter(
    (notif: Notification) => {
      if (filter === "all") return true;
      if (filter === "unread") return !notif.da_doc;
      if (filter === "read") return notif.da_doc;
      return true;
    }
  ) as Notification[];

  const unreadCount = notificationsData?.unreadCount || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  const notifications = filteredNotifications;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Thông báo
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Xem và quản lý thông báo của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge color="error" size="md">
              {unreadCount} chưa đọc
            </Badge>
          )}
          <Select
            defaultValue={filter}
            onChange={(value) => setFilter(value as FilterType)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "unread", label: "Chưa đọc" },
              { value: "read", label: "Đã đọc" },
            ]}
            className="w-full sm:w-auto"
          />
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              variant="outline"
              size="sm"
              disabled={markAllAsReadMutation.isPending}
              startIcon={<CheckCheck className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Đọc tất cả</span>
            </Button>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div className="text-center">
            <Bell className="w-16 h-16 md:w-20 md:h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Không có thông báo nào
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              {filter === "unread"
                ? "Bạn không còn thông báo chưa đọc"
                : "Bạn sẽ nhận được thông báo khi có cập nhật mới"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border transition-colors ${
                notification.da_doc
                  ? "border-gray-200 dark:border-gray-700"
                  : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.loai)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`text-base md:text-lg font-semibold ${
                          notification.da_doc
                            ? "text-gray-900 dark:text-white"
                            : "text-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {notification.tieu_de}
                      </h3>
                      {!notification.da_doc && (
                        <Badge color="error" size="sm">
                          Mới
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 whitespace-pre-wrap break-words">
                      {notification.noi_dung}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                      <span>{format(new Date(notification.created_at), "dd/MM/yyyy HH:mm")}</span>
                      {notification.nguoi_gui && (
                        <span>
                          Từ: {notification.nguoi_gui.ho_va_ten || "Hệ thống"}
                        </span>
                      )}
                      {notification.yeu_cau && (
                        <span>Yêu cầu: {notification.yeu_cau.loai_yeu_cau}</span>
                      )}
                    </div>
                  </div>
                </div>
                {!notification.da_doc && (
                  <Button
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                    variant="outline"
                    size="sm"
                    disabled={markAsReadMutation.isPending}
                    className="flex-shrink-0"
                    startIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">Đã đọc</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

