"use client";

import { Brain } from "lucide-react";

export default function AdminAIPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dự báo AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Phân tích và dự đoán nhu cầu cứu trợ
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div className="text-center">
          <Brain className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Trang dự báo AI
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Chức năng đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
}

