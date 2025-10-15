"use client";

import { useAuthStore } from "@/store/authStore";
import { User, Mail, Phone, MapPin, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          Không tìm thấy thông tin người dùng
        </p>
      </div>
    );
  }

  const getRoleText = (role: string) => {
    if (role === "admin") return "Quản trị viên";
    if (role === "tinh_nguyen_vien") return "Tình nguyện viên";
    return "Người dân";
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === "admin") return "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    if (role === "tinh_nguyen_vien") return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Thông tin tài khoản của bạn
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-green-600 to-green-900" />

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-2 shadow-lg">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="ml-6 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.ho_va_ten}
              </h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadgeColor(user.vai_tro)}`}>
                <Shield className="w-4 h-4 inline mr-1" />
                {getRoleText(user.vai_tro)}
              </span>
            </div>
          </div>

          {/* Information grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </p>
                </div>
              </div>

              {user.so_dien_thoai && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Số điện thoại
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.so_dien_thoai}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {(user.vi_do && user.kinh_do) && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vị trí
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.vi_do}, {user.kinh_do}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Yêu cầu đã tạo
          </h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Đã tham gia phân phối
          </h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Điểm đóng góp
          </h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
        </div>
      </div>
    </div>
  );
}

