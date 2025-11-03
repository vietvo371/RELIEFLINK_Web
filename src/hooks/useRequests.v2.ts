/**
 * useRequests Hook - Version 2 with useApi
 * Example of using the new API utility
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";

export function useRequestsV2(filters?: { trang_thai?: string; do_uu_tien?: string }) {
  const api = useApi();
  
  const params = new URLSearchParams();
  if (filters?.trang_thai) params.append("trang_thai", filters.trang_thai);
  if (filters?.do_uu_tien) params.append("do_uu_tien", filters.do_uu_tien);

  return useQuery({
    queryKey: ["requests", filters],
    queryFn: () => api.get(`/api/requests?${params.toString()}`),
  });
}

export function useCreateRequestV2() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      api.post("/api/requests", data, {
        showSuccessToast: true,
        successMessage: "✅ Tạo yêu cầu cứu trợ thành công!",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useUpdateRequestV2(id: number) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      api.put(`/api/requests/${id}`, data, {
        showSuccessToast: true,
        successMessage: "✅ Cập nhật yêu cầu thành công!",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useDeleteRequest() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/requests/${id}`, {
        showSuccessToast: true,
        successMessage: "✅ Xóa yêu cầu thành công!",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

