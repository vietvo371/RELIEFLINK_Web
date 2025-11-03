"use client";

import { useAuthStore } from "@/store/authStore";
import { User, Mail, Phone, Shield } from "lucide-react";

export default function AdminProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.ho_va_ten.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.ho_va_ten}
            </h2>
            <p className="text-green-600 font-medium">Administrator</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Mail className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Phone className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Số điện thoại
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.so_dien_thoai || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Shield className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vai trò</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user.vai_tro === "admin"
                  ? "Quản trị viên"
                  : user.vai_tro === "tinh_nguyen_vien"
                  ? "Tình nguyện viên"
                  : "Người dân"}
              </p>
            </div>
          </div>
        </div>

        <button className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors">
          Cập nhật thông tin
        </button>
      </div>
    </div>
  );
}

