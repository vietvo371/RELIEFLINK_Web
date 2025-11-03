import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

type DistributionFilters = {
  trang_thai?: string;
};

export type AdminDistribution = {
  id: number;
  trang_thai: string;
  ma_giao_dich?: string | null;
  thoi_gian_xuat?: string | null;
  thoi_gian_giao?: string | null;
  yeu_cau: {
    id: number;
    loai_yeu_cau: string;
    do_uu_tien: string;
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
    trung_tam?: {
      id: number;
      ten_trung_tam: string;
      dia_chi: string;
      vi_do?: number | null;
      kinh_do?: number | null;
    } | null;
  };
  tinh_nguyen_vien?: {
    id: number;
    ho_va_ten?: string | null;
    email?: string | null;
    so_dien_thoai?: string | null;
  } | null;
  nhat_ky_blockchains: Array<{
    id: number;
    ma_giao_dich: string;
    hanh_dong: string;
    thoi_gian: string;
  }>;
};

type DistributionsResponse = {
  distributions: AdminDistribution[];
};

type CreateDistributionPayload = {
  id_yeu_cau: number;
  id_nguon_luc: number;
  id_tinh_nguyen_vien: number;
  trang_thai: string;
  thoi_gian_xuat?: string | null;
};

type UpdateDistributionPayload = {
  trang_thai?: string;
  thoi_gian_giao?: string | null;
};

export function useDistributions(filters?: DistributionFilters) {
  const { error: showError } = useToast();
  const params = new URLSearchParams();
  if (filters?.trang_thai) params.append("trang_thai", filters.trang_thai);

  return useQuery<DistributionsResponse>({
    queryKey: ["distributions", filters],
    queryFn: async () => {
      const res = await fetch(`/api/distributions?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lỗi khi lấy danh sách phân phối");
      }
      return res.json();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}

export function useCreateDistribution() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateDistributionPayload) => {
      const res = await fetch("/api/distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi tạo phân phối");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      success("✅ Tạo phân phối thành công!");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}

export function useUpdateDistribution(id: number) {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateDistributionPayload) => {
      const res = await fetch(`/api/distributions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi cập nhật phân phối");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      success("✅ Cập nhật phân phối thành công!");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}
