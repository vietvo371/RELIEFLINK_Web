"use client";

import { useAuthStore } from "@/store/authStore";
import { Users, FileText, CheckCircle, Clock, Plus } from "lucide-react";

export default function CitizenDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Xin chào, {user?.ho_va_ten}!</h1>
            <p className="text-green-100 mt-1">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn khi cần
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
                Yêu cầu của tôi
              </p>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <FileText className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Đang xử lý
              </p>
              <p className="text-3xl font-bold text-orange-600">0</p>
            </div>
            <Clock className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Đã hoàn thành
              </p>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Bạn cần hỗ trợ?
        </h2>
        <button className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-colors font-semibold">
          <Plus className="w-6 h-6" />
          Tạo yêu cầu cứu trợ mới
        </button>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3">
          Chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian sớm nhất
        </p>
      </div>

      {/* My Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Yêu cầu gần đây
        </h2>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Bạn chưa có yêu cầu cứu trợ nào
          </p>
          <button className="mt-4 text-green-600 hover:text-green-700 font-medium">
            Tạo yêu cầu đầu tiên →
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Users className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
              Cách hoạt động
            </h3>
            <ol className="text-sm text-green-800 dark:text-green-300 space-y-2">
              <li>1. Tạo yêu cầu cứu trợ với thông tin cụ thể</li>
              <li>2. Hệ thống sẽ xử lý và phân phối nguồn lực</li>
              <li>3. Tình nguyện viên sẽ đến hỗ trợ bạn</li>
              <li>4. Theo dõi trạng thái thời gian thực</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

