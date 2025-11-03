"use client";

import { useAuthStore } from "@/store/authStore";
import { Bell, LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    logout();
    router.push("/");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      <div className="flex-1" />

      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.ho_va_ten}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

