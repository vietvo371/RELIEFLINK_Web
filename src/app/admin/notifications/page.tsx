"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, CheckCircle2, XCircle, AlertTriangle, Package, UserCheck, Eye } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminLoading from "@/components/admin/AdminLoading";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

type FilterType = "all" | "unread" | "read";

type Notification = {
  id: number;
  id_nguoi_gui: number;
  id_nguoi_nhan: number;
  id_yeu_cau?: number;
  loai_thong_bao: string;
  tieu_de: string;
  noi_dung: string;
  da_doc: boolean;
  created_at: string;
  nguoi_gui: {
    ho_va_ten: string;
    vai_tro: string;
  };
  yeu_cau?: {
    id: number;
    loai_yeu_cau: string;
  };
};

export default function AdminNotificationsPage() {
  const { success: showSuccess, error: showError } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>("all");

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ["notifications", { unread: filter === "unread" }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", "100");
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

  const notifications = (notificationsData?.notifications || []) as Notification[];
  const unreadCount = notificationsData?.unreadCount || 0;

  // Filter notifications
  const filteredNotifications = notifications.filter((notif: Notification) => {
    if (filter === "unread") return !notif.da_doc;
    if (filter === "read") return notif.da_doc;
    return true;
  });

  // Get notification icon
  const getNotificationIcon = (loai: string) => {
    switch (loai) {
      case "yeu_cau_moi":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "phe_duyet":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "tu_choi":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "phan_phoi":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "khan_cap":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get notification color
  const getNotificationColor = (loai: string) => {
    switch (loai) {
      case "khan_cap":
        return "error";
      case "yeu_cau_moi":
        return "warning";
      case "phe_duyet":
        return "success";
      case "tu_choi":
        return "error";
      case "phan_phoi":
        return "info";
      default:
        return "info";
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thông báo"
        description={`Quản lý và theo dõi tất cả thông báo trong hệ thống. ${unreadCount > 0 ? `Có ${unreadCount} thông báo chưa đọc.` : ""}`}
        actions={[
          {
            label: unreadCount > 0 ? `Đánh dấu tất cả đã đọc (${unreadCount})` : "Tất cả đã đọc",
            variant: "outline",
            onClick: () => markAllAsReadMutation.mutate(),
            disabled: unreadCount === 0 || markAllAsReadMutation.isPending,
          },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng thông báo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chưa đọc</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đã đọc</p>
              <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "primary" : "outline"}
          onClick={() => setFilter("all")}
        >
          Tất cả ({notifications.length})
        </Button>
        <Button
          size="sm"
          variant={filter === "unread" ? "primary" : "outline"}
          onClick={() => setFilter("unread")}
        >
          Chưa đọc ({unreadCount})
        </Button>
        <Button
          size="sm"
          variant={filter === "read" ? "primary" : "outline"}
          onClick={() => setFilter("read")}
        >
          Đã đọc ({notifications.length - unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <AdminLoading variant="section" label="Đang tải thông báo..." className="min-h-[400px]" />
      ) : filteredNotifications.length === 0 ? (
        <AdminEmptyState
          icon={<Bell className="h-6 w-6" aria-hidden />}
          title={filter === "unread" ? "Không có thông báo chưa đọc" : "Không có thông báo nào"}
          description={
            filter === "unread"
              ? "Tất cả thông báo đã được đọc."
              : "Bạn chưa có thông báo nào trong hệ thống."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 transition-colors ${
                !notification.da_doc
                  ? "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-l-blue-400"
                  : "border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900/60"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.loai_thong_bao)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-sm font-semibold ${
                            !notification.da_doc ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {notification.tieu_de}
                        </h3>
                        {!notification.da_doc && (
                          <Badge color="info" variant="light" size="sm">
                            Mới
                          </Badge>
                        )}
                        <Badge color={getNotificationColor(notification.loai_thong_bao)} variant="light" size="sm">
                          {notification.loai_thong_bao === "khan_cap" ? "Khẩn cấp" : notification.loai_thong_bao}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                        {notification.noi_dung}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Từ: {notification.nguoi_gui?.ho_va_ten || "Hệ thống"} ({notification.nguoi_gui?.vai_tro || "admin"})
                      </span>
                      {notification.yeu_cau && (
                        <span>Yêu cầu: {notification.yeu_cau.loai_yeu_cau}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(notification.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                      {!notification.da_doc && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          startIcon={<Eye className="h-4 w-4" />}
                        >
                          Đánh dấu đã đọc
                        </Button>
                      )}
                    </div>
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

