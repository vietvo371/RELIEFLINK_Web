import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAIPredictions(generate: boolean = false) {
  return useQuery({
    queryKey: ["ai-predictions", generate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (generate) params.append("generate", "true");
      
      const res = await fetch(`/api/ai?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch predictions");
      return res.json();
    },
  });
}

export function useGeneratePredictions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate_multiple: true }),
      });
      if (!res.ok) throw new Error("Failed to generate predictions");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-predictions"] });
    },
  });
}

