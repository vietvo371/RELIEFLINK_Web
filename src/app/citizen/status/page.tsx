"use client";

import { Eye } from "lucide-react";

export default function CitizenStatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Trạng thái cứu trợ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Theo dõi tiến độ xử lý yêu cầu của bạn
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div className="text-center">
          <Eye className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không có trạng thái nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Trạng thái sẽ hiển thị khi bạn có yêu cầu đang xử lý
          </p>
        </div>
      </div>
    </div>
  );
}

