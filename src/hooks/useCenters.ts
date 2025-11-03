import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export type AdminCenter = {
  id: number;
  ten_trung_tam: string;
  dia_chi: string;
  vi_do?: number | null;
  kinh_do?: number | null;
  nguoi_quan_ly?: string | null;
  so_lien_he?: string | null;
  nguon_lucs: Array<{
    id: number;
    ten_nguon_luc: string;
    loai: string;
  }>;
  created_at?: string;
};

type CentersResponse = {
  centers: AdminCenter[];
};

type CreateCenterPayload = {
  ten_trung_tam: string;
  dia_chi: string;
  vi_do?: number | null;
  kinh_do?: number | null;
  nguoi_quan_ly?: string;
  so_lien_he?: string;
};

export function useCenters() {
  const { error: showError } = useToast();

  return useQuery<CentersResponse>({
    queryKey: ["centers"],
    queryFn: async () => {
      const res = await fetch(`/api/centers`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lỗi khi tải danh sách trung tâm");
      }
      return res.json();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}

export function useCreateCenter() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCenterPayload) => {
      const res = await fetch("/api/centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi tạo trung tâm cứu trợ");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["centers"] });
      success("✅ Tạo trung tâm cứu trợ thành công!");
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}
