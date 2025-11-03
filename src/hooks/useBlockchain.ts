import { useQuery } from "@tanstack/react-query";

export function useBlockchainLogs(id_phan_phoi?: number) {
  const params = new URLSearchParams();
  if (id_phan_phoi) params.append("id_phan_phoi", id_phan_phoi.toString());

  return useQuery({
    queryKey: ["blockchain-logs", id_phan_phoi],
    queryFn: async () => {
      const res = await fetch(`/api/blockchain?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch blockchain logs");
      return res.json();
    },
  });
}

