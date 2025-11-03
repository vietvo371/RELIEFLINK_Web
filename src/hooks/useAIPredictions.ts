import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export type AIPrediction = {
  id: number;
  tinh_thanh: string;
  loai_thien_tai: string;
  du_doan_nhu_cau_thuc_pham: number;
  du_doan_nhu_cau_nuoc: number;
  du_doan_nhu_cau_thuoc: number;
  du_doan_nhu_cau_cho_o: number;
  ngay_du_bao: string;
  created_at?: string;
};

type PredictionsResponse = {
  predictions: AIPrediction[];
};

export function useAIPredictions(tinhThanh?: string, generate?: boolean) {
  const { error: showError } = useToast();
  const params = new URLSearchParams();
  if (tinhThanh) params.append("tinh_thanh", tinhThanh);
  if (generate) params.append("generate", "true");

  return useQuery<PredictionsResponse>({
    queryKey: ["ai-predictions", tinhThanh, generate],
    queryFn: async () => {
      const res = await fetch(`/api/ai?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lỗi khi tải dự báo AI");
      }
      return res.json();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}
