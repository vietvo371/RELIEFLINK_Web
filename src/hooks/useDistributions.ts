import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useDistributions(filters?: { trang_thai?: string }) {
  const params = new URLSearchParams();
  if (filters?.trang_thai) params.append("trang_thai", filters.trang_thai);

  return useQuery({
    queryKey: ["distributions", filters],
    queryFn: async () => {
      const res = await fetch(`/api/distributions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch distributions");
      return res.json();
    },
  });
}

export function useCreateDistribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create distribution");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
    },
  });
}

export function useUpdateDistribution(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/distributions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update distribution");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
    },
  });
}

