import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export type AIPrediction = {
  id?: number;
  tinh_thanh: string;
  loai_thien_tai: string;
  du_doan_nhu_cau_thuc_pham: number;
  du_doan_nhu_cau_nuoc: number;
  du_doan_nhu_cau_thuoc: number;
  du_doan_nhu_cau_cho_o: number;
  ngay_du_bao: string;
  created_at?: string;
  confidence_score?: number;
  method?: string;
  warning?: string;
};

type PredictionsResponse = {
  predictions: AIPrediction[];
};

/**
 * Hook để check AI service health
 */
export function useAIServiceHealth() {
  return useQuery({
    queryKey: ["ai-service-health"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/ai/predict");
        if (!res.ok) {
          return { available: false, status: "unavailable" };
        }
        const health = await res.json();
        return {
          available: health.status === "healthy",
          status: health.status,
          database: health.database,
          models_available: health.models_available,
        };
      } catch (error) {
        return { available: false, status: "unavailable" };
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
  });
}

export function useAIPredictions(
  tinhThanh?: string,
  generate?: boolean,
  usePythonAI: boolean = true // Mặc định sử dụng Python AI nếu available
) {
  const { error: showError } = useToast();
  const { data: healthData } = useAIServiceHealth();

  // Tự động detect xem có nên dùng Python AI không
  const shouldUsePythonAI = usePythonAI && healthData?.available === true;

  const params = new URLSearchParams();
  if (tinhThanh && tinhThanh !== "all") params.append("tinh_thanh", tinhThanh);
  if (generate) params.append("generate", "true");
  if (shouldUsePythonAI && generate) {
    params.append("use_python", "true");
  }

  return useQuery<PredictionsResponse>({
    queryKey: ["ai-predictions", tinhThanh, generate, shouldUsePythonAI],
    queryFn: async () => {
      const res = await fetch(`/api/ai?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lỗi khi tải dự báo AI");
      }
      const data = await res.json();
      return data;
    },
    onError: (err: Error) => {
      showError(err.message);
    },
    enabled: true, // Always enabled
  });
}
