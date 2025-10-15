"use client";

import { FileText } from "lucide-react";

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản lý yêu cầu cứu trợ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi và xử lý tất cả yêu cầu cứu trợ
          </p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          + Thêm yêu cầu
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div className="text-center">
          <FileText className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Trang quản lý yêu cầu
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Chức năng đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
}

