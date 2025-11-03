import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

type RequestFilters = { trang_thai?: string; do_uu_tien?: string };

type RequestsResponse = {
  requests: unknown[];
};

type CreateRequestPayload = {
  loai_yeu_cau: string;
  mo_ta?: string | null;
  so_nguoi: number;
  do_uu_tien: string;
  trang_thai: string;
  vi_do: number | null;
  kinh_do: number | null;
  id_nguoi_dung?: number;
};

type UpdateRequestPayload = {
  do_uu_tien?: string;
  trang_thai?: string;
  vi_do?: number | null;
  kinh_do?: number | null;
};

export function useRequests(filters?: RequestFilters) {
  const { error: showError } = useToast();
  const params = new URLSearchParams();
  if (filters?.trang_thai) params.append("trang_thai", filters.trang_thai);
  if (filters?.do_uu_tien) params.append("do_uu_tien", filters.do_uu_tien);

  return useQuery<RequestsResponse>({
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
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateRequestPayload) => {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Lỗi khi tạo yêu cầu";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // ignore parse error and fallback to default message
        }
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err: Error) => {
      showError(err.message || "Lỗi khi tạo yêu cầu");
    },
  });
}

export function useUpdateRequest(id: number) {
  const queryClient = useQueryClient();
  const { error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateRequestPayload) => {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "Lỗi khi cập nhật yêu cầu";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err: Error) => {
      showError(err.message || "Lỗi khi cập nhật yêu cầu");
    },
  });
}
