import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  ho_va_ten: string;
  email: string;
  vai_tro: string;
  so_dien_thoai?: string | null;
  hinh_anh?: string | null;
  vi_do?: number | null;
  kinh_do?: number | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),
      setToken: (token) => set({ token }),
      login: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () => {
        // Clear cookie
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "relieflink-auth",
    },
  ),
);

