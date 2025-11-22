/**
 * Notifications & Workflow Hooks
 * Quản lý thông báo và workflow phê duyệt
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi, useApiStrict } from "./useApi";

// Types
export interface Notification {
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
}

export interface ApprovalRequest {
  approved: boolean;
  reason?: string;
}

export interface EmergencyAlert {
  message: string;
  area: {
    lat: number;
    lng: number;
    radius: number;
  };
}

/**
 * Hook để lấy danh sách thông báo
 */
export function useNotifications(limit = 20, unreadOnly = false) {
  const api = useApi();

  return useQuery({
    queryKey: ["notifications", limit, unreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(unreadOnly && { unread: "true" }),
      });
      
      const response = await api.get(`/api/notifications?${params}`);
      return response as {
        notifications: Notification[];
        unreadCount: number;
      };
    },
    refetchInterval: 30000, // Refresh every 30s for real-time effect
  });
}

/**
 * Hook để đếm thông báo chưa đọc
 */
export function useUnreadNotifications() {
  const api = useApi();

  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: async () => {
      const response = await api.get("/api/notifications?unread=true&limit=1");
      return response as { unreadCount: number };
    },
    refetchInterval: 15000, // Check every 15s
  });
}

/**
 * Hook để đánh dấu thông báo đã đọc
 */
export function useMarkNotificationsRead() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: number[]) => {
      return await api.put("/api/notifications/mark-read", { notificationIds });
    },
    onSuccess: () => {
      // Refresh notifications và unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
}

/**
 * Hook để phê duyệt/từ chối yêu cầu
 */
export function useApproveRequest() {
  const api = useApiStrict();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, data }: { requestId: number; data: ApprovalRequest }) => {
      console.log('useApproveRequest - Calling API:', { requestId, data });
      
      const result = await api.put(`/api/requests/${requestId}/approve`, data, {
        showSuccessToast: false, // Disable auto toast, handle manually in component
        showErrorToast: true,
      });
      
      console.log('useApproveRequest - API Response:', result);
      return result;
    },
    onSuccess: () => {
      // Refresh requests và notifications
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    retry: false, // Disable retry to prevent multiple calls
  });
}

/**
 * Hook để gửi thông báo khẩn cấp
 */
export function useSendEmergencyAlert() {
  const api = useApiStrict();

  return useMutation({
    mutationFn: async (data: EmergencyAlert) => {
      return await api.post("/api/notifications/emergency", data, {
        showSuccessToast: true,
        successMessage: "Đã gửi thông báo khẩn cấp thành công"
      });
    },
  });
}

/**
 * Hook để lấy requests cần phê duyệt (chỉ Admin)
 */
export function usePendingApprovalRequests() {
  const api = useApi();

  return useQuery({
    queryKey: ["requests-pending-approval"],
    queryFn: async () => {
      const params = new URLSearchParams({
        trang_thai_phe_duyet: "cho_phe_duyet",
        sortBy: "priority",
        sortOrder: "desc",
      });
      
      const response = await api.get(`/api/requests?${params}`);
      return response.requests || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook để lấy requests đã được phê duyệt và ready for matching
 */
export function useApprovedRequests() {
  const api = useApi();

  return useQuery({
    queryKey: ["requests-approved"],
    queryFn: async () => {
      const params = new URLSearchParams({
        trang_thai_phe_duyet: "da_phe_duyet",
        trang_thai: "da_phe_duyet",
        sortBy: "priority",
        sortOrder: "desc",
      });
      
      const response = await api.get(`/api/requests?${params}`);
      return response.requests || [];
    },
  });
}

/**
 * Hook để force update priority cho tất cả requests (Admin only)
 */
export function useBatchUpdatePriorities() {
  const api = useApiStrict();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await api.post("/api/requests/batch-update-priorities", {}, {
        showSuccessToast: true,
        successMessage: "Đã cập nhật priority cho tất cả requests"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

/**
 * Hook để manually trigger auto-matching cho request đã được phê duyệt
 */
export function useTriggerAutoMatch() {
  const api = useApiStrict();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: number) => {
      const result = await api.post(`/api/requests/${requestId}/auto-match`, {}, {
        showSuccessToast: false, // Handle manually in component
        showErrorToast: true,
      });
      return result;
    },
    onSuccess: () => {
      // Refresh requests để hiển thị kết quả matching
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["requests-approved"] });
    },
    retry: false,
  });
}