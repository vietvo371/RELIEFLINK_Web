import { useQuery } from "@tanstack/react-query";

export function useUsers(role?: string) {
  const params = new URLSearchParams();
  if (role) params.append("vai_tro", role);

  return useQuery({
    queryKey: ["users", role],
    queryFn: async () => {
      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}
