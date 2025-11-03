import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export type AdminUser = {
  id: number;
  ho_va_ten: string;
  email: string;
  so_dien_thoai?: string | null;
  vai_tro: string;
  created_at: string;
};

type UsersResponse = {
  users: AdminUser[];
};

export function useUsers(role?: string) {
  const { error: showError } = useToast();
  const params = new URLSearchParams();
  if (role) params.append("vai_tro", role);

  return useQuery<UsersResponse>({
    queryKey: ["users", role],
    queryFn: async () => {
      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lỗi khi tải danh sách người dùng");
      }
      return res.json();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });
}
