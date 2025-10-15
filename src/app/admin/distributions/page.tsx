"use client";

import { Truck } from "lucide-react";

export default function AdminDistributionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý phân phối
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi tiến độ phân phối và vận chuyển
          </p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          + Thêm phân phối
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div className="text-center">
          <Truck className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Trang quản lý phân phối
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Chức năng đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
}

