import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export function useCenters() {
  const { error: showError } = useToast();

  return useQuery({
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
  } as any);
}

export function useCreateCenter() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
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
