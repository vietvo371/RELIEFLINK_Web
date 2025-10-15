"use client";

import { useAuthStore } from "@/store/authStore";
import { Heart, Truck, FileText, Award } from "lucide-react";

export default function VolunteerDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Chào mừng, {user?.ho_va_ten}!</h1>
            <p className="text-blue-100 mt-1">
              Cảm ơn bạn đã tham gia làm tình nguyện viên cứu trợ
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Phân phối đã thực hiện
              </p>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <Truck className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Yêu cầu đã xử lý
              </p>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <FileText className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Điểm đóng góp
              </p>
              <p className="text-3xl font-bold text-orange-600">0</p>
            </div>
            <Award className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Hành động nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <FileText className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">
                Xem yêu cầu mới
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kiểm tra yêu cầu cần hỗ trợ
              </p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <Truck className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">
                Nhiệm vụ của tôi
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Xem phân phối được giao
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Heart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Cảm ơn sự đóng góp của bạn!
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Là tình nguyện viên, bạn có thể xem yêu cầu cứu trợ, nhận nhiệm vụ phân phối
              và theo dõi tiến trình hỗ trợ. Mỗi hành động của bạn đều giúp đỡ những người
              cần sự giúp đỡ!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

