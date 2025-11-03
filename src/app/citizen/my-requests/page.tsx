"use client";

import { FileText, Plus } from "lucide-react";

export default function CitizenRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Yêu cầu của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi các yêu cầu cứu trợ của bạn
          </p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tạo yêu cầu mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
        <div className="text-center">
          <FileText className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chưa có yêu cầu nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hãy tạo yêu cầu cứu trợ nếu bạn cần hỗ trợ
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Tạo yêu cầu đầu tiên
          </button>
        </div>
      </div>
    </div>
  );
}

