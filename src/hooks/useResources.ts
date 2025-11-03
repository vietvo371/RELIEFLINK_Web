import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useResources(filters?: { loai?: string; id_trung_tam?: number }) {
  const params = new URLSearchParams();
  if (filters?.loai) params.append("loai", filters.loai);
  if (filters?.id_trung_tam) params.append("id_trung_tam", filters.id_trung_tam.toString());

  return useQuery({
    queryKey: ["resources", filters],
    queryFn: async () => {
      const res = await fetch(`/api/resources?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return res.json();
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create resource");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

