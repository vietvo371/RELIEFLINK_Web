import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useRequests(filters?: { trang_thai?: string; do_uu_tien?: string }) {
  const params = new URLSearchParams();
  if (filters?.trang_thai) params.append("trang_thai", filters.trang_thai);
  if (filters?.do_uu_tien) params.append("do_uu_tien", filters.do_uu_tien);

  return useQuery({
    queryKey: ["requests", filters],
    queryFn: async () => {
      const res = await fetch(`/api/requests?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useUpdateRequest(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

