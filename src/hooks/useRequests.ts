import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export function useRequests(filters?: { trang_thai?: string; do_uu_tien?: string }) {
  const { error: showError } = useToast();
  const params = new URLSearchParams();
  if (filters?.trang_thai) params.append("trang_thai", filters.trang_thai);
  if (filters?.do_uu_tien) params.append("do_uu_tien", filters.do_uu_tien);

  return useQuery({
    queryKey: ["requests", filters],
    queryFn: async () => {
      const res = await fetch(`/api/requests?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Lỗi khi tải danh sách yêu cầu");
      }
      return res.json();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  } as any);
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi khi tạo yêu cầu");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      success("✅ Tạo yêu cầu cứu trợ thành công!");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}

export function useUpdateRequest(id: number) {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi khi cập nhật yêu cầu");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      success("✅ Cập nhật yêu cầu thành công!");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}

