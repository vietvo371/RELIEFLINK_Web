"use client";

import { Truck } from "lucide-react";

export default function VolunteerTasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nhiệm vụ của tôi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Các phân phối được giao và đang thực hiện
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div className="text-center">
          <Truck className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chưa có nhiệm vụ nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Bạn sẽ nhận được thông báo khi có nhiệm vụ mới
          </p>
        </div>
      </div>
    </div>
  );
}

