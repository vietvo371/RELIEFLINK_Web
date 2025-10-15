"use client";

import { useState } from "react";
import { useAIPredictions, useGeneratePredictions } from "@/hooks/useAI";
import { Loader2, RefreshCw, Brain } from "lucide-react";
import PredictionChart from "@/components/relief/PredictionChart";

export default function AIPage() {
  const [generate, setGenerate] = useState(false);
  const { data, isLoading, refetch } = useAIPredictions(generate);
  const generateMutation = useGeneratePredictions();

  const handleGenerate = async () => {
    setGenerate(true);
    await refetch();
    setGenerate(false);
  };

  const handleSaveToDatabase = async () => {
    try {
      await generateMutation.mutateAsync();
      await refetch();
    } catch (error) {
      console.error("Generate predictions error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const predictions = data?.predictions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            Dự báo AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dự đoán nhu cầu cứu trợ dựa trên AI
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Tạo dự báo mới
          </button>
          <button
            onClick={handleSaveToDatabase}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Lưu vào DB
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Dự đoán nhu cầu theo tỉnh thành
        </h2>
        <div className="h-[400px]">
          {predictions.length > 0 ? (
            <PredictionChart data={predictions} type="bar" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">
                Chưa có dữ liệu dự báo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Predictions table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Tỉnh thành
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Loại thảm họa
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Thực phẩm
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Nước
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Thuốc
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                  Chỗ ở
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred: any, index: number) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 dark:border-gray-700 ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                    {pred.tinh_thanh}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs rounded-full">
                      {pred.loai_thien_tai}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                    {pred.du_doan_nhu_cau_thuc_pham.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                    {pred.du_doan_nhu_cau_nuoc.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                    {pred.du_doan_nhu_cau_thuoc.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                    {pred.du_doan_nhu_cau_cho_o.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {predictions.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Không có dự báo nào. Nhấn "Tạo dự báo mới" để bắt đầu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

